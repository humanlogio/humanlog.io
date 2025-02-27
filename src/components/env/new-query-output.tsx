"use client";

import { Data_SubQueries, Tabular } from "api/js/types/v1/query_pb";
import { ReactNode, useEffect, useState } from "react";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import NewSessionPanel from "@/components/sortable/new-session-panel";
import TableContainer from "@/components/sortable/table-container";
import { useSearchParams } from "next/navigation";
import { LogData } from "@/components/env/log-interface";
import { NoLogsView } from "@/components/env/no-logs-view";
import { SubQueriesContainer } from "@/components/sortable/subqueries-container";
import { extractQueryIds } from "@/lib/utils/extractQueryIds";
import {
  ToggleShowPretty,
  ToggleSplit,
} from "@/components/sortable/log-viewer-settings";

interface NewQueryOutputProps {
  logData: LogData;
  parsedQuery: LogQuery | undefined;
}

const NewQueryOutput = ({
  logData,

  parsedQuery,
}: NewQueryOutputProps) => {
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const [output, setOutput] = useState<ReactNode>();

  useEffect(() => {
    const { case: dataCase, value } = logData;

    if (!dataCase && !logData.value) {
      setOutput(
        <div className="container flex flex-1 items-center justify-center">
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
                {queryString ? <ToggleSplit /> : null}
              </div>
              <div className="container flex-1 overflow-auto">
                <NewSessionPanel
                  query={parsedQuery}
                  ids={extractQueryIds(parsedQuery as LogQuery)}
                />
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
        <div className="container flex-1 overflow-auto">
          <SubQueriesContainer queries={queries} />
        </div>,
      );
      return;
    }
  }, [logData, queryString]);

  return output;
};

export default NewQueryOutput;
