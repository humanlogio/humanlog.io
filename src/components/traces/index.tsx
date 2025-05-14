"use client";

import { useApiClients } from "@/context/api-provider";
import {
  formatDuration,
  formatTimestamp,
  getDurationInMilliseconds,
  getUnixTimestamp,
} from "@/lib/utils/formatTimeStamp";
import { getTrace } from "@/services/traceService";
import { Span, Span_Timing } from "api/js/types/v1/tracing_pb";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Duration, Timestamp } from "@bufbuild/protobuf";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";

interface TracesProps {
  traceId: string;
}

interface SpanTreeNode {
  span: Span;
  children: SpanTreeNode[];
  depth: number;
}

const colorPalette = [
  "#69b3a2", // teal
  "#e41a1c", // red
  "#377eb8", // blue
  "#4daf4a", // green
  "#984ea3", // purple
  "#ff7f00", // orange
  "#ffff33", // yellow
  "#a65628", // brown
  "#f781bf", // pink
  "#999999", // gray
];

export const Traces = ({ traceId }: TracesProps) => {
  const { apiClients } = useApiClients();

  const [spans, setSpans] = useState<Span[]>([]);
  const [spanTree, setSpanTree] = useState<SpanTreeNode[]>([]);
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set());
  const [serviceColors, setServiceColors] = useState<{
    [key: string]: string;
  }>();

  const [minStart, maxEnd, totalDuration] = useMemo(() => {
    if (!spans.length) return [0, 0, 0];

    const starts: number[] = [];
    const ends: number[] = [];

    spans.forEach((span) => {
      if (span.timing?.start && span.timing?.duration) {
        const start = getUnixTimestamp(span.timing.start);
        const duration = getDurationInMilliseconds(span.timing.duration);
        starts.push(start);
        ends.push(start + duration);
      }
    });

    const min = Math.min(...starts);
    const max = Math.max(...ends);
    return [min, max, max - min];
  }, [spans, traceId]);

  useEffect(() => {
    if (!spans.length) return;
    const _serviceColors: { [key: string]: string } = {};

    // Set 메서드로 고유한 서비스 네임 추출
    const serviceNames = [...new Set(spans.map((span) => span.serviceName))];

    // serviceColors에 색상 할당 - 앙뚜앙이 말한 hash...?
    serviceNames.forEach((name, i) => {
      _serviceColors[name] = colorPalette[i % colorPalette.length];
    });
    setServiceColors(_serviceColors);
  }, [spans, traceId]);

  // Toggle expand/collapse for a span
  const toggleExpand = (spanId: string) => {
    setExpandedSpans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(spanId)) {
        newSet.delete(spanId);
      } else {
        newSet.add(spanId);
      }
      return newSet;
    });
  };

  const buildSpanTree = (spans: Span[]): SpanTreeNode[] => {
    const nodeMap = new Map<string, SpanTreeNode>();
    const rootNodes: SpanTreeNode[] = [];

    // 노드 생성
    spans.forEach((span) => {
      const node: SpanTreeNode = {
        span,
        children: [],
        depth: 0,
      };
      nodeMap.set(span.spanId, node);
    });

    // 트리 생성
    spans.forEach((span) => {
      const parentSpanId = span.parentSpanId;
      const currentNode = nodeMap.get(span.spanId);

      if (!currentNode) return;

      if (parentSpanId && parentSpanId !== "") {
        const parentNode = nodeMap.get(parentSpanId);
        if (parentNode) {
          parentNode.children.push(currentNode);
          currentNode.depth = parentNode.depth + 1;
        } else {
          rootNodes.push(currentNode);
        }
      } else {
        rootNodes.push(currentNode);
      }
    });

    // starttime으로 노드정렬
    const sortNodesByTime = (nodes: SpanTreeNode[]) => {
      return nodes.sort((a, b) => {
        const aStart = a.span.timing?.start
          ? getUnixTimestamp(a.span.timing.start)
          : 0;
        const bStart = b.span.timing?.start
          ? getUnixTimestamp(b.span.timing.start)
          : 0;
        return aStart - bStart;
      });
    };

    const sortAllChildren = (node: SpanTreeNode) => {
      node.children = sortNodesByTime(node.children);
      node.children.forEach(sortAllChildren);
    };

    rootNodes.forEach(sortAllChildren);
    return sortNodesByTime(rootNodes);
  };

  // Load data
  useEffect(() => {
    if (!apiClients) return;

    getTrace(apiClients?.trace, traceId, {
      onSuccess: (res) => {
        if (res.trace?.spans) {
          setSpans(res.trace.spans);
          const tree = buildSpanTree(res.trace.spans);
          setSpanTree(tree);

          // 첫번째 span들은 전부 다 펴지게 설정?
          // const rootIds = new Set(tree.map((node) => node.span.spanId));
          // setExpandedSpans(rootIds);

          // 전체 span 전부 펴지게 설정?
          const allSpanIds = new Set(
            res.trace.spans.map((span) => span.spanId),
          );
          setExpandedSpans(allSpanIds);
        }
      },
    });
  }, [apiClients, traceId]);

  const renderTimeline = (span: Span) => {
    const { timing, serviceName, name } = span;
    if (
      !timing ||
      !timing.start ||
      !timing.duration ||
      totalDuration === 0 ||
      !serviceColors
    ) {
      return <></>;
    }

    const start = getUnixTimestamp(timing.start);
    const duration = getDurationInMilliseconds(timing.duration);

    const left = ((start - minStart) / totalDuration) * 100;
    const width = (duration / totalDuration) * 100;
    const right = left > 50 ? left - 3 : left + width + 1;

    return (
      <div className="flex items-center text-xs">
        <div
          className="absolute flex h-6 items-center overflow-hidden rounded-sm px-1 text-white"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: serviceColors[serviceName],
          }}
          title={`${formatDuration(timing?.duration)} - ${name}`}
        >
          {width >= 5 && formatDuration(timing?.duration)}
        </div>
        {width < 5 && (
          <div className="absolute" style={{ left: `${right}%` }}>
            {formatDuration(timing?.duration)}
          </div>
        )}
      </div>
    );
  };

  // 재귀함수,, ㅅㅂ 이해가 안가네,,, 재귀함수는 영어로 recursive function
  const renderSpanTree = (nodes: SpanTreeNode[], isFlat = false) => {
    return nodes.map((node) => (
      <div key={node.span.spanId} className="w-full">
        <div className="flex items-start">
          {/* 깊이에 따른 들여쓰기 */}
          {!isFlat &&
            Array(node.depth)
              .fill(0)
              .map((_, i) => <div key={i} className="w-6 flex-shrink-0" />)}

          <div className="flex w-6 flex-shrink-0 items-center justify-center">
            {node.children.length > 0 && (
              <button
                onClick={() => toggleExpand(node.span.spanId)}
                className="flex h-5 w-5 items-center justify-center rounded border text-xs"
              >
                {node.children.length}
                {expandedSpans.has(node.span.spanId) ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
          </div>

          {/* 서비스명 */}
          <div className="w-64 flex-shrink-0 pr-2">
            <div
              className="truncate text-sm font-medium"
              title={node.span.name}
            >
              {node.span.name}
            </div>
            <div
              className="truncate text-xs text-gray-500"
              title={node.span.serviceName}
            >
              {node.span.serviceName}
            </div>
          </div>

          {/* Timeline bar */}
          <div className="relative h-8 flex-grow">
            {renderTimeline(node.span)}
          </div>
        </div>

        {/* 자식스팬 - 재귀 시작 지점,, */}
        {node.children.length > 0 && expandedSpans.has(node.span.spanId) && (
          <div className="w-full">{renderSpanTree(node.children, isFlat)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="px-6 py-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl font-extrabold">Trace</span>
        <button
          className="flex max-w-md items-center truncate text-sm text-gray-500"
          onClick={() => copyToClipboard(traceId)}
        >
          {traceId}
          <Copy size={12} className="flex-none" />
        </button>
      </div>

      {/* Timeline header */}
      <div className="mt-6 mb-2 flex items-center">
        <div className="w-6 flex-shrink-0" />
        <div className="w-64 flex-shrink-0" />
        <div className="flex-grow px-2">
          <div className="relative h-6">
            {totalDuration > 0 && (
              <>
                <div className="absolute left-0 text-xs">
                  {formatDuration(
                    new Duration({ seconds: BigInt(0), nanos: 0 }),
                  )}
                </div>
                <div className="absolute left-1/4 text-xs">
                  {formatDuration(
                    new Duration({
                      seconds: BigInt(
                        Math.floor((totalDuration * 0.25) / 1000),
                      ),
                      nanos: ((totalDuration * 0.25) % 1000) * 1000000,
                    }),
                  )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 transform text-xs">
                  {formatDuration(
                    new Duration({
                      seconds: BigInt(Math.floor((totalDuration * 0.5) / 1000)),
                      nanos: ((totalDuration * 0.5) % 1000) * 1000000,
                    }),
                  )}
                </div>
                <div className="absolute left-3/4 text-xs">
                  {formatDuration(
                    new Duration({
                      seconds: BigInt(
                        Math.floor((totalDuration * 0.75) / 1000),
                      ),
                      nanos: ((totalDuration * 0.75) % 1000) * 1000000,
                    }),
                  )}
                </div>
                <div className="absolute right-0 text-xs">
                  {formatDuration(
                    new Duration({
                      seconds: BigInt(Math.floor(totalDuration / 1000)),
                      nanos: (totalDuration % 1000) * 1000000,
                    }),
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="divide-y p-2">{renderSpanTree(spanTree)}</div>
    </div>
  );
};
