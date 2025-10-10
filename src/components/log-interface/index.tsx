"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useActiveTransport, useApiClients } from "@/context/api-provider";
import { useInfiniteQuery, useMutation } from "@connectrpc/connect-query";
import {
  query as queryMethod,
  parse,
} from "api/js/svc/query/v1/service-QueryService_connectquery";
import {
  ParseResponse,
  QueryResponse,
  StreamRequestSchema,
  StreamResponse,
} from "api/js/svc/query/v1/service_pb";
import {
  Query,
  RenderStatementSchema,
  SplitOperatorSchema,
  SplitOperator_ByOperatorSchema,
  StatementsSchema,
} from "api/js/types/v1/query_pb";
import { Table, Val } from "api/js/types/v1/types_pb";
import { X } from "lucide-react";
import { getStream } from "@/services/queryService";
import { recordQueryHistory } from "@/services/userService";
import { RecordQueryHistoryResponse } from "api/js/svc/user/v1/service_private_pb";
import QueryInput from "@/components/log-interface/query-input";
import QueryOutput from "@/components/log-interface/query-output";
import { QueryLibrary } from "@/components/log-interface/query-library";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { twMerge } from "tailwind-merge";
import Graph from "@/components/ui/graph/graph";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { ConnectError } from "@connectrpc/connect";
import { DurationSchema } from "@bufbuild/protobuf/wkt";
import FeatureFlag from "@/components/posthog/feature-flag";
import { logger } from "@/lib/utils/telemetry/logger";
import { newIdentifierExpr } from "@/lib/utils/queryExpressions";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { QueryTimer } from "@/components/log-interface/query-timer";
import { create } from "@bufbuild/protobuf";
import { useEnvironmentStore } from "@/stores/environment-store";

export type DataCase = "subqueries" | "freeForm" | "logs" | "spans" | undefined;

export interface DataValue {
  pages?: QueryResponse[];
  logs: Log[];
  freeForm: Table[];
  spans: Span[];
  queries?: Query[];
  shapeTypes: DataCase;
}

export type ExecuteQuery = (query: string) => void;

interface LogInterfaceProps {
  nav?: "query" | "stream";
}

export type QueryTiming = {
  isActive: boolean;
  startTime: number | null;
  currentDuration: number;
  isCompleted: boolean;
};

