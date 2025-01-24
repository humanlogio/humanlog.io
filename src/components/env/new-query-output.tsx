import { Data_SubQueries, Tabular } from "api/js/types/v1/query_pb";
import { LogData } from "@/components/env/log-interface";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import NewSessionPanel from "@/components/sortable/new-session-panel";
import TableContainer from "@/components/sortable/table-container";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NewQueryOutputProps {
  parsedQuery: LogQuery | undefined;
  logData: LogData;
  splitByDefault: boolean;
  setSplitByDefault: Dispatch<SetStateAction<boolean>>;
}

const NewQueryOutput = ({
  parsedQuery,
  logData,
  splitByDefault,
  setSplitByDefault,
}: NewQueryOutputProps) => {
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
          <div className="container flex-1 overflow-auto">
            {queries?.map((query, i) => {
              return <NewSessionPanel key={i} query={query} />;
            })}
          </div>
        </>,
      );
    }
  }, [logData]);

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
    <div className="flex-end container mb-3 flex items-center gap-1">
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
