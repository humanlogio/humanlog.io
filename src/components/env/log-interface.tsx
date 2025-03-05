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
import { DialogDescription } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const splitByDefault = searchParams.get("splitByDefault") !== "false";

  const [errMsg, setErrMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<LogQuery>();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });

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

          if (code === Code.FailedPrecondition) {
            setIsModalOpen(true);
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
      const params = new URLSearchParams(searchParams);
      const parseRes = await parseQuery({ query });
      params.set("query", encodeURIComponent(query));
      router.push(`?${params}`);
      if (!parseRes) return;
      await getLogData(query);
    },
    [apiClients?.query, parseQuery, getLogData, splitByDefault],
  );

  useEffect(() => {
    if (queryString != null) executeQuery(decodeURIComponent(queryString));
  }, [splitByDefault]);

  if (!localhostInfo) {
    return (
      <div className="mt-32 flex justify-center">
        <NoLocalhostView />
      </div>
    );
  }

  return (
    <section>
      <div className="container-min-h-full flex flex-col gap-4 overflow-y-hidden py-8">
        <NewQueryInput errMsg={errMsg} onExecuteQuery={executeQuery} />
        <NewQueryOutput logData={logData} parsedQuery={parsedQuery} />
      </div>
      <Modal open={isModalOpen}>
        <DialogHeader>
          <div className="text-xl font-semibold">Subscription Required</div>
          <DialogDescription>
            {
              "This feature requires a subscription. But don't worry, we have a free plan for personal use."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row">
          <Button onClick={() => router.push("/user/purchase")}>
            Subscribe
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
        </DialogFooter>
      </Modal>
    </section>
  );
};

export default LogInterface;
