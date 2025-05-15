"use client";

import { Data_SubQueries, Tabular } from "api/js/types/v1/data_pb";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
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
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CirclePause,
  CirclePlay,
  Loader,
  ReceiptText,
  Sliders,
  Sparkles,
  StopCircle,
} from "lucide-react";
import { QueryResponse, StreamResponse } from "api/js/svc/query/v1/service_pb";
import { Data } from "api/js/types/v1/data_pb";
import { Cursor } from "api/js/types/v1/cursor_pb";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

      if (isStreamMode) {
        return (
          <StreamResContainer
            streamRes={streamRes}
            isLoading={isLoading}
            parsedQuery={parsedQuery}
            onStopStream={onStopStream}
            isStreamPaused={isStreamPaused}
          />
        );
      }

      if (!queryRes || !queryRes.data?.shape) {
        return (
          <div className="flex flex-1 items-center justify-center">
            <NoLogsView />
          </div>
        );
      }

      return (
        <DataRenderer
          data={queryRes.data}
          next={queryRes.next}
          parsedQuery={parsedQuery}
          queryHistoryEntry={queryHistoryEntry}
        />
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
  data: Data;
  next?: Cursor;
  parsedQuery?: Query;
  queryHistoryEntry?: QueryHistoryEntry;
  isStream?: boolean;
}

const DataRenderer = ({
  data,
  next,
  parsedQuery,
  queryHistoryEntry,
  isStream = false,
}: DataRendererProps) => {
  if (!data?.shape) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <NoLogsView />
      </div>
    );
  }

  const { case: dataCase, value } = data.shape;

  if (dataCase === "tabular" && value instanceof Tabular) {
    const { case: shapeCase, value: shapeValue } = value.shape;

    switch (shapeCase) {
      case "logEvents":
        return (
          <>
            {!isStream && (
              <div className="mt-2 flex flex-col gap-1">
                <ToggleShowPretty />
                <ToggleSplit />
              </div>
            )}
            <div className="flex-1">
              <SessionPanel
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
            data={shapeValue}
            initialNext={next}
            query={parsedQuery}
            queryHistoryEntry={queryHistoryEntry}
          />
        );
      case "spans":
        return (
          <SpansContainer
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

interface StreamResContainerProps {
  streamRes: StreamResponse[];
  isLoading: boolean;
  parsedQuery?: Query;
  onStopStream?: () => void;
  isStreamPaused: boolean;
}

const StreamResContainer = ({
  streamRes,
  isLoading,
  parsedQuery,
  isStreamPaused,
  onStopStream,
}: StreamResContainerProps) => {
  if (streamRes.length === 0) {
    return (
      <div className="mt-20 flex flex-col items-center">
        <AlertCircle className="mb-3 text-yellow-500" size={32} />
        <div>No stream data available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <ReceiptText size={18} />
          Stream Responses ({streamRes.length})
        </h3>
        <div className="flex items-center gap-2">
          <Button onClick={onStopStream} className="flex items-center gap-1">
            <StopCircle size={12} />
            Stop Stream
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader size={16} className="animate-spin" />
          <span>Receiving stream data...</span>
        </div>
      )}

      <div>
        {streamRes.map((res, i) => (
          <StreamResItem
            key={`stream-${i}-${Date.now()}`}
            response={res}
            index={i}
            responseNumber={streamRes.length - i}
            parsedQuery={parsedQuery}
            isNewest={i === 0}
          />
        ))}
      </div>
    </div>
  );
};

interface StreamResItemProps {
  response: StreamResponse;
  index: number;
  responseNumber: number;
  parsedQuery?: Query;
  isNewest?: boolean;
}

const StreamResItem = ({
  response,
  index,
  parsedQuery,
  responseNumber,
  isNewest = false,
}: StreamResItemProps) => {
  const [isExpanded, setIsExpanded] = useState(isNewest || index < 4);
  const [content, setContent] = useState<ReactNode>(null);

  useEffect(() => {
    if (isExpanded && response && response.data) {
      setContent(
        <div className="p-2">
          <DataRenderer
            data={response.data}
            parsedQuery={parsedQuery}
            isStream={true}
          />
        </div>,
      );
    }
  }, [isNewest]);

  if (!response || !response.data?.shape) {
    return (
      <div className="mb-2 rounded-md border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertCircle size={14} />
          <span>Response #{responseNumber} (No data)</span>
        </div>
      </div>
    );
  }

  const responseHeader = (
    <div className={`flex items-center justify-between p-2`}>
      <div className="flex items-center font-medium">
        <ReceiptText size={14} className="mr-1" />
        <span>Response #{responseNumber}</span>
        {isNewest && (
          <span className="bg-muted ml-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
            <Sparkles size={12} />
            <span>New</span>
          </span>
        )}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-muted-foreground flex items-center gap-1 text-sm"
      >
        {isExpanded ? (
          <>
            <ChevronUp size={16} />
            <span>Collapse</span>
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            <span>Expand</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="mb-3 overflow-hidden rounded-md border border-gray-200">
      {responseHeader}
      {isExpanded && content}
    </div>
  );
};

export default QueryOutput;
