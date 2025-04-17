"use client";

import { Data_SubQueries, Tabular } from "api/js/types/v1/query_pb";
import { ReactNode, useEffect, useState } from "react";
import { BinaryOp_Operator, LogQuery } from "api/js/types/v1/logquery_pb";
import TableContainer from "@/components/sortable/table-container";
import { useSearchParams } from "next/navigation";
import { LogData } from "@/components/env/log-interface";
import { NoLogsView } from "@/components/sortable/no-logs-view";
import { SubQueriesContainer } from "@/components/sortable/subqueries-container";
import { extractQueryIds } from "@/lib/utils/extractQueryIds";
import {
  ToggleShowPretty,
  ToggleSplit,
} from "@/components/sortable/log-viewer-settings";
import { KV } from "api/js/types/v1/types_pb";
import NewSessionPanel from "@/components/sortable/new-session-panel";

interface NewQueryOutputProps {
  logData: LogData;
  parsedQuery: LogQuery | undefined;
  onClickFilterBy: (kv: KV, op?: BinaryOp_Operator) => void;
}

const NewQueryOutput = ({
  logData,
  parsedQuery,
  onClickFilterBy,
}: NewQueryOutputProps) => {
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
                <NewSessionPanel
                  query={parsedQuery}
                  ids={extractQueryIds(parsedQuery as LogQuery)}
                  onClickFilterBy={onClickFilterBy}
                />
              </div>
            </>,
          );
          break;

        case "freeForm":
          setOutput(
            <div className="flex-1">
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
        <div className="flex-1">
          <SubQueriesContainer
            queries={queries}
            onClickFilterBy={onClickFilterBy}
          />
        </div>,
      );
      return;
    }
  }, [logData, queryString]);

  return output;
};

export default NewQueryOutput;
