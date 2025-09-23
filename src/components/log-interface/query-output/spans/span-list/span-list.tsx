import { Span } from "api/js/types/v1/otel_tracing_pb";
import { Search, Server, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback, useEffect, useState } from "react";
import { Data, SpansSchema } from "api/js/types/v1/data_pb";
import { Input } from "@/components/ui/input";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { ShareQuery } from "@/components/log-interface/share-query";
import { newSpansData } from "@/lib/utils/dataShapeFactories";
import { SpanCard } from "@/components/log-interface/query-output/spans/span-list/span-card";
import { create } from "@bufbuild/protobuf";
import { Virtuoso } from "react-virtuoso";

interface SpanListProps {
  spans: Span[];
  queryHistoryEntry?: QueryHistoryEntry;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

export const SpanList = ({
  spans,
  queryHistoryEntry,
  hasNextPage,
  fetchNextPage,
}: SpanListProps) => {
  const [filteredSpans, setFilteredSpans] = useState<Span[]>();
  const [sharedData, setSharedData] = useState<Data | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const onClickShare = () => {
    const data = newSpansData(create(SpansSchema, { spans }));
    setSharedData(data);
  };

  // // Filter spans based on search term
  useEffect(() => {
    if (!spans) return;

    if (!searchTerm) {
      setFilteredSpans(spans);
      return;
    }

    const filtered = spans.filter(
      (span) =>
        span.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        span.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        span.traceId
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        span.spanId
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

    setFilteredSpans(filtered);
  }, [spans, searchTerm]);

  const loadMore = useCallback(() => {
    hasNextPage && fetchNextPage && fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Header with controls */}
        <div className="dark:bg-gray-850 flex flex-col items-center justify-between gap-4 rounded-lg px-4 py-2 shadow-sm md:flex-row">
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium">
              Total{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {filteredSpans?.length || 0}
              </span>{" "}
              span results
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 md:w-auto">
            <div className="relative flex-grow md:w-64 md:flex-grow-0">
              <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, service, ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {queryHistoryEntry && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onClickShare}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <Share size={14} />
                    Share
                  </Button>
                </TooltipTrigger>
                {sharedData && (
                  <ShareQuery
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                    queryHistoryEntry={queryHistoryEntry}
                  />
                )}
                <TooltipContent>Share Query</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Spans list */}
        <div>
          {filteredSpans && (
            <Virtuoso
              style={{ height: "calc(100vh - 320px)", minHeight: "300px" }}
              totalCount={filteredSpans?.length}
              endReached={loadMore}
              itemContent={(i) => (
                <SpanCard index={i} span={filteredSpans[i]} />
              )}
            />
          )}
        </div>
      </div>

      {/* No results state */}
      {filteredSpans && filteredSpans.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Search className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No Results Found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search term or filters
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </Button>
        </div>
      )}
    </>
  );
};
