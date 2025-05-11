"use client";

import { useApiClients } from "@/context/api-provider";
import { formatDuration } from "@/lib/utils/formatTimeStamp";
import { getTrace } from "@/services/traceService";
import { Span } from "api/js/types/v1/tracing_pb";
import { useEffect, useState } from "react";

interface TracesProps {
  traceId: string;
}

interface SpanTreeNode {
  span: Span;
  children: SpanTreeNode[];
}

export const Traces = ({ traceId }: TracesProps) => {
  const { apiClients } = useApiClients();

  const [spanTree, setSpanTree] = useState<SpanTreeNode[]>();

  const buildSpanTree = (spans: Span[]): SpanTreeNode[] => {
    const nodeMap = new Map<string, SpanTreeNode>();
    const rootNodes: SpanTreeNode[] = [];

    spans.forEach((span) => {
      const spanIdString = span.spanId;
      const node: SpanTreeNode = {
        span,
        children: [],
      };
      nodeMap.set(spanIdString, node);
    });

    spans.forEach((span) => {
      const parentSpanIdString = span.parentSpanId;
      const currentNode = nodeMap.get(span.spanId);

      if (!currentNode) return;

      if (parentSpanIdString && parentSpanIdString !== "") {
        const parentNode = nodeMap.get(parentSpanIdString);
        if (parentNode) {
          parentNode.children.push(currentNode);
        } else {
          rootNodes.push(currentNode);
        }
      } else {
        rootNodes.push(currentNode);
      }
    });

    const sortChildren = (node: SpanTreeNode) => {
      node.children.forEach(sortChildren);
    };

    rootNodes.forEach(sortChildren);

    console.log("rootNodes", rootNodes);

    return rootNodes;
  };

  useEffect(() => {
    if (!apiClients) return;
    getTrace(apiClients?.trace, decodeURIComponent(traceId), {
      onSuccess: (res) => {
        if (res.trace?.spans) {
          const tree = buildSpanTree(res.trace?.spans);
          setSpanTree(tree);
        }
      },
    });
  }, []);

  const renderTreeNode = (node: SpanTreeNode, isRoot: boolean = false) => {
    const hasChildren = Object.keys(node.children).length > 0;

    return (
      <div
        key={`${node.span.traceId}-${node.span.spanId}`}
        className={`${isRoot ? "mb-2 ml-4" : ""}`}
      >
        <>
          <div>
            <div className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm">
              <span className="">{node.span.name}</span>
              <span className="">{node.span.serviceName}</span>
              <span className="rounded bg-blue-50/90 px-2 py-0.5 dark:bg-blue-900/30">
                {formatDuration(node.span.timing?.duration)}
              </span>
            </div>
          </div>
        </>

        {hasChildren && (
          <div className="mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700">
            {Object.values(node.children).map((childNode) =>
              renderTreeNode(childNode, false),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div>{decodeURIComponent(traceId)}</div>
      <div>{spanTree?.map((node) => renderTreeNode(node, true))}</div>
    </div>
  );
};
