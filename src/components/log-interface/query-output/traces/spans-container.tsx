import { newSpansTabluar, newTabularData } from "@/lib/utils/dataBuilders";
import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { Timestamp } from "@bufbuild/protobuf";
import { Data, Spans } from "api/js/types/v1/data_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Query } from "api/js/types/v1/query_pb";
import { Span } from "api/js/types/v1/tracing_pb";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Search,
  Share,
  Clock,
  Server,
  Activity,
  Link as LinkIcon,
  FileText,
  Copy,
} from "lucide-react";
import { ShareQuery } from "@/components/log-interface/share-query";
import { Cursor } from "api/js/types/v1/cursor_pb";
import {
  FilterByKeyValue,
  KeyValueRow,
} from "@/components/log-interface/query-output/session/session-control";
import {
  newIdentifierExpr,
  newIndexorExpr,
  newLiteralExpr,
  newStrVal,
} from "@/lib/utils/queryBuilders";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { extractFromStreamResponses } from "@/lib/utils/dataHelpers";

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
  const [sharedData, setSharedData] = useState<Data | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSpans, setFilteredSpans] = useState<Span[]>();

  const onClickShare = () => {
    const data = newTabularData(newSpansTabluar(new Spans({ spans })));
    setSharedData(data);
  };

  useEffect(() => {
    if (providedData) {
      setSpans(providedData.spans);
      return;
    } else if (data) {
      setNext(initialNext);
      setSpans(data.spans);
    }
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

  // Filter spans based on search term
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
        span.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        span.spanId.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredSpans(filtered);
  }, [spans, searchTerm]);

  useEffect(() => {
    if (!streamRes) return;
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
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with controls */}
        <div className="dark:bg-gray-850 flex flex-col items-center justify-between gap-4 rounded-lg p-4 shadow-sm md:flex-row">
          <div className="text-lg font-medium">
            Total{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {filteredSpans?.length || 0}
            </span>{" "}
            span results
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
          {filteredSpans?.map((span, i) => (
            <Card
              key={`${i}-${span.traceId}-${span.spanId}`}
              className="overflow-hidden transition-colors hover:border-blue-300"
            >
              <CardHeader className="bg-gray-50 p-4 dark:bg-gray-800/60">
                <Link
                  href={`/localhost/traces?traceId=${encodeURIComponent(span.traceId)}`}
                  className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">
                      {span.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700"
                    >
                      <Server size={12} />
                      {span.serviceName}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      <Clock size={12} />
                      {formatDuration(span.timing?.duration)}
                    </Badge>
                    {span.events?.length > 0 && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                      >
                        <FileText size={12} />
                        {span.events.length} Events
                      </Badge>
                    )}
                    {span.links?.length > 0 && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                      >
                        <LinkIcon size={12} />
                        {span.links.length} Links
                      </Badge>
                    )}
                  </div>
                </Link>
              </CardHeader>

              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details" className="border-0">
                    <div className="flex items-center justify-between px-4 py-2">
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(span.timing?.start as Timestamp)}
                      </div>
                      <AccordionTrigger className="py-0">
                        <span className="sr-only">View Details</span>
                      </AccordionTrigger>
                    </div>

                    <AccordionContent>
                      <div className="space-y-4 p-4 pt-0 text-sm">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Link
                            href={`/localhost/traces?traceId=${span.traceId}`}
                            className="flex items-center gap-2"
                          >
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              Trace ID:
                            </div>
                            <div className="flex items-center gap-1 truncate text-xs text-gray-600 dark:text-gray-400">
                              {span.traceId}
                              <Button
                                variant="ghost"
                                size="xs"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(span.traceId)}
                              >
                                <Copy size={12} />
                              </Button>
                            </div>
                          </Link>
                          <Link
                            href={`/localhost/traces?traceId=${span.traceId}&spanId=${span.spanId}`}
                            className="flex items-center gap-2"
                          >
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              Span ID:
                            </div>
                            <div className="flex items-center gap-1 truncate text-xs text-gray-600 dark:text-gray-400">
                              {span.spanId}
                              <Button
                                variant="ghost"
                                size="xs"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(span.spanId)}
                              >
                                <Copy size={12} />
                              </Button>
                            </div>
                          </Link>
                        </div>

                        {/* Resource Attributes */}
                        <div className="border-t pt-3">
                          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                            Resource Attributes
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {span.resourceAttributes.length === 0 && (
                              <div className="text-xs text-gray-500">
                                No resource attributes
                              </div>
                            )}
                            {span.resourceAttributes.map((kv, kvIndex) => (
                              <Tooltip
                                key={`${span.traceId}-${span.spanId}-resource-${kvIndex}`}
                              >
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="flex cursor-pointer items-center gap-1 border-gray-200 bg-gray-50 dark:bg-gray-800"
                                  >
                                    <span className="font-mono text-xs">
                                      {kv.key}=
                                      {kv.value?.kind.value?.toString()}
                                    </span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="w-72">
                                  <div className="space-y-1.5">
                                    <KeyValueRow
                                      label="Key"
                                      value={"resource['" + kv.key + "']"}
                                    />
                                    <KeyValueRow
                                      label="Type"
                                      value={
                                        kv.value?.kind.case?.toString() ?? ""
                                      }
                                    />
                                    <KeyValueRow
                                      label="Value"
                                      value={
                                        kv.value?.kind.value?.toString() ?? ""
                                      }
                                    />
                                    <div className="mt-2 border-t border-gray-200 pt-2" />
                                    <FilterByKeyValue
                                      symbolName={newIndexorExpr(
                                        newIdentifierExpr("resource"),
                                        newLiteralExpr(newStrVal(kv.key)),
                                      )}
                                      symbolValue={newLiteralExpr(kv.value!)}
                                      symbolCase={kv.value?.kind.case}
                                    />
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>

                        {/* Span Attributes */}
                        <div className="border-t pt-3">
                          <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                            Span Attributes
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {span.spanAttributes.length === 0 && (
                              <div className="text-xs text-gray-500">
                                No span attributes
                              </div>
                            )}
                            {span.spanAttributes.map((kv, kvIndex) => (
                              <Tooltip
                                key={`${span.traceId}-${span.spanId}-attr-${kvIndex}`}
                              >
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="flex cursor-pointer items-center gap-1 border-gray-200 bg-gray-50 dark:bg-gray-800"
                                  >
                                    <span className="font-mono text-xs">
                                      {kv.key}=
                                      {kv.value?.kind.value?.toString()}
                                    </span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="w-72">
                                  <div className="space-y-1.5">
                                    <KeyValueRow
                                      label="Key"
                                      value={"attributes['" + kv.key + "']"}
                                    />
                                    <KeyValueRow
                                      label="Type"
                                      value={
                                        kv.value?.kind.case?.toString() ?? ""
                                      }
                                    />
                                    <KeyValueRow
                                      label="Value"
                                      value={
                                        kv.value?.kind.value?.toString() ?? ""
                                      }
                                    />
                                    <div className="mt-2 border-t border-gray-200 pt-2" />
                                    <FilterByKeyValue
                                      symbolName={newIndexorExpr(
                                        newIdentifierExpr("attributes"),
                                        newLiteralExpr(newStrVal(kv.key)),
                                      )}
                                      symbolValue={newLiteralExpr(kv.value!)}
                                      symbolCase={kv.value?.kind.case}
                                    />
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* InfiniteScroll observer element */}
        <div ref={targetRef} className="h-1" />

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
      </div>
    </TooltipProvider>
  );
};
