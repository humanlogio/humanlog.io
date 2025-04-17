"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Button } from "@/components/ui/button";
import NewQueryInput from "@/components/env/new-query-input";
import NewQueryOutput from "@/components/env/new-query-output";
import { QueryLibrary } from "@/components/env/query-library";
import { SaveQueryModal } from "@/components/env/query-library/save-query-modal";
import { NoLocalhostView } from "@/components/sortable/no-localhost-view";

import { useApiClients } from "@/context/api-provider";
import { useAllEnvironments } from "@/context/list-environments";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";

import {
  ParseResponse,
  QueryRequest,
  QueryResponse,
} from "api/js/svc/query/v1/service_pb";
import {
  BinaryOp_Operator,
  LogQuery,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
  Statements,
} from "api/js/types/v1/logquery_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/query_pb";
import { newIdentifierExpr } from "@/lib/utils/queryBuilders";
import { X } from "lucide-react";
import { getQuery, parseQuery, QueryClientType } from "@/services/queryService";
import { recordQueryHistory } from "@/services/userService";
import { RecordQueryHistoryResponse } from "api/js/svc/user/v1/service_pb";

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
  const limit = 100;

  const { apiClients, activeEnvironment } = useApiClients();
  const { localhostInfo } = useAllEnvironments();
  const { setNext } = useInfiniteQuery();

  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const splitByDefault = searchParams.get("splitByDefault") !== "false";

  const [queryParseErrMsg, setQueryParseErrMsg] = useState("");
  const [parsedQuery, setParsedQuery] = useState<LogQuery>();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaveValid, setIsSaveValid] = useState(false);
  const [isSaveQueryModalOpen, setIsSaveQueryModalOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [filterByKv, setFilterByKv] = useState<{
    kv: KV;
    op?: BinaryOp_Operator;
  }>();
  const [editorContent, setEditorContent] = useState<string>("");
  const [recentQueryId, setRecentQueryId] = useState<bigint>();
  const [savedQueryId, setSavedQueryId] = useState<bigint>();

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

  const handleRecordQueryHistory = (rawQuery: string, query: LogQuery) => {
    if (!apiClients || rawQuery.length === 0) return;
    recordQueryHistory(apiClients?.user, rawQuery, query, {
      onSuccess: (res: RecordQueryHistoryResponse) =>
        setRecentQueryId(res.entry?.id),
    });
  };

  const handleQueryData = (
    queryClient: QueryClientType,
    queryReq: QueryRequest,
  ) => {
    getQuery(queryClient, queryReq, {
      onSuccess: (res: QueryResponse) => {
        res.data && setLogData(res.data.shape);
      },
    });
  };

  const getLogData = useCallback(
    async (editorContent: string, splitByDefault: boolean) => {
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
        onError: () => {
          setLogData({ case: undefined, value: undefined });
          return null;
        },
      });
    },
    [apiClients, activeEnvironment, limit],
  );

  const executeQuery = useCallback(
    async (query: string) => {
      setNext(null);
      return await getLogData(query, splitByDefault);
    },
    [getLogData, setNext, splitByDefault],
  );

  useEffect(() => {
    setIsSaveValid(editorContent.length > 0);
  }, [editorContent]);

  useEffect(() => {
    if (queryString != null) {
      executeQuery(decodeURIComponent(queryString));
    }
  }, [splitByDefault, queryString, executeQuery]);

  if (!localhostInfo) {
    return (
      <div className="mt-32 flex justify-center">
        <NoLocalhostView />
      </div>
    );
  }

  const renderHeader = () => (
    <div className="mb-2 flex w-full flex-row items-center justify-between">
      <div />
      <div className="flex gap-2 text-sm">
        <Button
          disabled={!isSaveValid}
          size="sm"
          onClick={() => setIsSaveQueryModalOpen(true)}
        >
          Save
        </Button>
        <Button size="sm" onClick={() => setIsLibraryOpen((prev) => !prev)}>
          Query Library
        </Button>
      </div>
    </div>
  );

  return (
    <section className={isLibraryOpen ? "h-[calc(100vh-4rem)]" : ""}>
      <PanelGroup direction="horizontal">
        <Panel defaultSize={80} minSize={30}>
          <div
            className={`flex h-full flex-col gap-4 py-8 ${isLibraryOpen && "overflow-y-auto"}`}
          >
            {renderHeader()}

            <NewQueryInput
              errMsg={queryParseErrMsg}
              onExecuteQuery={executeQuery}
              symbol={symbol}
              filterByKv={filterByKv}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
            <NewQueryOutput
              logData={logData}
              parsedQuery={parsedQuery}
              onClickFilterBy={(kv: KV, op?: BinaryOp_Operator) =>
                setFilterByKv({ kv, op })
              }
            />
          </div>
        </Panel>

        <PanelResizeHandle />

        <QueryLibraryPanel
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onClickSymbol={(symbolString) => setSymbol(symbolString)}
          recentQueryId={recentQueryId}
          savedQueryId={savedQueryId}
          setSavedQueryId={setSavedQueryId}
        />
      </PanelGroup>

      {isSaveQueryModalOpen && (
        <SaveQueryModal
          query={editorContent || ""}
          isSaveQueryModalOpen={isSaveQueryModalOpen}
          setIsSaveQueryModalOpen={setIsSaveQueryModalOpen}
          parsedQuery={parsedQuery}
          setSavedQueryId={setSavedQueryId}
        />
      )}
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
