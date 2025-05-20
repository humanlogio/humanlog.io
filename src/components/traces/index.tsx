"use client";

import { useApiClients } from "@/context/api-provider";
import {
  getDurationInMilliseconds,
  getUnixTimestamp,
} from "@/lib/utils/formatTimeStamp";
import { getTrace } from "@/services/traceService";
import { Span } from "api/js/types/v1/tracing_pb";
import { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import {
  buildSpanTree,
  SpanTreeNode,
  findSpanNodeById,
} from "@/components/traces/utils";
import { TraceWaterfall } from "@/components/traces/trace-waterfall";
import { SpanInfo } from "@/components/traces/span-info";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface TracesProps {
  traceId: string | null;
  spanId?: string | null;
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

export const Traces = ({ traceId, spanId }: TracesProps) => {
  const { apiClients } = useApiClients();

  const [spans, setSpans] = useState<Span[]>([]);
  const [spanTree, setSpanTree] = useState<SpanTreeNode[]>([]);
  const [serviceColors, setServiceColors] = useState<{
    [key: string]: string;
  }>({});

  const [selectedSpan, setSelectedSpan] = useState<SpanTreeNode>(spanTree[0]);

  useEffect(() => {
    if (!spans.length) return;
    const _serviceColors: { [key: string]: string } = {};

    const serviceNames = [...new Set(spans.map((span) => span.serviceName))];

    serviceNames.forEach((name, i) => {
      _serviceColors[name] = colorPalette[i % colorPalette.length];
    });
    setServiceColors(_serviceColors);
  }, [spans, traceId]);

  // Load data
  useEffect(() => {
    if (!apiClients || !traceId) return;

    getTrace(apiClients?.trace, traceId, {
      onSuccess: (res) => {
        if (res.trace?.spans) {
          setSpans(res.trace.spans);
          const tree = buildSpanTree(res.trace.spans);
          setSpanTree(tree);
          if (spanId) {
            const span = findSpanNodeById(tree, spanId);
            if (span) {
              setSelectedSpan(span);
            }
            return;
          }
          setSelectedSpan(tree[0]);
        }
      },
    });
  }, [apiClients, traceId, spanId]);

  return (
    traceId && (
      <div className="flex px-6 py-8">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={80} minSize={30}>
            <div className="pr-3">
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

              <TraceWaterfall
                traceId={traceId}
                serviceColors={serviceColors}
                spans={spans}
                spanTree={spanTree}
                selectedSpan={selectedSpan}
                setSelectedSpan={setSelectedSpan}
              />
            </div>
          </Panel>
          <PanelResizeHandle />
          {selectedSpan && (
            <Panel
              defaultSize={25}
              maxSize={50}
              minSize={15}
              className="relative"
            >
              <SpanInfo node={selectedSpan} serviceColors={serviceColors} />
            </Panel>
          )}
        </PanelGroup>
      </div>
    )
  );
};
