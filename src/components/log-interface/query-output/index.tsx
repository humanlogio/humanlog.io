"use client";

import { Data_SubQueries, Tabular } from "api/js/types/v1/data_pb";
import { ReactNode, useEffect, useState } from "react";
import { BinaryOp_Operator, Expr, Query } from "api/js/types/v1/query_pb";
import TableContainer from "@/components/log-interface/query-output/table/table-container";
import { useSearchParams } from "next/navigation";
import { LogData } from "@/components/log-interface";
import { NoLogsView } from "@/components/log-interface/views/no-logs-view";
import { SubQueriesContainer } from "@/components/log-interface/query-output/session/subqueries-container";
import { extractQueryIds } from "@/lib/utils/extractQueryIds";
import {
  ToggleShowPretty,
  ToggleSplit,
} from "@/components/log-interface/query-output/toggles";
import { KV } from "api/js/types/v1/types_pb";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";

interface QueryOutputProps {
  logData: LogData;
  parsedQuery: Query | undefined;
  queryHistoryEntry?: QueryHistoryEntry;
}

const QueryOutput = ({
  logData,
  parsedQuery,
  queryHistoryEntry,
}: QueryOutputProps) => {
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const [output, setOutput] = useState<ReactNode>();

  useEffect(() => {
    const { case: dataCase, value } = logData;

    if (!dataCase && !logData.value) {
      setOutput(
        <div className="flex flex-1 items-center justify-center">
          <NoLogsView />
        </div>,
      );
    }

    if (dataCase === "tabular" && value instanceof Tabular) {
      const { case: shapeCase } = value.shape;
      switch (shapeCase) {
        case "logEvents":
          setOutput(
            <>
              {/* TODO: Remove condition after backend's update */}
              <div className="mt-2 flex flex-col gap-1">
                <ToggleShowPretty />
                <ToggleSplit />
              </div>
              <div className="flex-1">
                <SessionPanel
                  query={parsedQuery}
                  queryHistoryEntry={queryHistoryEntry}
                  ids={extractQueryIds(parsedQuery as Query)}
                />
              </div>
            </>,
          );
          break;

        case "freeForm":
          setOutput(
            <div className="flex-1">
              <TableContainer
                query={parsedQuery}
                queryHistoryEntry={queryHistoryEntry}
              />
            </div>,
          );
          break;
      }
      return;
    }

    if (dataCase === "subqueries" && value instanceof Data_SubQueries) {
      const { queries } = value;
      setOutput(
        <div className="flex-1">
          <SubQueriesContainer
            queries={queries}
            queryHistoryEntry={queryHistoryEntry}
          />
        </div>,
      );
      return;
    }
  }, [logData, queryString]);

  return output;
};

export default QueryOutput;
