"use client";

import {
  formatDuration,
  getDurationInMilliseconds,
  getUnixTimestamp,
} from "@/lib/utils/format-timestamp";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { DurationSchema } from "@bufbuild/protobuf/wkt";
import { SpanTreeNode, walkSpanTreeNodeFlat } from "@/components/traces/utils";
import { twMerge } from "tailwind-merge";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { spanIdToString } from "@/lib/utils/id-factories";
import { create } from "@bufbuild/protobuf";

interface TraceWaterfallProps {
  traceId: string;
  serviceColors: { [key: string]: string };
  spans: Span[];
  spanTree: SpanTreeNode[];
  selectedSpan: SpanTreeNode;
  setSelectedSpan: Dispatch<SetStateAction<SpanTreeNode>>;
}

export const TraceWaterfall = ({
  traceId,
  serviceColors,
  spans,
  spanTree,
  selectedSpan,
  setSelectedSpan,
}: TraceWaterfallProps) => {
  const [foldedNodes, setFoldedNodes] = useState<Set<string>>(new Set());
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());
  const selectedSpanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSpanRef.current) {
      selectedSpanRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedSpan]);

  const [minStart, maxEnd, totalDuration] = useMemo(() => {
    if (!spans.length) return [0, 0, 0];

    const starts: number[] = [];
    const ends: number[] = [];

    spans.forEach((span) => {
      if (span.time && span.duration) {
        const start = getUnixTimestamp(span.time);
        const duration = getDurationInMilliseconds(span.duration);
        starts.push(start);
        ends.push(start + duration);
      }
    });

    const min = Math.min(...starts);
    const max = Math.max(...ends);
    return [min, max, max - min];
  }, [spans, traceId]);

  const renderSpanAsRow = (node: SpanTreeNode): ReactNode | undefined => {
    const onToggleVisibility = () => {
      const nodeId = spanIdToString(node.span.spanId);

      setFoldedNodes((prev) => {
        const newFolded = new Set(prev);
        if (newFolded.has(nodeId)) {
          newFolded.delete(nodeId);
        } else {
          newFolded.add(nodeId);
        }
        return newFolded;
      });

      setHiddenNodes((prev) => {
        const newHidden = new Set(prev);
        const childIds = getAllChildIds(node);
        const isCurrentlyFolded = foldedNodes.has(nodeId);

        if (isCurrentlyFolded) {
          node.children.forEach((child) => {
            const childId = spanIdToString(child.span.spanId);
            newHidden.delete(childId);

            if (foldedNodes.has(childId)) {
              const grandChildIds = getAllChildIds(child);
              grandChildIds.forEach((id) => newHidden.add(id));
            } else {
              const grandChildIds = getAllChildIds(child);
              grandChildIds.forEach((id) => newHidden.delete(id));
            }
          });
        } else {
          childIds.forEach((id) => newHidden.add(id));
        }

        return newHidden;
      });
    };

    const areAllParentsVisible = (node: SpanTreeNode): boolean => {
      if (!node.parent) {
        return true;
      }
      if (hiddenNodes.has(spanIdToString(node.parent.span.spanId))) {
        return false;
      }
      return areAllParentsVisible(node.parent);
    };

    const getAllChildIds = (node: SpanTreeNode): string[] => {
      const ids: string[] = [];
      node.children.forEach((child) => {
        ids.push(spanIdToString(child.span.spanId));

        if (!foldedNodes.has(spanIdToString(child.span.spanId))) {
          ids.push(...getAllChildIds(child));
        }
      });
      return ids;
    };

    if (
      hiddenNodes.has(spanIdToString(node.span.spanId)) ||
      !areAllParentsVisible(node)
    ) {
      return;
    }

    const calculateDynamicConnectorHeight = (node: SpanTreeNode): number => {
      let count = 0;
      node.children.forEach((child) => {
        if (!hiddenNodes.has(spanIdToString(child.span.spanId))) {
          count++;

          if (!foldedNodes.has(spanIdToString(child.span.spanId))) {
            count += calculateDynamicConnectorHeight(child);
          }
        }
      });
      return count;
    };

    const canToggle = node.children && node.children.length > 0;
    const isFolded = foldedNodes.has(spanIdToString(node.span.spanId));
    const isHidden = hiddenNodes.has(spanIdToString(node.span.spanId));
    const dynamicConnectorHeight = calculateDynamicConnectorHeight(node);

    return (
      <>
        <div
          ref={
            selectedSpan?.span.spanId === node.span.spanId
              ? selectedSpanRef
              : null
          }
          key={spanIdToString(node.span.spanId)}
          style={{
            backgroundColor:
              selectedSpan?.span.spanId === node.span.spanId
                ? "rgba(147,197,253, 0.3)"
                : "transparent",
          }}
          className={`${!isHidden && "border-b"}`}
          onClick={() => setSelectedSpan(node)}
        >
          <div className="flex items-start">
            {/* For debugging */}
            {/* ⭐️spanid {spanIdToString(node.span.spanId)}
            ⭐️parentid {spanIdToString(node.parent?.span.spanId)}
            ⭐️depth {node.depth} */}
            {Array(node.depth)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-5 shrink-0" />
              ))}
            <div className={twMerge("relative flex items-center")}>
              {node.parent && (
                <div className="absolute flex items-center">
                  {node.isLast ? (
                    <div
                      className="absolute top-[-17px] left-[-8px] h-5 w-px"
                      style={{
                        backgroundColor:
                          serviceColors[node.parent.span.serviceName],
                      }}
                    />
                  ) : (
                    <div
                      className={twMerge("absolute left-[-8px] w-px")}
                      style={{
                        height: `${(dynamicConnectorHeight + 1) * 33}px`,
                        top: "-15px",
                        backgroundColor:
                          serviceColors[node.parent.span.serviceName],
                      }}
                    />
                  )}
                  {node.children.length > 0 ? (
                    <div
                      className="absolute left-[-8px] h-px w-2"
                      style={{
                        backgroundColor:
                          serviceColors[node.parent.span.serviceName],
                      }}
                    />
                  ) : (
                    <div
                      className="absolute left-[-8px] h-px w-5"
                      style={{
                        backgroundColor:
                          serviceColors[node.parent.span.serviceName],
                      }}
                    />
                  )}
                </div>
              )}
              <div className="z-1 flex w-6 shrink-0 items-center justify-center">
                {canToggle ? (
                  <button
                    onClick={onToggleVisibility}
                    className="mr-1 flex h-5 w-5 items-center justify-center rounded border bg-white text-xs dark:bg-black"
                    style={{
                      borderColor: serviceColors[node.span.serviceName],
                      backgroundColor: isFolded
                        ? serviceColors[node.span.serviceName]
                        : "",
                      color: isFolded ? "white" : "",
                      fontWeight: isFolded ? "bold" : "normal",
                    }}
                  >
                    {node.children.length}
                  </button>
                ) : (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: serviceColors[node.span.serviceName],
                    }}
                  />
                )}
              </div>

              {node.children.length > 0 && !isFolded && (
                <div
                  className="absolute bottom-[-2px] left-[9.5px] h-3 w-px"
                  style={{
                    backgroundColor: serviceColors[node.span.serviceName],
                  }}
                />
              )}

              <div className="w-64 shrink-0 pr-2">
                <div
                  className="truncate text-sm font-medium"
                  title={node.span.name}
                >
                  {node.span.name}
                </div>
                <div
                  className="truncate text-xs text-gray-500 dark:text-gray-400"
                  title={node.span.serviceName}
                >
                  {node.span.serviceName}
                </div>
              </div>
            </div>
            {/* Timeline bar */}
            <div className="h-8 grow">{renderTimeline(node.span)}</div>
          </div>
        </div>
      </>
    );
  };

  const renderTimeline = (span: Span) => {
    const { time, duration, serviceName, name } = span;
    if (!time || !duration || totalDuration === 0 || !serviceColors) {
      return <></>;
    }

    const start = getUnixTimestamp(time);
    const durationMilliseconds = getDurationInMilliseconds(duration);

    const left = ((start - minStart) / totalDuration) * 100;
    const width = (durationMilliseconds / totalDuration) * 100;
    const right = left > 50 ? left - 3 : left + width + 1;

    return (
      <div className="relative flex h-full w-full items-center text-xs">
        <div
          className="absolute flex h-6 items-center overflow-hidden rounded-sm px-1 text-white"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: serviceColors[serviceName],
          }}
          title={`${formatDuration(duration)} - ${name}`}
        >
          {width >= 5 && formatDuration(duration)}
        </div>
        {width < 5 && (
          <div className="absolute" style={{ left: `${right}%` }}>
            {formatDuration(duration)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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
                    create(DurationSchema, { seconds: BigInt(0), nanos: 0 }),
                  )}
                </div>
                <div className="absolute left-1/4 text-xs">
                  {formatDuration(
                    create(DurationSchema, {
                      seconds: BigInt(
                        Math.floor((totalDuration * 0.25) / 1000),
                      ),
                      nanos: ((totalDuration * 0.25) % 1000) * 1000000,
                    }),
                  )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 transform text-xs">
                  {formatDuration(
                    create(DurationSchema, {
                      seconds: BigInt(Math.floor((totalDuration * 0.5) / 1000)),
                      nanos: ((totalDuration * 0.5) % 1000) * 1000000,
                    }),
                  )}
                </div>
                <div className="absolute left-3/4 text-xs">
                  {formatDuration(
                    create(DurationSchema, {
                      seconds: BigInt(
                        Math.floor((totalDuration * 0.75) / 1000),
                      ),
                      nanos: ((totalDuration * 0.75) % 1000) * 1000000,
                    }),
                  )}
                </div>
                <div className="absolute right-0 text-xs">
                  {formatDuration(
                    create(DurationSchema, {
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
      <div className="p-2">
        {spanTree
          .map((head) => {
            const flatNodes = walkSpanTreeNodeFlat(head, renderSpanAsRow);

            return flatNodes.map((node, nodeIndex) => (
              <div key={`${head.span.spanId}-${nodeIndex}`}>{node}</div>
            ));
          })
          .flat()}
      </div>
    </>
  );
};
