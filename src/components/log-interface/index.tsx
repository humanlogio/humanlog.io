"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { NoLocalhostView } from "@/components/log-interface/views/no-localhost-view";
import { useActiveTransport, useApiClients } from "@/context/api-provider";
import { useAllEnvironments } from "@/context/list-environments";
import { useInfiniteQuery, useMutation } from "@connectrpc/connect-query";
import {
  query as queryMethod,
  parse,
} from "api/js/svc/query/v1/service-QueryService_connectquery";

import {
  ParseResponse,
  QueryRequest,
  QueryResponse,
  StreamRequest,
  StreamResponse,
} from "api/js/svc/query/v1/service_pb";
import {
  Query,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
  Statements,
} from "api/js/types/v1/query_pb";
import { Table, Val } from "api/js/types/v1/types_pb";
import { X } from "lucide-react";
import {
  getQuery,
  getStream,
  parseQuery,
  QueryClientType,
} from "@/services/queryService";
import { recordQueryHistory } from "@/services/userService";
import { RecordQueryHistoryResponse } from "api/js/svc/user/v1/service_private_pb";
import QueryInput from "@/components/log-interface/query-input";
import QueryOutput from "@/components/log-interface/query-output";
import { QueryLibrary } from "@/components/log-interface/query-library";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Subqueries, Logs, Spans, Data } from "api/js/types/v1/data_pb";
import { twMerge } from "tailwind-merge";
import Graph from "@/components/ui/graph/graph";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { ConnectError } from "@connectrpc/connect";
import { Duration } from "@bufbuild/protobuf";
import FeatureFlag from "@/components/posthog/feature-flag";
import { logger } from "@/lib/utils/telemetry/logger";
import { newIdentifierExpr } from "@/lib/utils/queryExpressions";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { InfiniteData } from "@tanstack/react-query";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { Span } from "api/js/types/v1/otel_tracing_pb";

export type DataCase = "subqueries" | "freeForm" | "logs" | "spans" | undefined;

// export type DataValue = Subqueries | Logs | Spans | Table | undefined;

export interface DataValue {
  pages: QueryResponse[];
  pageParams: unknown[];
  logs: Log[];
  freeForm: Table[];
  spans: Span[];
  shapeTypes: DataCase;
}

export type ExecuteQuery = (query: string) => void;

interface LogInterfaceProps {
  nav?: "query" | "stream";
}

