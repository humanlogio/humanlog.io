import { Span } from "api/js/types/v1/tracing_pb";
import { Timestamp } from "@bufbuild/protobuf";
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
    };
    nodeMap.set(span.spanId, node);
  });

  // Build the tree structure
  spans.forEach((span) => {
    const parentSpanId = span.parentSpanId;
    const currentNode = nodeMap.get(span.spanId);

    if (!currentNode) return;

    if (parentSpanId && parentSpanId !== "") {
      const parentNode = nodeMap.get(parentSpanId);
      if (parentNode) {
        parentNode.children.push(currentNode);
        currentNode.parent = parentNode;
        currentNode.depth = parentNode.depth + 1;
      } else {
        rootNodes.push(currentNode);
      }
    } else {
      rootNodes.push(currentNode);
    }
  });

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
      const aStart = a.span.timing?.start
        ? getUnixTimestamp(a.span.timing.start)
        : 0;
      const bStart = b.span.timing?.start
        ? getUnixTimestamp(b.span.timing.start)
        : 0;
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
    let childOut = walkSpanTreeNodeFlat(child, onTreeNode);
    out.push(childOut);
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
    if (node.span.spanId === targetSpanId) {
      return node;
    }
    const foundInChildren = findSpanNodeById(node.children, targetSpanId);
    if (foundInChildren) {
      return foundInChildren;
    }
  }
  return undefined;
};
