import { arrayBufferToBase64 } from "@/lib/utils/decode";
import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { Timestamp } from "@bufbuild/protobuf";
import { Spans } from "api/js/types/v1/data_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Query } from "api/js/types/v1/query_pb";
import { Span } from "api/js/types/v1/tracing_pb";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FreeFormContainerProps {
  query: Query | undefined;
  providedData?: Spans;
  queryHistoryEntry?: QueryHistoryEntry;
}

export const SpansContainer = ({
  query,
  providedData,
  queryHistoryEntry,
}: FreeFormContainerProps) => {
  const { targetRef, fetchNext, fetchData, next } = useInfiniteQuery(query);
  const [spans, setSpans] = useState<Span[]>();

  useEffect(() => {
    if (providedData) {
      setSpans(providedData.spans);
      return;
    } else {
      if (!query) return;
      fetchData(({ value: shapeValue }) => {
        setSpans(shapeValue.spans);
      });
    }
  }, [query]);

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
    <div>
      {spans?.map((span, i) => {
        return (
          <Link
            key={`${i}-${arrayBufferToBase64(span.traceId)}-${arrayBufferToBase64(span.spanId)}`}
            href={`/localhost/traces/${encodeURIComponent(encodeURIComponent(arrayBufferToBase64(span.spanId)))}`}
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
            </div>

            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Trace: {arrayBufferToBase64(span.traceId)}
            </div>
          </Link>
        );
      })}
      <div ref={targetRef} className="h-1" />
    </div>
  );
};
