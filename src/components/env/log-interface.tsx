"use client";

import NewQueryInput from "@/components/env/new-query-input";
import NewQueryOutput from "@/components/env/new-query-output";
import { useApiClients } from "@/context/api-provider";
import { Code, ConnectError } from "@connectrpc/connect";
import { QueryRequest } from "api/js/svc/query/v1/service_pb";
import {
  LogQuery,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
  Statements,
} from "api/js/types/v1/logquery_pb";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/query_pb";
import { Val } from "api/js/types/v1/types_pb";
import { useAllEnvironments } from "@/context/list-environments";
import { NoLocalhostView } from "@/components/sortable/no-localhost-view";
import { Button } from "@/components/ui/button";
import { QueryLibrary } from "@/components/env/query-library";
import { X } from "lucide-react";
import { SaveQueryModal } from "@/components/env/query-library/save-query-modal";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const splitByDefault = searchParams.get("splitByDefault") !== "false";

  const [errMsg, setErrMsg] = useState("");
  const [parsedQuery, setParsedQuery] = useState<LogQuery>();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaveValid, setIsSaveValid] = useState(false);
  const [isSaveQueryModalOpen, setIsSaveQueryModalOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [editorContent, setEditorContent] = useState<string>("");

  const parseQuery = async (parseReq: { query: string }) => {
    try {
      const parsedQuery = await apiClients?.query.parse(parseReq);
      setErrMsg("");
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

          setErrMsg(`${rawMessage}`);
        }

        console.error("Query parsing error:", error);
      }
    }
  };

  const getLogData = useCallback(
    async (editorContent: string) => {
      if (!apiClients?.query) {
        console.log("Invalid content or missing API client:", {
          editorContent,
          hasApiClient: !!apiClients?.query,
        });
        return;
      }

      try {
        const parseReq = { query: editorContent };
        const parseRes = await parseQuery(parseReq);

        if (parseRes) {
          // 1) we don't care about the response
          // 2) we don't want to record the mutated query, so we record it
          // before mutating it with `split by`
          editorContent.length > 0 &&
            apiClients.user.recordQueryHistory({
              rawQuery: editorContent,
              query: parseRes.query,
            });

          if (parseRes.dataType) {
            const { type } = parseRes.dataType;

            if (
              parseRes.query &&
              type.case === "tabular" &&
              type.value?.type?.case === "logEvents" &&
              splitByDefault
            ) {
              const renderStmt = new RenderStatement({
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

              if (parseRes.query.query) {
                parseRes.query.query!.render = renderStmt;
              } else {
                // TODO: Uncomment after backend's update
                parseRes.query.query = new Statements({
                  statements: [],
                  render: renderStmt,
                });
              }
            }
          }

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
        }
      } catch (error) {
        if (error instanceof ConnectError) {
          const { code, rawMessage, message } = error;
          if (code === Code.Unauthenticated) {
            toast.error(message);
          }

          setLogData({
            case: undefined,
            value: undefined,
          });
          console.error(error);
        }
      }
    },
    [activeEnvironment, apiClients?.query, queryString, splitByDefault],
  );

  const executeQuery = useCallback(
    async (query: string) => {
      setNext(null);

      await getLogData(query);
    },
    [apiClients?.query, splitByDefault],
  );

  useEffect(() => {
    if (editorContent.length > 0) {
      setIsSaveValid(true);
    } else {
      setIsSaveValid(false);
    }
  }, [editorContent]);

  useEffect(() => {
    if (queryString != null) executeQuery(decodeURIComponent(queryString));
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
            className={`container flex h-full flex-col gap-4 py-8 ${isLibraryOpen && "overflow-y-auto"}`}
          >
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
                <Button
                  size="sm"
                  onClick={() => setIsLibraryOpen((prev) => !prev)}
                >
                  Query Library
                </Button>
              </div>
            </div>
            <NewQueryInput
              errMsg={errMsg}
              setIsSaveValid={setIsSaveValid}
              onExecuteQuery={executeQuery}
              symbol={symbol}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
            <NewQueryOutput logData={logData} parsedQuery={parsedQuery} />
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel
          defaultSize={25}
          maxSize={50}
          minSize={15}
          className={`border-l transition-transform duration-300 ease-in-out ${isLibraryOpen ? "translate-x-0" : "hidden translate-x-full"}`}
        >
          <div className="h-full p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Query Library</h2>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <QueryLibrary
              onClickSymbol={(symbolString) => {
                setSymbol(symbolString);
              }}
            />
          </div>
        </Panel>
      </PanelGroup>
      {isSaveQueryModalOpen && (
        <SaveQueryModal
          query={editorContent || ""}
          isSaveQueryModalOpen={isSaveQueryModalOpen}
          setIsSaveQueryModalOpen={setIsSaveQueryModalOpen}
          parsedQuery={parsedQuery}
        />
      )}
    </section>
  );
};

export default LogInterface;