const LogInterface = ({ nav }: LogInterfaceProps) => {
  const limit = 1000;
  const router = useRouter();

  const searchParams = useSearchParams();
  const { apiClients } = useApiClients();
  const { activeEnvironment } = useEnvironmentStore();
  const abortControllerRef = useRef<AbortController>();

  const queryString = searchParams.get("query");
  const splitByDefault = searchParams.get("splitByDefault") !== "false";

  const [queryParseErrMsg, setQueryParseErrMsg] = useState("");
  const [queryRes, setQueryRes] = useState<QueryResponse | null>(null);
  const [streamRes, setStreamRes] = useState<StreamResponse[]>([]);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [isStreamLoading, setisStreamLoading] = useState(false);
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
  const [queryTiming, setQueryTiming] = useState<QueryTiming>({
    isActive: false,
    startTime: null,
    currentDuration: 0,
    isCompleted: false,
  });

  const tracer = trace.getTracer("query-tracer");
  const span = tracer.startSpan("query-span");

  const createSplitRenderStatement = () => {
    return create(RenderStatementSchema, {
      stmt: {
        case: "split",
        value: create(SplitOperatorSchema, {
          by: create(SplitOperator_ByOperatorSchema, {
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

        if (splitByDefault) {
          renderStmt = createSplitRenderStatement();
        }

        if (parseRes.query.query) {
          parseRes.query.query.render = renderStmt;
        }
        {
          parseRes.query.query = create(StatementsSchema, {
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

  const handleStreamData = (query: Query) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!apiClients?.query) return;

    const streamReq = create(StreamRequestSchema, {
      environmentId: activeEnvironment?.environment?.id,
      query,
      maxBatchSize: BigInt(batchSize),
      maxBatchingFor: create(DurationSchema, {
        nanos: batchInterval * 1_000_000,
      }),
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    // inititalize
    setStreamRes([]);
    setisStreamLoading(true);

    getStream(apiClients.query, streamReq, {
      onSuccess: (res: StreamResponse) => {
        if (signal.aborted) return;

        setStreamRes((prev) => {
          const newResponses = [res, ...prev];
          return newResponses.length > 100
            ? newResponses.slice(0, 100)
            : newResponses;
        });

        setisStreamLoading(false);
      },
      onError: () => {
        if (!signal.aborted) {
          setisStreamLoading(false);
        }
      },
    });
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      setIsStreamPaused(true);
      abortControllerRef.current.abort();
      setisStreamLoading(false);
    }
  };

  const {
    data: rawData,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    status,
    isLoading: isQueryLoading,
  } = useInfiniteQuery(
    queryMethod,
    // @ts-ignore
    {
      environmentId: activeEnvironment?.environment?.id,
      query: query,
      limit,
    },
    {
      pageParamKey: "cursor" as const,
      getNextPageParam: (lastPage: QueryResponse) => {
        return lastPage?.next || undefined;
      },
      transport: useActiveTransport(),
      enabled: !!query && nav === "query",
    },
  );

  const data: DataValue | undefined = useMemo(() => {
    if (!rawData?.pages?.length) return;

    const logs: Log[] = [];
    const freeForm: Table[] = [];
    const spans: Span[] = [];
    const queries: Query[] = [];
    let shapeTypes: DataCase;

    rawData.pages.forEach((page: QueryResponse) => {
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
      } else if (shape?.case === "subqueries") {
        queries.push(...shape.value.queries);
        shapeTypes = "subqueries";
      }
    });

    return {
      pages: rawData.pages,
      logs,
      freeForm,
      spans,
      queries,
      shapeTypes,
    };
  }, [rawData]);

  const { mutate: parseMutation } = useMutation(parse, {
    onSuccess: (res: ParseResponse) => {
      if (!res.query) return;
      setQueryParseErrMsg("");

      handleRecordQueryHistory(editorContent, res.query);
      res.query = processQueryModifiers(res, splitByDefault);
      setQuery(res.query);

      if (nav === "stream" && res.query) {
        handleStreamData(res.query);
        return;
      }
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

  // Real-time counter update
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (queryTiming.isActive && queryTiming.startTime) {
      intervalId = setInterval(() => {
        const currentDuration = performance.now() - queryTiming.startTime!;
        setQueryTiming((prev) => ({ ...prev, currentDuration }));
      }, 100); // Update every 100ms
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [queryTiming.isActive, queryTiming.startTime]);

  // Complete reset only when a new query starts
  useEffect(() => {
    if ((isFetching || isFetchingNextPage) && !queryTiming.isActive) {
      // New query started - complete reset and start
      setQueryTiming({
        isActive: true,
        startTime: performance.now(),
        currentDuration: 0,
        isCompleted: false,
      });
    }

    if (
      !isFetching &&
      !isFetchingNextPage &&
      queryTiming.isActive &&
      queryTiming.startTime
    ) {
      const finalDuration = performance.now() - queryTiming.startTime;
      // Switch to completed state (keep displaying results)
      setQueryTiming((prev) => ({
        isActive: false,
        startTime: prev.startTime, // Maintain
        currentDuration: finalDuration,
        isCompleted: true,
      }));
    }
  }, [
    isFetching,
    isFetchingNextPage,
    queryTiming.isActive,
    queryTiming.startTime,
  ]);

  return (
    <section className="h-full">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={80} minSize={30}>
          <div
            className={`flex h-full flex-col gap-4 px-10 py-8 ${isLibraryOpen && "overflow-y-auto"}`}
          >
            <div className={twMerge("flex-none items-center gap-8")}>
              <QueryTimer
                queryTiming={queryTiming}
                isFetchingNextPage={isFetchingNextPage}
              />
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
            <div className="min-h-0 flex-1">
              {!isQueryHistoryLoading && (
                <QueryOutput
                  data={data}
                  hasNextPage={hasNextPage}
                  isFetching={isFetching}
                  isQueryLoading={isQueryLoading}
                  fetchNextPage={fetchNextPage}
                  streamRes={streamRes}
                  isStreamLoading={isStreamLoading}
                  parsedQuery={query}
                  queryHistoryEntry={queryHistoryEntry}
                  onStopStream={stopStream}
                  isStreamPaused={isStreamPaused}
                  nav={nav}
                />
              )}
            </div>
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
