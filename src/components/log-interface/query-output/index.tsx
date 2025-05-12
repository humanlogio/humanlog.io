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
import { Loader } from "lucide-react";
import { QueryResponse } from "api/js/svc/query/v1/service_pb";

interface QueryOutputProps {
  queryRes: QueryResponse | null;
  isLoading: boolean;
  parsedQuery: Query | undefined;
  queryHistoryEntry?: QueryHistoryEntry;
}

const QueryOutput = ({
  queryRes,
  isLoading,
  parsedQuery,
  queryHistoryEntry,
}: QueryOutputProps) => {
  const [output, setOutput] = useState<ReactNode>();

  useEffect(() => {
    const renderOutput = () => {
      if (isLoading) {
        return (
          <div className="flex w-full flex-1 items-center justify-center">
            <Loader className="animate-spin" />
          </div>
        );
      }

      if (!queryRes || !queryRes.data?.shape) {
        return (
          <div className="flex flex-1 items-center justify-center">
            <NoLogsView />
          </div>
        );
      }

      const { case: dataCase, value } = queryRes.data.shape;

      if (dataCase === "tabular" && value instanceof Tabular) {
        const { case: shapeCase, value: shapeValue } = value.shape;

        switch (shapeCase) {
          case "logEvents":
            return (
              <>
                <div className="mt-2 flex flex-col gap-1">
                  <ToggleShowPretty />
                  <ToggleSplit />
                </div>
                <div className="flex-1">
                  <SessionPanel
                    data={shapeValue}
                    initialNext={queryRes.next}
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
                initialNext={queryRes.next}
                query={parsedQuery}
                queryHistoryEntry={queryHistoryEntry}
              />
            );
          case "spans":
            return (
              <SpansContainer
                data={shapeValue}
                initialNext={queryRes.next}
                query={parsedQuery}
                queryHistoryEntry={queryHistoryEntry}
              />
            );
          default:
            return null;
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

      return null;
    };

    setOutput(renderOutput());
  }, [queryRes, isLoading, parsedQuery, queryHistoryEntry]);

  return output;
};

export default QueryOutput;
