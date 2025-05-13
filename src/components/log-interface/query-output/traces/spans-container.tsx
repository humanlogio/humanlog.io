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
import { Share } from "lucide-react";
import { ShareQuery } from "@/components/log-interface/share-query";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { FilterByKeyValue, KeyValueRow } from "../session/session-control";
import {
  newIdentifierExpr,
  newIndexorExpr,
  newLiteralExpr,
  newStrVal,
} from "@/lib/utils/queryBuilders";

interface FreeFormContainerProps {
  query: Query | undefined;
  data?: Spans;
  initialNext?: Cursor | null;
  providedData?: Spans;
  queryHistoryEntry?: QueryHistoryEntry;
}

export const SpansContainer = ({
  query,
  data,
  initialNext,
  providedData,
  queryHistoryEntry,
}: FreeFormContainerProps) => {
  const { targetRef, fetchNext, fetchData, next, setNext } =
    useInfiniteQuery(query);
  const [spans, setSpans] = useState<Span[]>();
  const [sharedData, setSharedData] = useState<Data | null>(null);

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

  return (
    spans && (
      <div>
        <TooltipProvider>
          {queryHistoryEntry && (
            <div className="mb-5 flex w-full justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onClickShare} size="xs" variant="outline">
                      <Share size={12} />
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
              </TooltipProvider>
            </div>
          )}
          {spans?.map((span, i) => {
            return (
              <Link
                key={`${i}-${span.traceId}-${span.spanId}`}
                href={`/localhost/traces/${encodeURIComponent(span.traceId)}`}
                className={`flex flex-col gap-1 border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 ${i === 0 && "border-t"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {span.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(span.timing?.start as Timestamp)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="rounded bg-gray-100/90 px-2 py-0.5 dark:bg-gray-700/50">
                    {span.serviceName}
                  </div>
                  <div className="rounded bg-blue-50/90 px-2 py-0.5 dark:bg-blue-900/30">
                    {formatDuration(span.timing?.duration)}
                  </div>

                  {span.events?.length > 0 && (
                    <div className="rounded bg-green-50/90 px-2 py-0.5 dark:bg-green-900/30">
                      {span.events.length} Events
                    </div>
                  )}

                  {span.links?.length > 0 && (
                    <div className="rounded bg-green-50/90 px-2 py-0.5 dark:bg-green-900/30">
                      {span.links.length} Links
                    </div>
                  )}
                </div>

                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Trace: {span.traceId}
                </div>
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  span: {span.spanId}
                </div>
                <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  parent: {span.parentSpanId}
                </div>
                <div>
                  resource attributes:
                  {span.resourceAttributes.map((kv, kvIndex) => (
                    <span
                      key={`${span.traceId}-${span.spanId}-${kvIndex}`}
                      className="mr-1 inline-flex"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline">
                            <span>{"resource['" + kv.key + "']"}=</span>
                            <span>{kv.value?.kind.value?.toString()}</span>
                          </span>
                        </TooltipTrigger>

                        <TooltipContent>
                          <KeyValueRow
                            label="Key"
                            value={"resource['" + kv.key + "']"}
                          />
                          <KeyValueRow
                            label="Type"
                            value={kv.value?.kind.case?.toString() ?? ""}
                          />
                          <KeyValueRow
                            label="Value"
                            value={kv.value?.kind.value?.toString() ?? ""}
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
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  ))}
                </div>
                <div>
                  span attributes:
                  {span.spanAttributes.map((kv, kvIndex) => (
                    <span
                      key={`${span.traceId}-${span.spanId}-${kvIndex}`}
                      className="mr-1 inline-flex"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline">
                            <span>{"attributes['" + kv.key + "']"}=</span>
                            <span>{kv.value?.kind.value?.toString()}</span>
                          </span>
                        </TooltipTrigger>

                        <TooltipContent>
                          <KeyValueRow
                            label="Key"
                            value={"attributes['" + kv.key + "']"}
                          />
                          <KeyValueRow
                            label="Type"
                            value={kv.value?.kind.case?.toString() ?? ""}
                          />
                          <KeyValueRow
                            label="Value"
                            value={kv.value?.kind.value?.toString() ?? ""}
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
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
          <div ref={targetRef} className="h-1" />
        </TooltipProvider>
      </div>
    )
  );
};
