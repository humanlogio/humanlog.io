"use client";

import { Data_SubQueries, Tabular } from "api/js/types/v1/query_pb";
import {
  Dispatch,
  Fragment,
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
import { Val } from "api/js/types/v1/types_pb";
import { useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { MessageCircleWarning } from "lucide-react";
import { LogData } from "./log-interface";

interface NewQueryOutputProps {
  logData: LogData;
  splitByDefault: boolean;
  setSplitByDefault: Dispatch<SetStateAction<boolean>>;
  parsedQuery: LogQuery | undefined;
}

const NewQueryOutput = ({
  logData,
  splitByDefault,
  setSplitByDefault,
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
          <div className="rounded-md bg-slate-200 p-4 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <MessageCircleWarning size={20} />
              <h4 className="font-bold">
                No logs were found given that query.
              </h4>
            </div>
            <p className="mt-2 text-sm">
              Try adjusting your query or time range. If still no data is coming
              through, please check that the log source is configured correctly.
            </p>
          </div>
        </div>,
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
