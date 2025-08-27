import { Span } from "api/js/types/v1/otel_tracing_pb";
import { Search, Server, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { Data, Spans } from "api/js/types/v1/data_pb";
import { Input } from "@/components/ui/input";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { ShareQuery } from "@/components/log-interface/share-query";
import { newSpansData } from "@/lib/utils/dataShapeFactories";
import { SpanCard } from "@/components/log-interface/query-output/spans/span-list/span-card";

interface SpanListProps {
  spans: Span[];
  queryHistoryEntry?: QueryHistoryEntry;
  targetRef: (node?: Element | null) => void;
  hasNextPage?: boolean;
}

export const SpanList = ({
  spans,
  queryHistoryEntry,
  targetRef,
  hasNextPage,
}: SpanListProps) => {
  const [filteredSpans, setFilteredSpans] = useState<Span[]>();
  const [sharedData, setSharedData] = useState<Data | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const onClickShare = () => {
    const data = newSpansData(new Spans({ spans }));
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

  return (
    <>
      {/* Header with controls */}
      <div className="dark:bg-gray-850 flex flex-col items-center justify-between gap-4 rounded-lg p-4 shadow-sm md:flex-row">
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
      <div className="space-y-4">
        {filteredSpans?.map((span, i) => {
          return (
            <SpanCard key={`${i}-${span.traceId}-${span.spanId}`} span={span} />
          );
        })}
        {/* InfiniteScroll observer element */}
        {hasNextPage && <div ref={targetRef} className="h-1" />}
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
