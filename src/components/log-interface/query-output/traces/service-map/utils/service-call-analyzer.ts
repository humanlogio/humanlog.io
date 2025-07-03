import { getColorByIndex } from "@/lib/utils/colors";
import type {
  ServiceCallMap,
  Node,
  Link,
} from "@/components/log-interface/query-output/traces/service-map/types";
import { Span } from "api/js/types/v1/otel_tracing_pb";

/**
 * Analyzes inter-service call relationships for Service Map
 * @param spans Array of spans to analyze
 * @returns ServiceCallMap object with analyzed data and helper functions
 */
export function generateServiceCallMap(spans: Span[]): ServiceCallMap {
  // spanId to service mapping
  const spanToService: { [key: string]: string } = {};

  // Precompute service metadata for performance
  const serviceSpanCounts: { [key: string]: number } = {};
  const serviceTraceIds: { [key: string]: Set<string> } = {};

  spans.forEach((span) => {
    spanToService[span.spanId] = span.serviceName;

    // Count spans per service
    serviceSpanCounts[span.serviceName] =
      (serviceSpanCounts[span.serviceName] || 0) + 1;

    // Collect unique trace IDs per service
    if (!serviceTraceIds[span.serviceName]) {
      serviceTraceIds[span.serviceName] = new Set();
    }
    serviceTraceIds[span.serviceName].add(span.traceId);
  });

  // Service call relationships
  const serviceCalls: { [key: string]: Set<string> } = {}; // caller -> Set of callees
  const serviceCallCounts: { [key: string]: { [key: string]: number } } = {}; // caller -> callee -> count
  const serviceCallDurations: { [key: string]: { [key: string]: number[] } } =
    {}; // caller -> callee -> duration array
  const allServices = new Set<string>();

  spans.forEach((span) => {
    const currentService = span.serviceName;
    allServices.add(currentService);

    // If this span has a parent, find the parent's service
    if (span.parentSpanId && span.parentSpanId !== "") {
      const parentService = spanToService[span.parentSpanId];

      if (parentService && parentService !== currentService) {
        // Parent service calls current service
        if (!serviceCalls[parentService]) {
          serviceCalls[parentService] = new Set();
        }
        serviceCalls[parentService].add(currentService);

        // Count the calls
        if (!serviceCallCounts[parentService]) {
          serviceCallCounts[parentService] = {};
        }
        if (!serviceCallCounts[parentService][currentService]) {
          serviceCallCounts[parentService][currentService] = 0;
        }
        serviceCallCounts[parentService][currentService]++;

        // Collect duration information
        if (!serviceCallDurations[parentService]) {
          serviceCallDurations[parentService] = {};
        }
        if (!serviceCallDurations[parentService][currentService]) {
          serviceCallDurations[parentService][currentService] = [];
        }

        // Calculate duration in milliseconds
        if (span?.duration) {
          const durationMs =
            Number(span.duration.seconds) * 1000 +
            Math.floor(span.duration.nanos / 1_000_000);
          serviceCallDurations[parentService][currentService].push(durationMs);
        }
      }
    }
  });

  // Convert Sets to Arrays for easier consumption
  const serviceCallsArray: { [key: string]: string[] } = {};
  Object.entries(serviceCalls).forEach(([caller, callees]) => {
    serviceCallsArray[caller] = Array.from(callees);
  });

  // Find root services (services that are not called by others)
  const calledServices = new Set<string>();
  Object.values(serviceCallsArray).forEach((callees) => {
    callees.forEach((callee) => calledServices.add(callee));
  });
  const rootServices = Array.from(allServices).filter(
    (service) => !calledServices.has(service),
  );

  // Build hierarchy levels
  const serviceLevels: { [key: string]: number } = {};
  const visited = new Set<string>();

  const assignLevels = (service: string, level: number) => {
    if (visited.has(service)) return;
    visited.add(service);
    serviceLevels[service] = Math.max(serviceLevels[service] || 0, level);

    const callees = serviceCallsArray[service] || [];
    callees.forEach((callee) => {
      assignLevels(callee, level + 1);
    });
  };

  // Start from root services
  rootServices.forEach((rootService) => {
    assignLevels(rootService, 0);
  });

  // Handle any remaining services that might not be connected
  Array.from(allServices).forEach((service) => {
    if (!(service in serviceLevels)) {
      serviceLevels[service] = 0;
    }
  });

  // Generate nodes - convert to map for O(1) lookups
  const nodesArray: Node[] = Array.from(allServices).map((service, index) => ({
    id: service,
    name: service,
    type: "service",
    spanCount: serviceSpanCounts[service],
    color: getColorByIndex(index),
    level: serviceLevels[service] || 0,
  }));

  // Convert nodes array to map for O(1) lookups
  const nodesMap: { [key: string]: Node } = {};
  nodesArray.forEach((node) => {
    nodesMap[node.id] = node;
  });

  // Convert serviceTraceIds from Sets to arrays once
  const serviceTraceIdsArrays = Object.fromEntries(
    Object.entries(serviceTraceIds).map(([service, traceSet]) => [
      service,
      Array.from(traceSet),
    ]),
  );

  const links: Link[] = [];
  Object.entries(serviceCallCounts).forEach(([caller, callees]) => {
    Object.entries(callees).forEach(([callee, count]) => {
      const durations = serviceCallDurations[caller]?.[callee] || [];
      const totalDuration = durations.reduce((sum, d) => sum + d, 0);
      const avgDuration =
        durations.length > 0 ? totalDuration / durations.length : 0;

      links.push({
        source: caller,
        target: callee,
        callCount: count,
        avgDuration,
        totalDuration,
        type: "service-call",
      });
    });
  });

  return {
    // Raw data
    serviceCalls: serviceCallsArray,
    serviceCallCounts,
    allServices: Array.from(allServices),
    rootServices,
    serviceLevels,

    // Precomputed service metadata
    serviceSpanCounts,
    serviceTraceIds: serviceTraceIdsArrays,

    // D3 visualization-ready data
    nodes: nodesArray, // Keep array for backward compatibility
    nodesMap, // New map for O(1) lookups
    links,

    // Helper methods
    getCallers: (service: string) => {
      const callers: string[] = [];
      Object.entries(serviceCallsArray).forEach(([caller, callees]) => {
        if (callees.includes(service)) {
          callers.push(caller);
        }
      });
      return callers;
    },

    getCallees: (service: string) => {
      return serviceCallsArray[service] || [];
    },

    getCallCount: (caller: string, callee: string) => {
      return serviceCallCounts[caller]?.[callee] || 0;
    },

    getAvgDuration: (caller: string, callee: string) => {
      const durations = serviceCallDurations[caller]?.[callee] || [];
      if (durations.length === 0) return 0;
      const total = durations.reduce((sum, d) => sum + d, 0);
      return total / durations.length;
    },

    // New helper methods for precomputed data
    getServiceSpanCount: (service: string) => {
      return serviceSpanCounts[service] || 0;
    },

    getServiceTraceIds: (service: string) => {
      return serviceTraceIdsArrays[service] || [];
    },

    getNode: (serviceId: string) => {
      return nodesMap[serviceId] || null;
    },
  };
}

/**
 * Groups spans by service name
 * @param spans Array of spans
 * @returns Object with serviceName as key and spans array as value
 */
export function groupSpansByService(spans: Span[]): { [key: string]: Span[] } {
  const spansByService: { [key: string]: Span[] } = {};

  spans.forEach((span) => {
    if (!spansByService[span.serviceName]) {
      spansByService[span.serviceName] = [];
    }
    spansByService[span.serviceName].push(span);
  });

  return spansByService;
}
