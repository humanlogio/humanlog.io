import { Data_SubQueries, Tabular } from "api/js/types/v1/query_pb";
import { LogData } from "@/components/env/log-interface";
import { ReactNode, useEffect, useState } from "react";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import NewSessionPanel from "@/components/sortable/new-session-panel";
import TableContainer from "@/components/sortable/table-container";

interface NewQueryOutputProps {
  parsedQuery: LogQuery | undefined;
  logData: LogData;
}

const NewQueryOutput = ({ parsedQuery, logData }: NewQueryOutputProps) => {
  const [output, setOutput] = useState<ReactNode>();

  const { case: dataCase, value } = logData;

  useEffect(() => {
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
          setOutput(<NewSessionPanel query={parsedQuery} />);
          break;

        case "freeForm":
          setOutput(<TableContainer query={parsedQuery} />);
          break;
      }
      return;
    }

    if (dataCase === "subqueries" && value instanceof Data_SubQueries) {
      const { queries } = value;
      setOutput(
        <>
          {queries?.map((query, i) => {
            return <NewSessionPanel key={i} query={query} />;
          })}
        </>,
      );
    }
  }, [logData]);

  return <div className="container flex-1 overflow-auto">{output}</div>;
};

export default NewQueryOutput;
