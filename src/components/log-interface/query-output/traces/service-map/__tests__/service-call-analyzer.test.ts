import { describe, it, expect } from "vitest";
import { Span } from "api/js/types/v1/tracing_pb";
import { Duration, Timestamp } from "@bufbuild/protobuf";
import {
  generateServiceCallMap,
  groupSpansByService,
  getSelectedNodeInfo,
} from "@/components/log-interface/query-output/traces/service-map/utils/service-call-analyzer";

/**
 * @vitest-environment jsdom
 */

describe("service-call-analyzer", () => {
  // Helper functions
  const createTimestamp = (seconds: number): Timestamp => {
    return new Timestamp({ seconds: BigInt(seconds), nanos: 0 });
  };

  const createDuration = (seconds: number): Duration => {
    return new Duration({ seconds: BigInt(seconds), nanos: 0 });
  };

  const createSpan = ({
    id,
    parentId = "",
    name = "test-span",
    service = "test-service",
    traceId = "trace-123",
    startTime = 1000,
    duration = 5,
  }: {
    id: string;
    parentId?: string;
    name?: string;
    service?: string;
    traceId?: string;
    startTime?: number;
    duration?: number;
  }): Span => {
    return new Span({
      spanId: id,
      parentSpanId: parentId,
      name,
      serviceName: service,
      traceId,
      timing: {
        start: createTimestamp(startTime),
        duration: createDuration(duration),
      },
    });
  };

  describe("generateServiceCallMap", () => {
    it("should handle empty spans array", () => {
      const result = generateServiceCallMap([]);

      expect(result.nodes).toHaveLength(0);
      expect(result.links).toHaveLength(0);
      expect(result.allServices).toHaveLength(0);
      expect(result.rootServices).toHaveLength(0);
    });

    it("should handle single service", () => {
      const spans = [createSpan({ id: "span1", service: "service-a" })];

      const result = generateServiceCallMap(spans);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].name).toBe("service-a");
      expect(result.nodes[0].spanCount).toBe(1);
      expect(result.links).toHaveLength(0);
      expect(result.rootServices).toEqual(["service-a"]);
    });

    it("should detect parent-child service relationships", () => {
      const spans = [
        createSpan({
          id: "parent",
          service: "service-a",
          startTime: 1000,
          duration: 10,
        }),
        createSpan({
          id: "child",
          parentId: "parent",
          service: "service-b",
          startTime: 1002,
          duration: 5,
        }),
      ];

      const result = generateServiceCallMap(spans);

      expect(result.nodes).toHaveLength(2);
      expect(result.links).toHaveLength(1);

      const link = result.links[0];
      expect(link.source).toBe("service-a");
      expect(link.target).toBe("service-b");
      expect(link.callCount).toBe(1);
      expect(link.avgDuration).toBe(5000); // 5 seconds in milliseconds

      expect(result.rootServices).toEqual(["service-a"]);
      expect(result.getCallees("service-a")).toEqual(["service-b"]);
      expect(result.getCallers("service-b")).toEqual(["service-a"]);
    });

    it("should handle complex service hierarchy", () => {
      const spans = [
        createSpan({ id: "root", service: "frontend" }),
        createSpan({ id: "gateway", parentId: "root", service: "api-gateway" }),
        createSpan({
          id: "user-svc",
          parentId: "gateway",
          service: "user-service",
        }),
        createSpan({ id: "db1", parentId: "user-svc", service: "database" }),
        createSpan({
          id: "order-svc",
          parentId: "gateway",
          service: "order-service",
        }),
        createSpan({ id: "db2", parentId: "order-svc", service: "database" }),
      ];

      const result = generateServiceCallMap(spans);

      expect(result.nodes).toHaveLength(5); // frontend, api-gateway, user-service, order-service, database
      expect(result.rootServices).toEqual(["frontend"]);

      // Check service levels
      expect(result.serviceLevels["frontend"]).toBe(0);
      expect(result.serviceLevels["api-gateway"]).toBe(1);
      expect(result.serviceLevels["user-service"]).toBe(2);
      expect(result.serviceLevels["order-service"]).toBe(2);
      expect(result.serviceLevels["database"]).toBe(3);

      // Check call relationships
      expect(result.getCallees("frontend")).toEqual(["api-gateway"]);
      expect(result.getCallees("api-gateway")).toEqual([
        "user-service",
        "order-service",
      ]);
      expect(result.getCallees("user-service")).toEqual(["database"]);
      expect(result.getCallees("order-service")).toEqual(["database"]);

      // Database should be called by both user-service and order-service
      const dbCallers = result.getCallers("database");
      expect(dbCallers).toContain("user-service");
      expect(dbCallers).toContain("order-service");
    });

    it("should calculate call counts correctly", () => {
      const spans = [
        createSpan({ id: "root", service: "service-a" }),
        createSpan({ id: "child1", parentId: "root", service: "service-b" }),
        createSpan({ id: "child2", parentId: "root", service: "service-b" }),
        createSpan({ id: "child3", parentId: "root", service: "service-c" }),
      ];

      const result = generateServiceCallMap(spans);

      expect(result.getCallCount("service-a", "service-b")).toBe(2);
      expect(result.getCallCount("service-a", "service-c")).toBe(1);
      expect(result.getCallCount("service-b", "service-a")).toBe(0);
    });

    it("should ignore same-service spans", () => {
      const spans = [
        createSpan({ id: "parent", service: "service-a" }),
        createSpan({ id: "child", parentId: "parent", service: "service-a" }),
      ];

      const result = generateServiceCallMap(spans);

      expect(result.nodes).toHaveLength(1);
      expect(result.links).toHaveLength(0);
      expect(result.nodes[0].spanCount).toBe(2);
    });
  });

  describe("groupSpansByService", () => {
    it("should group spans by service name", () => {
      const spans = [
        createSpan({ id: "span1", service: "service-a" }),
        createSpan({ id: "span2", service: "service-b" }),
        createSpan({ id: "span3", service: "service-a" }),
      ];

      const result = groupSpansByService(spans);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result["service-a"]).toHaveLength(2);
      expect(result["service-b"]).toHaveLength(1);
      expect(result["service-a"][0].spanId).toBe("span1");
      expect(result["service-a"][1].spanId).toBe("span3");
    });

    it("should handle empty spans array", () => {
      const result = groupSpansByService([]);
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe("getSelectedNodeInfo", () => {
    const spans = [
      createSpan({ id: "span1", service: "service-a", traceId: "trace-1" }),
      createSpan({ id: "span2", service: "service-a", traceId: "trace-2" }),
      createSpan({ id: "span3", service: "service-b", traceId: "trace-1" }),
    ];
    const serviceCallMap = generateServiceCallMap(spans);

    it("should return null for null selectedNode", () => {
      const result = getSelectedNodeInfo(null, spans, serviceCallMap);
      expect(result).toBeNull();
    });

    it("should return null for non-existent service", () => {
      const result = getSelectedNodeInfo("non-existent", spans, serviceCallMap);
      expect(result).toBeNull();
    });

    it("should return correct node info for existing service", () => {
      const result = getSelectedNodeInfo("service-a", spans, serviceCallMap);

      expect(result).not.toBeNull();
      expect(result!.node.name).toBe("service-a");
      expect(result!.totalSpans).toBe(2);
      expect(result!.traceIds).toEqual(["trace-1", "trace-2"]);
    });

    it("should handle service with relationships", () => {
      const complexSpans = [
        createSpan({ id: "root", service: "frontend" }),
        createSpan({ id: "api", parentId: "root", service: "api-gateway" }),
        createSpan({ id: "db", parentId: "api", service: "database" }),
      ];
      const complexMap = generateServiceCallMap(complexSpans);

      const result = getSelectedNodeInfo(
        "api-gateway",
        complexSpans,
        complexMap,
      );

      expect(result).not.toBeNull();
      expect(result!.callers).toEqual(["frontend"]);
      expect(result!.callees).toEqual(["database"]);
    });
  });
});
