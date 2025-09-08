import { spanIdToString } from "@/lib/utils/id-factories";
import { Timestamp } from "@bufbuild/protobuf/wkt";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { ReactNode } from "react";

export interface SpanTreeNode {
  span: Span;
  parent: SpanTreeNode | undefined;
  children: SpanTreeNode[];
  index: number;
  isLast: boolean;
  depth: number;
  visible: boolean;
  folded: boolean;
  verticalConnectorHeight: number;
}

/**
 * Builds a hierarchical tree from flat spans array
 * @param spans Array of spans to build tree from
 * @returns Root nodes of the span tree with their children
 *
 * @see Tests in __tests__/buildSpanTree.test.tsx
 */
export const buildSpanTree = (spans: Span[]): SpanTreeNode[] => {
  const nodeMap = new Map<string, SpanTreeNode>();
  const rootNodes: SpanTreeNode[] = [];

  // Create nodes for each span
  spans.forEach((span) => {
    const node: SpanTreeNode = {
      span,
      parent: undefined,
      children: [],
      index: 0,
      isLast: false,
      depth: 0,
      visible: true,
      folded: false,
      verticalConnectorHeight: 0,
    };
    nodeMap.set(spanIdToString(span.spanId), node);
  });

  // Build the tree structure
  spans.forEach((span) => {
    const parentSpanId = spanIdToString(span.parentSpanId);
    const currentNode = nodeMap.get(spanIdToString(span.spanId));

    if (!currentNode) return;

    if (parentSpanId && parentSpanId !== "") {
      const parentNode = nodeMap.get(parentSpanId);
      if (parentNode) {
        parentNode.children.push(currentNode);
        currentNode.parent = parentNode;
      } else {
        rootNodes.push(currentNode);
      }
    } else {
      rootNodes.push(currentNode);
    }
  });

  // Calculate depth recursively after tree structure is complete
  const calculateDepth = (node: SpanTreeNode, depth: number): void => {
    node.depth = depth;
    node.children.forEach((child) => calculateDepth(child, depth + 1));
  };

  // Set depth for all root nodes and their descendants
  rootNodes.forEach((rootNode) => calculateDepth(rootNode, 0));

  // Calculate vertical connector height for each node
  const calculateVerticalConnectorHeight = (node: SpanTreeNode): void => {
    // Helper function that counts ALL descendants without checking isLast
    const countAllDescendants = (node: SpanTreeNode): number => {
      let count = 0;
      node.children.forEach((child) => {
        count++;
        count += countAllDescendants(child);
      });
      return count;
    };

    // Main logic: only check isLast at the first level
    let count = 0;
    node.children.forEach((child) => {
      count++; // Count the direct child
      if (!child.isLast) {
        // If not the last child, include ALL its descendants
        count += countAllDescendants(child);
      }
      // If it is the last child, don't include its descendants
    });

    node.verticalConnectorHeight = count;

    // Recursively calculate for all children
    node.children.forEach((child) => calculateVerticalConnectorHeight(child));
  };

  // Calculate vertical connector height for all root nodes and their descendants
  rootNodes.forEach((rootNode) => calculateVerticalConnectorHeight(rootNode));

  // Properly set the index and isLast of each node within its siblings group
  const setIndicesAndLastFlag = (nodes: SpanTreeNode[]) => {
    nodes.forEach((node, idx, arr) => {
      node.index = idx;
      node.isLast = idx === arr.length - 1;
      setIndicesAndLastFlag(node.children);
    });
  };

  // Sort nodes by time
  const sortNodesByTime = (nodes: SpanTreeNode[]): SpanTreeNode[] => {
    return nodes.sort((a: SpanTreeNode, b: SpanTreeNode) => {
      const aStart = a.span.time ? getUnixTimestamp(a.span.time) : 0;
      const bStart = b.span.time ? getUnixTimestamp(b.span.time) : 0;
      return aStart - bStart;
    });
  };

  // Helper function for timestamp conversion
  function getUnixTimestamp(timestamp: Timestamp | undefined): number {
    if (!timestamp) return 0;
    return (
      Number(timestamp.seconds) * 1000 + Math.floor(timestamp.nanos / 1000000)
    );
  }

  // Recursively sort all children
  const sortAllChildren = (node: SpanTreeNode): void => {
    node.children = sortNodesByTime(node.children);
    node.children.forEach(sortAllChildren);
  };

  rootNodes.forEach(sortAllChildren);
  const sortedRootNodes = sortNodesByTime(rootNodes);

  // Set indices and isLast flag after sorting to ensure they reflect the final order
  setIndicesAndLastFlag(sortedRootNodes);

  return sortedRootNodes;
};

export const walkSpanTreeNodeFlat = (
  node: SpanTreeNode,
  onTreeNode: (node: SpanTreeNode) => ReactNode,
): ReactNode[] => {
  const self = onTreeNode(node);
  let out: ReactNode[] = [self];

  node.children.forEach((child) => {
    const childOut = walkSpanTreeNodeFlat(child, onTreeNode);
    out.push(...childOut);
  });
  return out;
};

// type NestedSpanComponent = ReactNode;

// type NestedCallback = (
//   node: SpanTreeNode,
//   children: NestedSpanComponent[],
// ) => NestedSpanComponent;

// export const walkSpanTreeNodeNested = (
//   node: SpanTreeNode,
//   onTreeNode: NestedCallback,
// ): NestedSpanComponent => {
//   const childrenNestedComponents = node.children.map((child) => {
//     return walkSpanTreeNodeNested(child, onTreeNode);
//   });
//   return onTreeNode(node, childrenNestedComponents);
// };

export const findSpanNodeById = (
  nodes: SpanTreeNode[],
  targetSpanId: string,
): SpanTreeNode | undefined => {
  for (const node of nodes) {
    if (spanIdToString(node.span.spanId) === targetSpanId) {
      return node;
    }
    const foundInChildren = findSpanNodeById(node.children, targetSpanId);
    if (foundInChildren) {
      return foundInChildren;
    }
  }
  return undefined;
};
