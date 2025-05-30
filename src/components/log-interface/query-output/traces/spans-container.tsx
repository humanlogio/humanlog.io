import { useInfiniteQuery } from "@/lib/hooks/useInfiniteQuery";
import { Timestamp } from "@bufbuild/protobuf";
import { Data, Spans } from "api/js/types/v1/data_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Query } from "api/js/types/v1/query_pb";
import { Span } from "api/js/types/v1/tracing_pb";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Network } from "lucide-react";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { extractFromStreamResponses } from "@/lib/utils/dataHelpers";
import { makeSpan } from "@/lib/utils/spanFactories";
import { toBigInt } from "@/lib/utils/valueFactories";
import { makeStrKV } from "@/lib/utils/kvFactories";
import { ServiceMap } from "@/components/log-interface/query-output/traces/service-map";
import { SpanList } from "@/components/log-interface/query-output/traces/span-list";

// Service Map 테스트용 샘플 데이터
const ago15s = new Timestamp({
  seconds: toBigInt(Date.now() / 1000 - 15),
  nanos: 0,
});

const tsAdd = (ts: Timestamp, seconds: number) => {
  return new Timestamp({
    seconds: ts.seconds + BigInt(seconds),
    nanos: Number(ts.nanos),
  });
};

const sampleServiceMapSpans = new Spans({
  spans: [
    // Root span - Frontend App
    makeSpan(
      "frontend-span-1",
      "trace-abc123",
      "",
      "userDashboard",
      "frontend-app",
      tsAdd(ago15s, 0),
      2000,
      [
        makeStrKV("service", "frontend-app"),
        makeStrKV("page", "/dashboard"),
        makeStrKV("user_id", "user-123"),
      ],
    ),

    // Frontend -> API Gateway (첫 번째 호출)
    makeSpan(
      "gateway-span-1",
      "trace-abc123",
      "frontend-span-1",
      "getUserData",
      "api-gateway",
      tsAdd(ago15s, 1),
      800,
      [
        makeStrKV("service", "api-gateway"),
        makeStrKV("method", "GET"),
        makeStrKV("path", "/api/user"),
      ],
    ),

    // API Gateway -> User Service (첫 번째 호출)
    makeSpan(
      "user-span-1",
      "trace-abc123",
      "gateway-span-1",
      "fetchUserProfile",
      "user-service",
      tsAdd(ago15s, 2),
      300,
      [
        makeStrKV("service", "user-service"),
        makeStrKV("user_id", "user-123"),
        makeStrKV("operation", "profile"),
      ],
    ),

    // User Service -> Database (첫 번째 호출)
    makeSpan(
      "db-span-1",
      "trace-abc123",
      "user-span-1",
      "queryUserProfile",
      "database",
      tsAdd(ago15s, 3),
      150,
      [
        makeStrKV("service", "database"),
        makeStrKV("table", "users"),
        makeStrKV("query_type", "select"),
      ],
    ),

    // API Gateway -> User Service (두 번째 호출)
    makeSpan(
      "user-span-2",
      "trace-abc123",
      "gateway-span-1",
      "fetchUserPreferences",
      "user-service",
      tsAdd(ago15s, 4),
      250,
      [
        makeStrKV("service", "user-service"),
        makeStrKV("user_id", "user-123"),
        makeStrKV("operation", "preferences"),
      ],
    ),

    // User Service -> Database (두 번째 호출)
    makeSpan(
      "db-span-2",
      "trace-abc123",
      "user-span-2",
      "queryUserPreferences",
      "database",
      tsAdd(ago15s, 5),
      120,
      [
        makeStrKV("service", "database"),
        makeStrKV("table", "user_preferences"),
        makeStrKV("query_type", "select"),
      ],
    ),

    // Frontend -> API Gateway (두 번째 호출 - 병렬)
    makeSpan(
      "gateway-span-2",
      "trace-abc123",
      "frontend-span-1",
      "getNotifications",
      "api-gateway",
      tsAdd(ago15s, 2),
      600,
      [
        makeStrKV("service", "api-gateway"),
        makeStrKV("method", "GET"),
        makeStrKV("path", "/api/notifications"),
      ],
    ),

    // API Gateway -> Notification Service
    makeSpan(
      "notification-span-1",
      "trace-abc123",
      "gateway-span-2",
      "fetchUserNotifications",
      "notification-service",
      tsAdd(ago15s, 3),
      400,
      [
        makeStrKV("service", "notification-service"),
        makeStrKV("user_id", "user-123"),
        makeStrKV("limit", "20"),
      ],
    ),

    // Notification Service -> Database (세 번째 호출)
    makeSpan(
      "db-span-3",
      "trace-abc123",
      "notification-span-1",
      "queryNotifications",
      "database",
      tsAdd(ago15s, 4),
      200,
      [
        makeStrKV("service", "database"),
        makeStrKV("table", "notifications"),
        makeStrKV("query_type", "select"),
      ],
    ),

    // Notification Service -> User Service (크로스 호출)
    makeSpan(
      "user-span-3",
      "trace-abc123",
      "notification-span-1",
      "validateUserNotificationSettings",
      "user-service",
      tsAdd(ago15s, 5),
      100,
      [
        makeStrKV("service", "user-service"),
        makeStrKV("user_id", "user-123"),
        makeStrKV("operation", "notification_settings"),
      ],
    ),

    // User Service -> Database (네 번째 호출)
    makeSpan(
      "db-span-4",
      "trace-abc123",
      "user-span-3",
      "queryNotificationSettings",
      "database",
      tsAdd(ago15s, 6),
      80,
      [
        makeStrKV("service", "database"),
        makeStrKV("table", "user_settings"),
        makeStrKV("query_type", "select"),
      ],
    ),

    // Frontend -> Notification Service (직접 호출)
    makeSpan(
      "notification-span-2",
      "trace-abc123",
      "frontend-span-1",
      "markAsRead",
      "notification-service",
      tsAdd(ago15s, 7),
      150,
      [
        makeStrKV("service", "notification-service"),
        makeStrKV("action", "mark_read"),
        makeStrKV("notification_ids", "1,2,3"),
      ],
    ),

    // Notification Service -> Database (다섯 번째 호출)
    makeSpan(
      "db-span-5",
      "trace-abc123",
      "notification-span-2",
      "updateNotificationStatus",
      "database",
      tsAdd(ago15s, 8),
      100,
      [
        makeStrKV("service", "database"),
        makeStrKV("table", "notifications"),
        makeStrKV("query_type", "update"),
      ],
    ),
  ],
});

