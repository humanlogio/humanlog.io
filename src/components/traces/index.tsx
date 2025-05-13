"use client";

import { useApiClients } from "@/context/api-provider";
import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { getTrace } from "@/services/traceService";
import { Span } from "api/js/types/v1/tracing_pb";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import TraceWaterfall from "@/components/traces/trace-waterfall";

interface TracesProps {
  traceId: string;
}

interface SpanTreeNode {
  span: Span;
  children: SpanTreeNode[];
}

export const Traces = ({ traceId }: TracesProps) => {
  const { apiClients } = useApiClients();

  const [spans, setSpans] = useState<Span[]>();
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

    return rootNodes;
  };

  useEffect(() => {
    if (!apiClients) return;
    getTrace(apiClients?.trace, decodeURIComponent(traceId), {
      onSuccess: (res) => {
        if (res.trace?.spans) {
          setSpans(res.trace.spans);
          const tree = buildSpanTree(res.trace?.spans);
          setSpanTree(tree);
        }
      },
    });
  }, []);

  console.log("spans", spans);
  console.log("spanTree", spanTree);

  const renderTreeNode = (node: SpanTreeNode, isRoot: boolean = false) => {
    const childrenLength = Object.keys(node.children).length;
    const hasChildren = childrenLength > 0;

    return (
      <div
        key={`${node.span.traceId}-${node.span.spanId}`}
        className={`${isRoot ? "mb-2 ml-4" : ""}`}
      >
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <Button size="xs" variant="outline" className="h-6 w-6">
                {childrenLength}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            <div className="flex items-center">
              {/* {node.span.parentSpanId && <div className="w-5 border-b" />} */}
              <div className="flex cursor-pointer flex-col justify-center rounded p-1 text-sm">
                <span className="">{node.span.name}</span>
                <span className="text-gray-500">{node.span.serviceName}</span>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && (
          <div
            className="pl-3"
            // className="mt-1 space-y-1 border-l border-gray-200  dark:border-gray-700"
          >
            {Object.values(node.children).map((childNode) =>
              renderTreeNode(childNode, false),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-10 py-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl font-extrabold">Trace</span>
        <span className="text-sm text-gray-500">
          {decodeURIComponent(traceId)}
        </span>
      </div>
      <div className="mt-14 flex gap-10">
        <div>{spanTree?.map((node) => renderTreeNode(node, true))}</div>
        {spans && <TraceWaterfall spans={spans} />}
      </div>
    </div>
  );
};
