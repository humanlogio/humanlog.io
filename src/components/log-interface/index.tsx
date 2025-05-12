"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useApiClients } from "@/context/api-provider";
import { useAllEnvironments } from "@/context/list-environments";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";

import {
  ParseResponse,
  QueryRequest,
  QueryResponse,
} from "api/js/svc/query/v1/service_pb";
import {
  Query,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
  Statements,
} from "api/js/types/v1/query_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import { newIdentifierExpr } from "@/lib/utils/queryBuilders";
import { X } from "lucide-react";
import { getQuery, parseQuery, QueryClientType } from "@/services/queryService";
import { recordQueryHistory } from "@/services/userService";
import { RecordQueryHistoryResponse } from "api/js/svc/user/v1/service_pb";
import QueryInput from "@/components/log-interface/query-input";
import QueryOutput from "@/components/log-interface/query-output";
import { QueryLibrary } from "@/components/log-interface/query-library";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/data_pb";
import { twMerge } from "tailwind-merge";
import config from "@/features/config";
import Graph from "@/components/ui/graph/graph";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { ConnectError } from "@connectrpc/connect";

export type DataCase =
  | "subqueries"
  | "tabular"
  | "singleValue"
  | "scalarTimeseries"
  | "vectorTimeseries"
  | undefined;

export type DataValue =
  | Data_SubQueries
  | Tabular
  | Val
  | ScalarTimeseries
  | VectorTimeseries
  | undefined;

export interface LogData {
  case: DataCase;
  value?: DataValue;
}