interface FreeFormContainerProps {
  query: Query | undefined;
  data?: Spans;
  initialNext?: Cursor | null;
  providedData?: Spans;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
}

export const SpansContainer = ({
  query,
  data,
  initialNext,
  providedData,
  queryHistoryEntry,
  streamRes,
}: FreeFormContainerProps) => {
  const { targetRef, fetchNext, fetchData, next, setNext } =
    useInfiniteQuery(query);
  const [spans, setSpans] = useState<Span[]>();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    // if (providedData) {
    //   setSpans(providedData.spans);
    //   return;
    // } else if (data) {
    //   setNext(initialNext);
    //   setSpans(data.spans);
    // } else {
    //   fetchData(({ value: shapeValue }) => {
    //     setSpans(shapeValue.spans);
    //   });
    // }

    // fake data
    setSpans(sampleServiceMapSpans.spans);
  }, []);

  useEffect(() => {
    next &&
      fetchNext &&
      fetchData(({ value: shapeValue }) => {
        setSpans((prev) => {
          if (prev) {
            return [...prev, ...shapeValue.spans];
          }
        });
      });
  }, [fetchNext]);

  useEffect(() => {
    if (!streamRes || streamRes.length === 0) return;
    const _spans = extractFromStreamResponses<Span, Spans>(
      streamRes,
      (value) => value.spans,
    );
    setSpans(_spans);
  }, [streamRes]);

  if (!spans) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* View Mode Toggle */}
        <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-r-none border-r"
          >
            <List size={16} className="mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="rounded-l-none"
          >
            <Network size={16} className="mr-1" />
            Service Map
          </Button>
        </div>
      </div>

      {/* Spans list */}
      {viewMode === "list" && (
        <SpanList
          spans={spans}
          queryHistoryEntry={queryHistoryEntry}
          targetRef={targetRef}
        />
      )}

      {/* Service Map */}
      {viewMode === "map" && <ServiceMap spans={spans} />}
    </>
  );
};
