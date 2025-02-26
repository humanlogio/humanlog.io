import { LogQuery } from "api/js/types/v1/logquery_pb";
import { Fragment, useEffect, useState } from "react";
import { ToggleSplit } from "@/components/env/new-query-output";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import NewSessionPanel from "@/components/sortable/new-session-panel";
import { extractQueryIds } from "@/lib/utils/extractQueryIds";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SquareCode } from "lucide-react";

interface SubQueriesContainerProps {
  queries: LogQuery[];
}

interface SelectType {
  value: string;
  sessionId: any;
  machineId: any;
}

export const SubQueriesContainer = ({ queries }: SubQueriesContainerProps) => {
  const [selectList, setSelectList] = useState<SelectType[]>();
  const [selectedSession, setSelectedSession] = useState<SelectType>();

  useEffect(() => {
    const _selectList: SelectType[] = [];
    queries.forEach((query, i) => {
      const { sessionId, machineId } = extractQueryIds(query);

      _selectList.push({
        value: `${i}-${machineId}-${sessionId}`,
        machineId,
        sessionId,
      });
    });
    setSelectList(_selectList);
    setSelectedSession(_selectList[0]);
  }, []);

  const updateSelection = (value: string) => {
    const _selected = selectList?.find((select) => select.value === value);
    setSelectedSession(_selected);
  };

  if (queries.length > 4) {
    return (
      selectList && (
        <>
          <div className="mt-2 flex">
            <ToggleSplit />
            <Select
              value={selectedSession?.value}
              onValueChange={updateSelection}
            >
              <SelectTrigger>
                <SquareCode size={16} />
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {selectList.map((list) => {
                    return (
                      <SelectItem key={list.value} value={list.value}>
                        <span className="mr-2">
                          machineId: {list.machineId}
                        </span>
                        <span>sessonId: {list.sessionId}</span>
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3">
            <NewSessionPanel
              query={queries.find(
                (query) =>
                  extractQueryIds(query).machineId ===
                    selectedSession?.machineId &&
                  extractQueryIds(query).sessionId ===
                    selectedSession?.sessionId,
              )}
            />
          </div>
        </>
      )
    );
  }

  return (
    <>
      <ToggleSplit />
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
    </>
  );
};
