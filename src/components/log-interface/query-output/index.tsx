"use client";

import { Data_SubQueries, Tabular } from "api/js/types/v1/data_pb";
import { ReactNode, useEffect, useState } from "react";
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

interface QueryOutputProps {
  queryRes: QueryResponse | null;
  streamRes?: StreamResponse[];
  isLoading: boolean;
  parsedQuery?: Query;
  queryHistoryEntry?: QueryHistoryEntry;
  onStopStream: () => void;
  isStreamPaused: boolean;
}

const QueryOutput = ({
  queryRes,
  streamRes = [],
  isLoading,
  parsedQuery,
  queryHistoryEntry,
  onStopStream,
  isStreamPaused,
}: QueryOutputProps) => {
  const [output, setOutput] = useState<ReactNode>();
  const isStreamMode = streamRes.length > 0;

  useEffect(() => {
    const renderOutput = () => {
      if (isLoading && !isStreamMode) {
        return (
          <div className="flex w-full flex-1 items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        );
      }

      if (!isStreamMode && !queryRes) {
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
            data={queryRes?.data}
            next={queryRes?.next}
            streamRes={streamRes}
            parsedQuery={parsedQuery}
            queryHistoryEntry={queryHistoryEntry}
          />
        </>
      );
    };

    setOutput(renderOutput());
  }, [
    queryRes,
    streamRes,
    isLoading,
    parsedQuery,
    queryHistoryEntry,
    isStreamMode,
  ]);

  return output;
};

interface DataRendererProps {
  data?: Data;
  next?: Cursor;
  parsedQuery?: Query;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
  isStream?: boolean;
}

const DataRenderer = ({
  data,
  next,
  parsedQuery,
  queryHistoryEntry,
  streamRes,
  isStream = false,
}: DataRendererProps) => {
  if (!data?.shape && !streamRes) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <NoLogsView />
      </div>
    );
  }

  const { dataCase, value } = getShapeFromResponse(streamRes, data);

  if (dataCase === "tabular" && value instanceof Tabular) {
    const { case: shapeCase, value: shapeValue } = value.shape;

    switch (shapeCase) {
      case "logEvents":
        return (
          <>
            <div className="mt-2 flex flex-col gap-1">
              <ToggleShowPretty />
              {!streamRes && <ToggleSplit />}
            </div>
            <div className="flex-1">
              <SessionPanel
                streamRes={streamRes}
                data={shapeValue}
                initialNext={next}
                query={parsedQuery}
                queryHistoryEntry={queryHistoryEntry}
                ids={extractQueryIds(parsedQuery as Query)}
              />
            </div>
          </>
        );
      case "freeForm":
        return (
          <FreeFormContainer
            streamRes={streamRes}
            data={shapeValue}
            initialNext={next}
            query={parsedQuery}
            queryHistoryEntry={queryHistoryEntry}
          />
        );
      case "spans":
        return (
          <SpansContainer
            streamRes={streamRes}
            data={shapeValue}
            initialNext={next}
            query={parsedQuery}
            queryHistoryEntry={queryHistoryEntry}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <AlertCircle className="mx-auto mb-2" />
            <p>Unsupported format</p>
          </div>
        );
    }
  }

  if (dataCase === "subqueries" && value instanceof Data_SubQueries) {
    const { queries } = value;
    return (
      <div className="flex-1">
        <SubQueriesContainer
          queries={queries}
          queryHistoryEntry={queryHistoryEntry}
        />
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <p className="mb-2 text-gray-600">Data type: {dataCase}</p>
      <pre className="rounded bg-gray-100 p-4 text-left text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
};

export default QueryOutput;
