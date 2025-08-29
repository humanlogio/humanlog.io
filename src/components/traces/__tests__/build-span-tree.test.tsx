import { describe, it, expect } from "vitest";
import { Duration, Timestamp } from "@bufbuild/protobuf";
import { buildSpanTree, SpanTreeNode } from "@/components/traces/utils";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { makeSpanID, spanIdToString } from "@/lib/utils/id-factories";

/**
 * @vitest-environment jsdom
 */

describe("buildSpanTree", () => {
  // Table-driven test cases
  interface ExpectedNode {
    spanId: string;
    parentSpanId: string | undefined;
    depth: number;
    childCount: number;
    children?: ExpectedNode[];
  }

  type TestCase = {
    name: string;
    input: Span[];
    expected: {
      nodeCount: number;
      roots: ExpectedNode[];
    };
  };

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
    startTime = 1000,
    duration = 5,
  }: {
    id: string;
    parentId?: string;
    name?: string;
    service?: string;
    startTime?: number;
    duration?: number;
  }): Span => {
    return new Span({
      spanId: makeSpanID(id),
      parentSpanId: parentId ? makeSpanID(parentId) : undefined,
      name,
      serviceName: service,
      time: createTimestamp(startTime),
      duration: createDuration(duration),
    });
  };

  // Define test cases using the table-driven approach
  const testCases: TestCase[] = [
    {
      name: "empty spans array",
      input: [],
      expected: {
        nodeCount: 0,
        roots: [],
      },
    },
    {
      name: "single root node",
      input: [createSpan({ id: "a1b2c3d4e5f60000" })],
      expected: {
        nodeCount: 1,
        roots: [
          {
            spanId: "a1b2c3d4e5f60000",
            parentSpanId: undefined,
            depth: 0,
            childCount: 0,
          },
        ],
      },
    },
    {
      name: "parent-child relationship",
      input: [
        createSpan({ id: "a1b2c3d4e5f60001", startTime: 1000, duration: 10 }),
        createSpan({
          id: "a1b2c3d4e5f60002",
          parentId: "a1b2c3d4e5f60001",
          startTime: 1002,
          duration: 5,
        }),
      ],
      expected: {
        nodeCount: 2,
        roots: [
          {
            spanId: "a1b2c3d4e5f60001",
            parentSpanId: undefined,
            depth: 0,
            childCount: 1,
            children: [
              {
                spanId: "a1b2c3d4e5f60002",
                parentSpanId: "a1b2c3d4e5f60001",
                depth: 1,
                childCount: 0,
              },
            ],
          },
        ],
      },
    },
    {
      name: "multiple root spans",
      input: [
        createSpan({
          id: "a1b2c3d4e5f60003",
          startTime: 1000,
          duration: 5,
          service: "service-1",
        }),
        createSpan({
          id: "a1b2c3d4e5f60004",
          startTime: 990,
          duration: 8,
          service: "service-2",
        }),
      ],
      expected: {
        nodeCount: 2,
        roots: [
          {
            spanId: "a1b2c3d4e5f60004", // Starts earlier, should be first
            parentSpanId: undefined,
            depth: 0,
            childCount: 0,
          },
          {
            spanId: "a1b2c3d4e5f60003",
            parentSpanId: undefined,
            depth: 0,
            childCount: 0,
          },
        ],
      },
    },
    {
      name: "complex nested structure",
      input: [
        createSpan({
          id: "a1b2c3d4e5f60005",
          startTime: 1000,
          duration: 15,
          service: "service-root",
        }),
        createSpan({
          id: "a1b2c3d4e5f60006",
          parentId: "a1b2c3d4e5f60005",
          startTime: 1002,
          duration: 5,
          service: "service-1",
        }),
        createSpan({
          id: "a1b2c3d4e5f60007",
          parentId: "a1b2c3d4e5f60005",
          startTime: 1001,
          duration: 8,
          service: "service-2",
        }),
        createSpan({
          id: "a1b2c3d4e5f60008",
          parentId: "a1b2c3d4e5f60006",
          startTime: 1003,
          duration: 2,
          service: "service-3",
        }),
      ],
      expected: {
        nodeCount: 4,
        roots: [
          {
            spanId: "a1b2c3d4e5f60005",
            parentSpanId: undefined,
            depth: 0,
            childCount: 2,
            children: [
              {
                spanId: "a1b2c3d4e5f60007", // Starts earlier, should be first
                parentSpanId: "a1b2c3d4e5f60005",
                depth: 1,
                childCount: 0,
              },
              {
                spanId: "a1b2c3d4e5f60006",
                parentSpanId: "a1b2c3d4e5f60005",
                depth: 1,
                childCount: 1,
                children: [
                  {
                    spanId: "a1b2c3d4e5f60008",
                    parentSpanId: "a1b2c3d4e5f60006",
                    depth: 2,
                    childCount: 0,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      name: "orphaned spans",
      input: [
        createSpan({
          id: "a1b2c3d4e5f60009",
          startTime: 1000,
          duration: 10,
          service: "service-1",
        }),
        createSpan({
          id: "a1b2c3d4e5f6000a",
          parentId: "deadbeefcafe0000",
          startTime: 1002,
          duration: 5,
          service: "service-2",
        }),
      ],
      expected: {
        nodeCount: 2,
        roots: [
          {
            spanId: "a1b2c3d4e5f60009",
            parentSpanId: undefined,
            depth: 0,
            childCount: 0,
          },
          {
            spanId: "a1b2c3d4e5f6000a",
            parentSpanId: "deadbeefcafe0000",
            depth: 0,
            childCount: 0,
          },
        ],
      },
    },
  ];

  // Run all test cases
  testCases.forEach((tc) => {
    it(tc.name, () => {
      const result = buildSpanTree(tc.input);

      // Verify node count
      const countNodes = (nodes: SpanTreeNode[]): number => {
        return nodes.reduce((count, node) => {
          return count + 1 + countNodes(node.children);
        }, 0);
      };

      const totalNodes = countNodes(result);
      expect(totalNodes).toBe(tc.expected.nodeCount);

      // Verify root nodes
      expect(result.length).toBe(tc.expected.roots.length);

      // Verify each root node and its descendants
      tc.expected.roots.forEach((expectedRoot, index) => {
        const actualRoot = result[index];

        expect(spanIdToString(actualRoot.span.spanId)).toBe(
          expectedRoot.spanId,
        );
        if (!actualRoot.span.parentSpanId) {
          expect(expectedRoot.parentSpanId).toBeUndefined();
        } else {
          expect(spanIdToString(actualRoot.span.parentSpanId)).toBe(
            expectedRoot.parentSpanId,
          );
        }
        expect(actualRoot.depth).toBe(expectedRoot.depth);
        expect(actualRoot.children.length).toBe(expectedRoot.childCount);

        // Verify children if they exist
        if (expectedRoot.children) {
          expectedRoot.children.forEach((expectedChild, childIndex) => {
            const actualChild = actualRoot.children[childIndex];

            expect(spanIdToString(actualChild.span.spanId)).toBe(
              expectedChild.spanId,
            );
            expect(actualChild.depth).toBe(expectedChild.depth);
            expect(actualChild.children.length).toBe(expectedChild.childCount);

            // Verify grandchildren if they exist
            if (expectedChild.children) {
              expectedChild.children.forEach(
                (expectedGrandchild, grandchildIndex) => {
                  const actualGrandchild =
                    actualChild.children[grandchildIndex];

                  expect(spanIdToString(actualGrandchild.span.spanId)).toBe(
                    expectedGrandchild.spanId,
                  );
                  expect(actualGrandchild.depth).toBe(expectedGrandchild.depth);
                },
              );
            }
          });
        }
      });
    });
  });
});