const LogInterface = ({ nav }: LogInterfaceProps) => {
  const limit = 100;

  const router = useRouter();
  const { apiClients, activeEnvironment } = useApiClients();
  const abortControllerRef = useRef<AbortController>();

  const { localhostInfo } = useAllEnvironments();
  // const { setNext } = useInfiniteQuery();

  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const splitByDefault = searchParams.get("splitByDefault") !== "false";

  const [queryParseErrMsg, setQueryParseErrMsg] = useState("");

  const [queryRes, setQueryRes] = useState<QueryResponse | null>(null);
  const [streamRes, setStreamRes] = useState<StreamResponse[]>([]);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [editorContent, setEditorContent] = useState<string>("");
  const [queryHistoryEntry, setQueryHistoryEntry] =
    useState<QueryHistoryEntry>();
  const [savedQueryId, setSavedQueryId] = useState<bigint>();
  const [isQueryHistoryLoading, setIsQueryHistoryLoading] = useState(false);
  const [batchSize, setBatchSize] = useState<number>(100);
  const [batchInterval, setBatchInterval] = useState<number>(500);
  const [query, setQuery] = useState<Query>();

  const tracer = trace.getTracer("query-tracer");
  const span = tracer.startSpan("query-span");

  const createSplitRenderStatement = () => {
    return new RenderStatement({
      stmt: {
        case: "split",
        value: new SplitOperator({
          by: new SplitOperator_ByOperator({
            scalars: [newIdentifierExpr("_resource_fingerprint")],
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

      if (parseRes.query && type.case === "logs") {
        let renderStmt;
        let statements = parseRes.query.query?.statements ?? [];

        // if (splitByDefault) {
        //   renderStmt = createSplitRenderStatement();
        // }

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
        logger.info("Query history entry recorded");
      },
      onError: () => {
        setIsQueryHistoryLoading(false);
        logger.error("Failed to record query history");
      },
    });
  };

  const handleStreamData = (
    queryClient: QueryClientType,
    streamReq: StreamRequest,
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    // inititalize
    setStreamRes([]);
    setIsLoading(true);

    getStream(queryClient, streamReq, {
      onSuccess: (res: StreamResponse) => {
        if (signal.aborted) return;

        setStreamRes((prev) => {
          const newResponses = [res, ...prev];
          return newResponses.length > 100
            ? newResponses.slice(0, 100)
            : newResponses;
        });

        setIsLoading(false);
      },
      onError: () => {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      },
    });
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      setIsStreamPaused(true);
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const {
    data,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    status,
    isLoading: isQueryLoading,
  } = useInfiniteQuery(
    queryMethod,
    {
      environmentId: activeEnvironment?.id ?? BigInt(0),
      query: query ?? new Query(),
      limit,
    },
    {
      pageParamKey: "cursor" as const,
      getNextPageParam: (
        lastPageParam: Cursor | undefined,
        lastPage: QueryResponse,
      ) => {
        const response = lastPageParam as unknown as QueryResponse;
        return response?.next || undefined;
      },
      select: (data: InfiniteData<QueryResponse, unknown>): DataValue => {
        const logs: Log[] = [];
        const freeForm: Table[] = [];
        const spans: Span[] = [];
        let shapeTypes: DataCase;

        data.pages.forEach((page) => {
          const shape = page.data?.shape;

          if (shape?.case === "logs") {
            logs.push(...shape.value.logs);
            shapeTypes = "logs";
          } else if (shape?.case === "freeForm") {
            freeForm.push(shape.value);
            shapeTypes = "freeForm";
          } else if (shape?.case === "spans") {
            spans.push(...shape.value.spans);
            shapeTypes = "spans";
          }
        });

        return {
          ...data,
          logs,
          freeForm,
          spans,
          shapeTypes,
          pageParams: data.pageParams,
        };
      },
      initialPageParam: undefined,
      transport: useActiveTransport(),
      queryKey: ["logs", queryString, query],
      enabled: !!query,
      staleTime: 0,
      cacheTime: 0,
    },
  );

  const { mutate: parseMutation } = useMutation(parse, {
    onSuccess: (res: ParseResponse) => {
      if (!res.query) return;
      setQueryParseErrMsg("");

      handleRecordQueryHistory(editorContent, res.query);
      res.query = processQueryModifiers(res, splitByDefault);

      if (nav === "stream") {
        const streamReq = new StreamRequest({
          environmentId: activeEnvironment?.id,
          query: res.query,
          maxBatchSize: BigInt(batchSize),
          maxBatchingFor: new Duration({
            nanos: batchInterval * 1_000_000,
          }),
        });
        // handleStreamData(queryClient, streamReq);
        return;
      }

      setQuery(res.query);
    },
    onError: (error) => {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      logger.error("Failed to parse query", {
        error: error.message,
      });
      setQueryParseErrMsg(error.message);
      setQueryRes(null);
      return null;
    },
    transport: useActiveTransport(),
  });

  const executeQuery: ExecuteQuery = useCallback(
    async (query: string) => {
      try {
        span.setAttribute("query.string", query);

        const params = new URLSearchParams(searchParams);
        params.set("query", encodeURIComponent(query));
        router.push(`?${params}`);
        parseMutation({ query });

        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        if (error instanceof ConnectError) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
        } else {
        }
        throw error;
      } finally {
        span.end();
      }
    },
    [splitByDefault, searchParams, router, activeEnvironment, nav],
  );

  useEffect(() => {
    if (queryString != null) {
      executeQuery(decodeURIComponent(queryString));
    }
  }, [splitByDefault]);

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
            <div className={twMerge("items-center gap-8")}>
              <QueryInput
                errMsg={queryParseErrMsg}
                onExecuteQuery={executeQuery}
                symbol={symbol}
                editorContent={editorContent}
                setEditorContent={setEditorContent}
                parsedQuery={query}
                setSavedQueryId={setSavedQueryId}
                setIsLibraryOpen={setIsLibraryOpen}
                nav={nav}
              />
              {/* CHART */}
              <FeatureFlag flagKey="experiment_graph_view_temp" fallback={null}>
                {nav === "query" && <Graph />}
              </FeatureFlag>
            </div>
            {!isQueryHistoryLoading && (
              <QueryOutput
                data={data}
                hasNextPage={hasNextPage}
                isFetching={isFetching}
                fetchNextPage={fetchNextPage}
                streamRes={streamRes}
                isLoading={isLoading}
                parsedQuery={query}
                queryHistoryEntry={queryHistoryEntry}
                onStopStream={stopStream}
                isStreamPaused={isStreamPaused}
                nav={nav}
              />
            )}
          </div>
        </Panel>

        <PanelResizeHandle />

        <QueryLibraryPanel
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onClickSymbol={(symbolString) => setSymbol(symbolString)}
          onExecuteQuery={executeQuery}
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
  onExecuteQuery: ExecuteQuery;
}

const QueryLibraryPanel = ({
  isOpen,
  onClose,
  onClickSymbol,
  recentQueryId,
  savedQueryId,
  setSavedQueryId,
  onExecuteQuery,
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
          onExecuteQuery={onExecuteQuery}
        />
      </div>
    </Panel>
  );
};

export default LogInterface;
