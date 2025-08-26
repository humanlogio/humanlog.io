"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Query } from "api/js/types/v1/query_pb";
import { NoLogsView } from "@/components/log-interface/views/no-logs-view";
import { SubQueriesContainer } from "@/components/log-interface/query-output/session/subqueries-container";
import { extractQueryIds } from "@/lib/utils/extractQueryIds";
import {
  ToggleShowPretty,
  ToggleSplit,
} from "@/components/log-interface/query-output/toggles";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { FreeFormContainer } from "@/components/log-interface/query-output/freeform";
import { SpansContainer } from "@/components/log-interface/query-output/traces/spans-container";
import { AlertCircle, Loader, ReceiptText, StopCircle } from "lucide-react";
import { QueryResponse, StreamResponse } from "api/js/svc/query/v1/service_pb";
import { Data } from "api/js/types/v1/data_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { getShapeFromResponse } from "@/lib/utils/dataHelpers";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { InfiniteData } from "@tanstack/react-query";
import { DataCase, DataValue } from "@/components/log-interface";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { Table } from "api/js/types/v1/types_pb";
import { Span } from "api/js/types/v1/otel_tracing_pb";

interface QueryOutputProps {
  data: DataValue | undefined;
  hasNextPage: boolean;
  isFetching: boolean;
  isQueryLoading: boolean;
  fetchNextPage: () => void;
  streamRes?: StreamResponse[];
  isStreamLoading: boolean;
  parsedQuery?: Query;
  queryHistoryEntry?: QueryHistoryEntry;
  onStopStream: () => void;
  isStreamPaused: boolean;
  nav?: "query" | "stream";
}

const QueryOutput = ({
  data,
  hasNextPage,
  isFetching,
  isQueryLoading,
  fetchNextPage,
  streamRes = [],
  isStreamLoading,
  parsedQuery,
  queryHistoryEntry,
  onStopStream,
  isStreamPaused,
  nav,
}: QueryOutputProps) => {
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const [output, setOutput] = useState<ReactNode>();
  const isStreamMode = streamRes.length > 0;

  useEffect(() => {
    const renderOutput = () => {
      if (isStreamLoading || isQueryLoading || isFetching) {
        return (
          <div className="flex w-full flex-1 items-center justify-center">
            <Loader className="animate-spin" size={20} />
          </div>
        );
      }

      if (queryString === null) {
        const isStreamMode = nav === "stream";
        return (
          <div className="flex flex-1 items-center justify-center">
            <div className="mt-10 text-center">
              <h3 className="mb-2 text-xl font-semibold">
                {isStreamMode
                  ? "Ready to stream your logs?"
                  : "Ready to query your logs?"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Click the{" "}
                <span className="bg-muted rounded px-2 py-1 font-semibold">
                  {" "}
                  Run
                </span>{" "}
                button or press{" "}
                <span className="bg-muted rounded px-2 py-1 font-semibold">
                  ⌘+Enter
                </span>{" "}
                to {isStreamMode ? "start streaming" : "execute your query"}
              </p>
            </div>
          </div>
        );
      }

      if (!isStreamMode && !data) {
        return (
          <div className="flex flex-1 items-center justify-center">
            <NoLogsView />
          </div>
        );
      }

      if (isStreamMode && !streamRes) {
        return (
          <div className="mt-20 flex flex-col items-center">
            <AlertCircle className="mb-3 text-yellow-500" size={32} />
            <div>No stream data available</div>
          </div>
        );
      }

      return (
        <>
          {isStreamMode && (
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <ReceiptText size={18} />
                Stream Responses ({streamRes.length})
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={onStopStream}
                  className="flex items-center gap-1"
                >
                  <StopCircle size={12} />
                  Stop Stream
                </Button>
              </div>
            </div>
          )}
          <DataRenderer
            data={data}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
            fetchNextPage={fetchNextPage}
            streamRes={streamRes}
            parsedQuery={parsedQuery}
            queryHistoryEntry={queryHistoryEntry}
          />
        </>
      );
    };

    setOutput(renderOutput());
  }, [
    data,
    streamRes,
    isStreamLoading,
    parsedQuery,
    queryHistoryEntry,
    isStreamMode,
    queryString,
  ]);

  return output;
};

export const normalizeStreamData = (streamRes: StreamResponse[]): DataValue => {
  const logs: Log[] = [];
  const freeForm: Table[] = [];
  const spans: Span[] = [];
  let shapeTypes: DataCase | undefined;

  streamRes.forEach((response) => {
    const shape = response.data?.shape;

    if (shape?.case === "logs") {
      logs.push(...shape.value.logs);
      if (!shapeTypes) shapeTypes = "logs";
    } else if (shape?.case === "freeForm") {
      freeForm.push(shape.value);
      if (!shapeTypes) shapeTypes = "freeForm";
    } else if (shape?.case === "spans") {
      spans.push(...shape.value.spans);
      if (!shapeTypes) shapeTypes = "spans";
    }
  });

  return {
    logs,
    freeForm,
    spans,
    shapeTypes: shapeTypes || "logs",
  };
};

interface DataRendererProps {
  data?: DataValue;
  hasNextPage?: boolean;
  isFetching?: boolean;
  fetchNextPage?: () => void;
  parsedQuery?: Query;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
  isStream?: boolean;
}

export const DataRenderer = ({
  data,
  hasNextPage,
  isFetching,
  fetchNextPage,
  parsedQuery,
  queryHistoryEntry,
  streamRes,
  isStream = false,
}: DataRendererProps) => {
  const normalizedData = useMemo(() => {
    if (streamRes && streamRes.length > 0) {
      return normalizeStreamData(streamRes);
    }
    return data;
  }, [streamRes, data]);

  const { logs, freeForm, spans, shapeTypes, queries } = normalizedData ?? {};

  if (!logs?.length && !freeForm?.length && !spans?.length && !streamRes) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <NoLogsView />
      </div>
    );
  }

  switch (shapeTypes) {
    case "logs":
      return (
        <>
          <div className="mt-2 flex flex-col gap-1">
            <ToggleShowPretty />
            {(!streamRes || streamRes?.length === 0) && parsedQuery && (
              <ToggleSplit />
            )}
          </div>
          <div className="flex-1">
            <SessionPanel
              streamRes={streamRes}
              logs={logs}
              hasNextPage={hasNextPage}
              isFetching={isFetching}
              fetchNextPage={fetchNextPage}
              queryHistoryEntry={queryHistoryEntry}
              {...(parsedQuery && { ids: extractQueryIds(parsedQuery) })}
            />
          </div>
        </>
      );
    case "freeForm":
      return (
        <FreeFormContainer
          streamRes={streamRes}
          freeForm={freeForm}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          fetchNextPage={fetchNextPage}
          queryHistoryEntry={queryHistoryEntry}
        />
      );
    case "spans":
      return (
        <SpansContainer
          streamRes={streamRes}
          spans={spans}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          fetchNextPage={fetchNextPage}
          queryHistoryEntry={queryHistoryEntry}
        />
      );
    case "subqueries":
      return (
        <div className="flex-1">
          <SubQueriesContainer
            queries={queries ?? []}
            queryHistoryEntry={queryHistoryEntry}
          />
        </div>
      );
    default:
      return (
        <div className="p-4 text-center text-gray-500">
          <AlertCircle className="mx-auto mb-2" />
          <p>Unsupported format</p>
        </div>
      );
  }
};

export default QueryOutput;
