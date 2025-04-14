"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import NewQueryInput from "@/components/env/new-query-input";
import NewQueryOutput from "@/components/env/new-query-output";
import { QueryLibrary } from "@/components/env/query-library";
import { SaveQueryModal } from "@/components/env/query-library/save-query-modal";
import { NoLocalhostView } from "@/components/sortable/no-localhost-view";

import { useApiClients } from "@/context/api-provider";
import { useAllEnvironments } from "@/context/list-environments";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";

import { Code, ConnectError } from "@connectrpc/connect";
import { ParseResponse, QueryRequest } from "api/js/svc/query/v1/service_pb";
import {
  BinaryOp_Operator,
  Expr,
  FilterOperator,
  LogQuery,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
  Statement,
  Statements,
} from "api/js/types/v1/logquery_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/query_pb";

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
  const [filterByKv, setFilterByKv] = useState<KV>();
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
              {
                expr: {
                  case: "identifier",
                  value: { name: "machine" },
                },
              },
              {
                expr: {
                  case: "identifier",
                  value: { name: "session" },
                },
              },
            ],
          }),
        }),
      },
    });
  };

  const createFilterStatement = (kv: KV) => {
    const { key, value } = kv;

    return new Statement({
      stmt: {
        case: "filter",
        value: new FilterOperator({
          expr: new Expr({
            expr: {
              case: "binary",
              value: {
                lhs: new Expr({
                  expr: {
                    case: "identifier",
                    value: { name: key },
                  },
                }),
                op: BinaryOp_Operator.CMP_EQ,
                rhs: new Expr({
                  expr: {
                    case: "literal",
                    value: value as Val,
                  },
                }),
              },
            },
          }),
        }),
      },
    });
  };

  const parseQuery = async (parseReq: { query: string }) => {
    try {
      const parsedQuery = await apiClients?.query.parse(parseReq);
      setQueryParseErrMsg("");
      return parsedQuery;
    } catch (error) {
      if (error instanceof ConnectError) {
        setLogData({
          case: undefined,
          value: undefined,
        });
        let alertMsg = "Query parsing failed. Please check your query syntax.";
        const { code, rawMessage, message } = error;

        if (code === Code.Unimplemented) {
          toast.error(message);
        }

        if (code === Code.InvalidArgument) {
          toast.error(`Your query is invalid: ${alertMsg}`);
          setQueryParseErrMsg(`${rawMessage}`);
        }

        console.error("Query parsing error:", error);
      }
    }
  };

  const processQueryModifiers = (
    parseRes: ParseResponse,
    options: { splitByDefault: boolean; filterByKv?: KV },
  ) => {
    const { splitByDefault = false, filterByKv = null } = options;

    if (parseRes.dataType) {
      const { type } = parseRes.dataType;

      if (
        parseRes.query &&
        type.case === "tabular" &&
        type.value?.type?.case === "logEvents"
      ) {
        let renderStmt;
        let statements;

        if (splitByDefault) {
          renderStmt = createSplitRenderStatement();
        }

        if (filterByKv) {
          statements = [createFilterStatement(filterByKv)];
        }

        if (parseRes.query.query) {
          parseRes.query.query.render = renderStmt;
        } else {
          parseRes.query.query = new Statements({
            statements: statements ?? [],
            render: renderStmt,
          });
        }
      }
    }

    return parseRes.query;
  };

  const handleQueryError = (error: any) => {
    if (error instanceof ConnectError) {
      const { code, message } = error;
      if (code === Code.Unauthenticated) {
        toast.error(message);
      }

      setLogData({
        case: undefined,
        value: undefined,
      });
      console.error(error);
    }
  };

  const getLogData = useCallback(
    async (
      editorContent: string,
      options: { splitByDefault: boolean; filterByKv?: KV },
    ) => {
      const { splitByDefault = false, filterByKv = undefined } = options;

      if (!apiClients?.query) {
        console.log("Invalid content or missing API client:", {
          editorContent,
          hasApiClient: !!apiClients?.query,
        });
        return null;
      }

      try {
        const parseReq = { query: editorContent };
        const parseRes = await parseQuery(parseReq);

        if (parseRes) {
          if (editorContent.length > 0) {
            const res = await apiClients.user.recordQueryHistory({
              rawQuery: editorContent,
              query: parseRes.query,
            });
            setRecentQueryId(res.entry?.id);
          }

          parseRes.query = processQueryModifiers(parseRes, {
            splitByDefault,
            filterByKv,
          });

          setParsedQuery(parseRes.query);

          const queryReq = new QueryRequest({
            environmentId: activeEnvironment?.id,
            query: parseRes.query,
            limit,
          });

          const queryRes = await apiClients.query.query(queryReq);

          if (queryRes.data) {
            setLogData(queryRes.data.shape);
          }

          return parseRes;
        }
      } catch (error) {
        handleQueryError(error);
      }

      return null;
    },
    [apiClients, activeEnvironment, limit],
  );

  const executeQuery = useCallback(
    async (query: string) => {
      setNext(null);

      return await getLogData(query, {
        splitByDefault,
        filterByKv,
      });
    },
    [getLogData, setNext, splitByDefault, filterByKv],
  );

  useEffect(() => {
    setIsSaveValid(editorContent.length > 0);
  }, [editorContent]);

  useEffect(() => {
    if (queryString != null) {
      executeQuery(decodeURIComponent(queryString));
    }
  }, [splitByDefault, queryString, filterByKv, executeQuery]);

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
            className={`container flex h-full flex-col gap-4 py-8 ${isLibraryOpen && "overflow-y-auto"}`}
          >
            {renderHeader()}

            <NewQueryInput
              errMsg={queryParseErrMsg}
              onExecuteQuery={executeQuery}
              symbol={symbol}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
            <NewQueryOutput
              logData={logData}
              parsedQuery={parsedQuery}
              onClickFilterBy={(kv: KV) => setFilterByKv(kv)}
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
