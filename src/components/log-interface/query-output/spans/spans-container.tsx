import { Spans } from "api/js/types/v1/data_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Query } from "api/js/types/v1/query_pb";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Network } from "lucide-react";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { QueryResponse, StreamResponse } from "api/js/svc/query/v1/service_pb";
import { extractFromStreamResponses } from "@/lib/utils/dataHelpers";

import { ServiceMap } from "@/components/log-interface/query-output/spans/service-map/service-map";
import { SpanList } from "@/components/log-interface/query-output/spans/span-list/span-list";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { InfiniteData } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

interface SpansContainerProps {
  spans?: Span[] | undefined;
  hasNextPage?: boolean;
  isFetching?: boolean;
  fetchNextPage?: () => void;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
}

export const SpansContainer = ({
  spans,
  hasNextPage,
  isFetching,
  fetchNextPage,
  queryHistoryEntry,
  streamRes,
}: SpansContainerProps) => {
  const { ref: targetRef, inView } = useInView();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    if (inView && fetchNextPage) fetchNextPage();
  }, [inView]);

  // useEffect(() => {
  //   if (!streamRes || streamRes.length === 0) return;
  //   const _spans = extractFromStreamResponses<Span>(
  //     streamRes,
  //     (value) => value.spans,
  //   );
  //   setSpans(_spans);
  // }, [streamRes]);

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
          hasNextPage={hasNextPage}
          targetRef={targetRef}
        />
      )}

      {/* Service Map */}
      {viewMode === "map" && <ServiceMap spans={spans} />}
    </>
  );
};