const LogInterface = () => {
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  const limit = 100;

  const router = useRouter();
  const { apiClients, activeEnvironment } = useApiClients();
  const { localhostInfo } = useAllEnvironments();
  const { setNext } = useInfiniteQuery();

  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const splitByDefault = searchParams.get("splitByDefault") !== "false";

  const [queryParseErrMsg, setQueryParseErrMsg] = useState("");
  const [parsedQuery, setParsedQuery] = useState<Query>();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [queryHistoryEntry, setQueryHistoryEntry] =
    useState<QueryHistoryEntry>();
  const [savedQueryId, setSavedQueryId] = useState<bigint>();
  const [isQueryHistoryLoading, setIsQueryHistoryLoading] = useState(false);

  const createSplitRenderStatement = () => {
    return new RenderStatement({
      stmt: {
        case: "split",
        value: new SplitOperator({
          by: new SplitOperator_ByOperator({
            scalars: [
              newIdentifierExpr("machine"),
              newIdentifierExpr("session"),
            ],
          }),
        }),
      },
    });
  };

  const processQueryModifiers = (
    parseRes: ParseResponse,
    splitByDefault: boolean,
  ) => {
    if (parseRes.dataType) {
      const { type } = parseRes.dataType;

      if (
        parseRes.query &&
        type.case === "tabular" &&
        type.value?.type?.case === "logEvents"
      ) {
        let renderStmt;
        let statements = parseRes.query.query?.statements ?? [];

        if (splitByDefault) {
          renderStmt = createSplitRenderStatement();
        }

        if (parseRes.query.query) {
          parseRes.query.query.render = renderStmt;
        }
        {
          parseRes.query.query = new Statements({
            statements: statements,
            render: renderStmt,
          });
        }
      }
    }

    return parseRes.query;
  };

  const handleRecordQueryHistory = (rawQuery: string, query: Query) => {
    if (!apiClients || rawQuery.length === 0) return;
    setIsQueryHistoryLoading(true);
    recordQueryHistory(apiClients?.user, rawQuery, query, {
      onSuccess: (res: RecordQueryHistoryResponse) => {
        setQueryHistoryEntry(res.entry), setIsQueryHistoryLoading(false);
      },
      onError: () => {
        setIsQueryHistoryLoading(false);
      },
    });
  };
  const handleQueryData = (
    queryClient: QueryClientType,
    queryReq: QueryRequest,
  ) => {
    setIsLoading(true);
    getQuery(queryClient, queryReq, {
      onSuccess: (res: QueryResponse) => {
        if (res.data) {
          setLogData(res.data.shape);
        }
        setIsLoading(false);
      },
      onError: () => setIsLoading(false),
    });
  };

  const getLogData = useCallback(
    async (editorContent: string, splitByDefault: boolean) => {
      const tracer = trace.getTracer("query-tracer");
      const span = tracer.startSpan("getLogData");

      const queryClient = apiClients?.query;
      if (!queryClient) {
        console.log("Invalid content or missing API client:", {
          editorContent,
          hasApiClient: !!apiClients?.query,
        });
        return null;
      }

      const parseReq = { query: editorContent };

      await parseQuery(queryClient, parseReq, {
        onSuccess: (res: ParseResponse) => {
          if (!res.query) return;
          setQueryParseErrMsg("");

          handleRecordQueryHistory(editorContent, res.query);
          res.query = processQueryModifiers(res, splitByDefault);
          setParsedQuery(res.query);

          const queryReq = new QueryRequest({
            environmentId: activeEnvironment?.id,
            query: res.query,
            limit,
          });

          handleQueryData(queryClient, queryReq);
        },
        onError: (error) => {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          setQueryParseErrMsg(error.message);
          setLogData({ case: undefined, value: undefined });
          return null;
        },
      });
      span.end();
    },
    [apiClients, activeEnvironment, limit],
  );

  const executeQuery = useCallback(
    async (query: string) => {
      const tracer = trace.getTracer("query-tracer");
      const span = tracer.startSpan("query-span");

      try {
        setNext(null);
        span.setAttribute("query.string", query);

        const params = new URLSearchParams(searchParams);
        params.set("query", encodeURIComponent(query));
        router.push(`?${params}`);
        await getLogData(query, splitByDefault);
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        if (error instanceof ConnectError) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
        }
        throw error;
      } finally {
        span.end();
      }
    },
    [setNext, splitByDefault, searchParams, router],
  );

  useEffect(() => {
    if (queryString != null) {
      executeQuery(decodeURIComponent(queryString));
    }
  }, [splitByDefault, queryString]);

  if (!localhostInfo) {
    return (
      <div className="mt-32 flex justify-center">
        <NoLocalhostView />
      </div>
    );
  }

  return (
    <section className={isLibraryOpen ? "h-[calc(100vh-4rem)]" : ""}>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={80} minSize={30}>
          <div
            className={`flex h-full flex-col gap-4 px-10 py-8 ${isLibraryOpen && "overflow-y-auto"}`}
          >
            <div
              className={twMerge(
                "items-center gap-8",
                !isProd && "grid grid-cols-2",
              )}
            >
              <QueryInput
                errMsg={queryParseErrMsg}
                onExecuteQuery={executeQuery}
                symbol={symbol}
                editorContent={editorContent}
                setEditorContent={setEditorContent}
                parsedQuery={parsedQuery}
                setSavedQueryId={setSavedQueryId}
                setIsLibraryOpen={setIsLibraryOpen}
              />
              {/* CHART */}
              {!isProd && <Graph />}
            </div>
            {!isQueryHistoryLoading && (
              <QueryOutput
                logData={logData}
                isLoading={isLoading}
                parsedQuery={parsedQuery}
                queryHistoryEntry={queryHistoryEntry}
              />
            )}
          </div>
        </Panel>

        <PanelResizeHandle />

        <QueryLibraryPanel
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onClickSymbol={(symbolString) => setSymbol(symbolString)}
          recentQueryId={queryHistoryEntry?.id}
          savedQueryId={savedQueryId}
          setSavedQueryId={setSavedQueryId}
        />
      </PanelGroup>
    </section>
  );
};

interface QueryLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClickSymbol: (symbolString: string) => void;
  recentQueryId: bigint | undefined;
  savedQueryId: bigint | undefined;
  setSavedQueryId: Dispatch<SetStateAction<bigint | undefined>>;
}

const QueryLibraryPanel = ({
  isOpen,
  onClose,
  onClickSymbol,
  recentQueryId,
  savedQueryId,
  setSavedQueryId,
}: QueryLibraryPanelProps) => {
  if (!isOpen) return null;

  return (
    <Panel defaultSize={25} maxSize={50} minSize={15} className="border-l">
      <div className="h-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Query Library</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <QueryLibrary
          onClickSymbol={onClickSymbol}
          recentQueryId={recentQueryId}
          savedQueryId={savedQueryId}
          setSavedQueryId={setSavedQueryId}
        />
      </div>
    </Panel>
  );
};

export default LogInterface;
