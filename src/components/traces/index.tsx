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
import { makeSpan } from "@/lib/utils/spanFactories";
import { Spans } from "api/js/types/v1/data_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { toBigInt } from "@/lib/utils/valueFactories";
import { makeStrKV } from "@/lib/utils/kvFactories";

interface TracesProps {
  traceId: string | null;
  spanId?: string | null;
}

const colorPalette = [
  "#5a7fc9", // Medium blue
  "#c9618f", // Medium pink
  "#4dacb9", // Medium sky blue
  "#8864ad", // Medium purple
  "#65ac55", // Medium green
  "#d99456", // Medium orange
  "#7a7dcb", // Medium lavender
  "#97b967", // Medium lime
  "#4daa95", // Medium mint
  "#c26674", // Medium coral
];

const ago10s = new Timestamp({
  seconds: toBigInt(Date.now() / 1000 - 10),
  nanos: 0,
});
const tsAdd = (ts: Timestamp, seconds: number) => {
  return new Timestamp({
    seconds: ts.seconds + BigInt(seconds),
    nanos: Number(ts.nanos),
  });
};

const sampleSpans = {
  data: new Spans({
    spans: [
      // Root span - Web Frontend
      makeSpan(
        "75787b6c-0376-4239-88ab-bb46c9d4e015",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "",
        "handleUserRequest",
        "web-frontend",
        tsAdd(ago10s, 0),
        800,
        [
          makeStrKV("service", "web-frontend"),
          makeStrKV("user", "alice"),
          makeStrKV("endpoint", "/dashboard"),
        ],
      ),

      // Child of root - API Gateway
      makeSpan(
        "82da06d1-29dd-4534-893d-6d31f4ce0a27",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "75787b6c-0376-4239-88ab-bb46c9d4e015",
        "routeRequest",
        "api-gateway",
        tsAdd(ago10s, 1),
        700,
        [
          makeStrKV("service", "api-gateway"),
          makeStrKV("method", "GET"),
          makeStrKV("path", "/api/users"),
        ],
      ),

      // Child of API Gateway - Auth Service
      makeSpan(
        "99a9896a-f5ce-47b6-bd6f-d5ae99bb6c74",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "82da06d1-29dd-4534-893d-6d31f4ce0a27",
        "validateToken",
        "auth-service",
        tsAdd(ago10s, 2),
        150,
        [
          makeStrKV("service", "auth-service"),
          makeStrKV("token_type", "JWT"),
          makeStrKV("user_id", "alice-123"),
        ],
      ),

      // Child of API Gateway - User Service
      makeSpan(
        "a1b2c3d4-e5f6-4789-abcd-ef1234567890",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "82da06d1-29dd-4534-893d-6d31f4ce0a27",
        "getUserProfile",
        "user-service",
        tsAdd(ago10s, 3),
        400,
        [
          makeStrKV("service", "user-service"),
          makeStrKV("user_id", "alice-123"),
          makeStrKV("include_details", "true"),
        ],
      ),

      // Child of User Service - Database
      makeSpan(
        "b2c3d4e5-f6a7-4890-bcde-f1234567890a",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "a1b2c3d4-e5f6-4789-abcd-ef1234567890",
        "queryUserData",
        "database",
        tsAdd(ago10s, 4),
        200,
        [
          makeStrKV("service", "database"),
          makeStrKV("db_type", "postgres"),
          makeStrKV("table", "users"),
        ],
      ),

      // Child of User Service - Cache Service
      makeSpan(
        "c3d4e5f6-a7b8-4901-cdef-123456789ab0",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "a1b2c3d4-e5f6-4789-abcd-ef1234567890",
        "getCachedPreferences",
        "cache-service",
        tsAdd(ago10s, 5),
        100,
        [
          makeStrKV("service", "cache-service"),
          makeStrKV("cache_type", "redis"),
          makeStrKV("key", "user:alice-123:prefs"),
        ],
      ),

      // Child of API Gateway - Notification Service
      makeSpan(
        "d4e5f6a7-b8c9-4012-def0-23456789abc1",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "82da06d1-29dd-4534-893d-6d31f4ce0a27",
        "fetchNotifications",
        "notification-service",
        tsAdd(ago10s, 4),
        300,
        [
          makeStrKV("service", "notification-service"),
          makeStrKV("limit", "10"),
          makeStrKV("type", "all"),
        ],
      ),

      // Child of Notification Service - Message Queue
      makeSpan(
        "e5f6a7b8-c9d0-4123-ef01-3456789abcd2",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "d4e5f6a7-b8c9-4012-def0-23456789abc1",
        "consumeMessages",
        "message-queue",
        tsAdd(ago10s, 5),
        150,
        [
          makeStrKV("service", "message-queue"),
          makeStrKV("queue", "notifications"),
          makeStrKV("consumer", "notification-processor"),
        ],
      ),

      // Another child of root - Analytics Service (parallel to API Gateway)
      makeSpan(
        "f6a7b8c9-d0e1-4234-f012-456789abcde3",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "75787b6c-0376-4239-88ab-bb46c9d4e015",
        "trackUserActivity",
        "analytics-service",
        tsAdd(ago10s, 1),
        450,
        [
          makeStrKV("service", "analytics-service"),
          makeStrKV("event", "dashboard_view"),
          makeStrKV("user_id", "alice-123"),
        ],
      ),

      // Child of Analytics Service - Data Lake
      makeSpan(
        "a7b8c9d0-e1f2-4345-0123-56789abcdef4",
        "8f641c20-f416-45da-b25f-c35f9a116826",
        "f6a7b8c9-d0e1-4234-f012-456789abcde3",
        "storeEvent",
        "data-lake",
        tsAdd(ago10s, 2),
        350,
        [
          makeStrKV("service", "data-lake"),
          makeStrKV("storage", "s3"),
          makeStrKV("partition", "2023-06-15"),
        ],
      ),
    ],
  }),
};

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

    // fake data
    // setSpans(sampleSpans.data.spans);
    // const tree = buildSpanTree(sampleSpans.data.spans);
    // setSpanTree(tree);
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
