"use client";

import {
  Data_SubQueries,
  ScalarTimeseries,
  Tabular,
  VectorTimeseries,
} from "api/js/types/v1/query_pb";
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  LogQuery,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
} from "api/js/types/v1/logquery_pb";
import NewSessionPanel from "@/components/sortable/new-session-panel";
import TableContainer from "@/components/sortable/table-container";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Val } from "api/js/types/v1/types_pb";
import { useSearchParams } from "next/navigation";
import { useApiClients } from "@/context/api-provider";
import { QueryRequest } from "api/js/svc/query/v1/service_pb";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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

const NewQueryOutput = () => {
  const limit = 100;

  const { apiClients, activeEnvironment } = useApiClients();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const [output, setOutput] = useState<ReactNode>();
  const [logData, setLogData] = useState<LogData>({
    case: undefined,
    value: undefined,
  });
  const [parsedQuery, setParsedQuery] = useState<LogQuery>();
  const [splitByDefault, setSplitByDefault] = useState(true);

  const parseQuery = async (parseReq: { query: string }) => {
    try {
      const parsedQuery = await apiClients?.query.parse(parseReq);
      return parsedQuery;
    } catch (error) {
      alert("Query parsing failed. Please check your query syntax.");
      console.error("Query parsing error:", error);
    }
  };

  const getLogData = useCallback(
    async (editorContent: string) => {
      if (!editorContent || !apiClients?.query) {
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
          const q = parseRes.query;

          if (
            q?.query?.statements?.some(
              (stmt) => stmt.stmt?.case === "filter",
            ) &&
            splitByDefault
          ) {
            q!.query!.render = new RenderStatement({
              stmt: {
                case: "split",
                value: new SplitOperator({
                  by: new SplitOperator_ByOperator({
                    scalars: [
                      {
                        expr: {
                          case: "identifier",
                          value: { name: "session" },
                        },
                      },
                      {
                        expr: {
                          case: "identifier",
                          value: { name: "machine" },
                        },
                      },
                    ],
                  }),
                }),
              },
            });
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
      } catch (error: any) {
        console.error(error);
      }
    },
    [activeEnvironment, apiClients?.query, queryString, splitByDefault],
  );

  useEffect(() => {
    queryString && getLogData(decodeURIComponent(queryString));
  }, [queryString, splitByDefault]);

  useEffect(() => {
    const { case: dataCase, value } = logData;

    if (!logData.case && !logData.value) {
      setOutput(
        <p className="mt-1 rounded-md border bg-slate-200 p-4 text-sm font-medium leading-tight text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          No logs were found given that query.
          <br />
          <br />
          Try adjusting your query or time range. If still no data is coming
          through, please check that the log source is configured correctly.
        </p>,
      );
    }

    if (dataCase === "tabular" && value instanceof Tabular) {
      const { case: shapeCase } = value.shape;
      switch (shapeCase) {
        case "logEvents":
          setOutput(
            <>
              <ToggleSplit
                splitByDefault={splitByDefault}
                setSplitByDefault={setSplitByDefault}
              />
              <div className="container flex-1 overflow-auto">
                <NewSessionPanel query={parsedQuery} />
              </div>
            </>,
          );
          break;

        case "freeForm":
          setOutput(
            <div className="container flex-1 overflow-auto">
              <TableContainer query={parsedQuery} />
            </div>,
          );
          break;
      }
      return;
    }

    if (dataCase === "subqueries" && value instanceof Data_SubQueries) {
      const { queries } = value;
      setOutput(
        <>
          <ToggleSplit
            splitByDefault={splitByDefault}
            setSplitByDefault={setSplitByDefault}
          />
          <PanelGroup
            direction="horizontal"
            className="container flex flex-1 overflow-y-auto"
          >
            {queries?.map((query, i) => {
              return (
                <Fragment key={i}>
                  <Panel>
                    <NewSessionPanel key={i} query={query} />
                  </Panel>
                  {i !== queries.length - 1 && (
                    <PanelResizeHandle className="flex h-full items-center justify-center px-1">
                      <div className="h-12 w-1 rounded-full bg-slate-700" />
                    </PanelResizeHandle>
                  )}
                </Fragment>
              );
            })}
          </PanelGroup>
        </>,
      );
    }
  }, [logData, queryString]);

  return output;
};

export default NewQueryOutput;

interface ToggleSplitProps {
  splitByDefault: boolean;
  setSplitByDefault: Dispatch<SetStateAction<boolean>>;
}

const ToggleSplit = ({
  splitByDefault,
  setSplitByDefault,
}: ToggleSplitProps) => {
  return (
    <div className="flex-end container flex items-center gap-2">
      <Label
        htmlFor="billed-monthly"
        className={cn("transition-colors duration-200", {
          "text-slate-500": splitByDefault,
        })}
      >
        View Combined Logs
      </Label>
      <Switch
        id="billed-monthly"
        checked={splitByDefault}
        onCheckedChange={setSplitByDefault}
      />
      <Label
        htmlFor="billed-monthly"
        className={cn("relative transition-colors duration-200", {
          "text-slate-500": !splitByDefault,
        })}
      >
        Split by Default
      </Label>
    </div>
  );
};
