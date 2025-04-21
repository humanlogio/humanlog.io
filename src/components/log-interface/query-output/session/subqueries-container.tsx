import { BinaryOp_Operator, LogQuery } from "api/js/types/v1/logquery_pb";
import { Fragment, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { extractQueryIds } from "@/lib/utils/extractQueryIds";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SquareCode, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  ToggleShowPretty,
  ToggleSplit,
} from "@/components/log-interface/query-output/toggles";
import { KV } from "api/js/types/v1/types_pb";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";

interface SubQueriesContainerProps {
  queries: LogQuery[];
  onClickFilterBy: (kv: KV, op?: BinaryOp_Operator) => void;
}

interface SelectedSessionsType {
  value: string;
  sessionId: any;
  machineId: any;
  query: LogQuery;
}

export const SubQueriesContainer = ({
  queries,
  onClickFilterBy,
}: SubQueriesContainerProps) => {
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const [originalSessionList, setOriginalSessionList] = useState<
    SelectedSessionsType[]
  >([]);
  const [sessionList, setSessionList] = useState<SelectedSessionsType[]>();
  const [selectedSessions, setSelectedSessions] =
    useState<SelectedSessionsType[]>();

  useEffect(() => {
    const _selectList: SelectedSessionsType[] = [];

    queries.forEach((query, i) => {
      const { sessionId, machineId } = extractQueryIds(query);

      _selectList.push({
        value: `${i}-${machineId}-${sessionId}`,
        machineId,
        sessionId,
        query,
      });
    });

    setOriginalSessionList(_selectList);
    setSessionList(_selectList);
    setSelectedSessions(_selectList.slice(0, 4));
  }, [queryString, queries]);

  useEffect(() => {
    const availableSessions = originalSessionList.filter(
      (session) =>
        !selectedSessions?.some(
          (selectedSession) => selectedSession.value === session.value,
        ),
    );

    availableSessions && setSessionList(availableSessions);
  }, [selectedSessions, originalSessionList]);

  const deleteSession = (value: string) => {
    const filtered = selectedSessions?.filter(
      (select) => select.value !== value,
    );

    setSelectedSessions(filtered);
  };

  const updateSelection = (value: string) => {
    const selected = sessionList?.find((select) => select.value === value);
    selected && setSelectedSessions((prev) => [...(prev || []), selected]);
  };

  return (
    selectedSessions && (
      <>
        <div className={`mt-2 flex w-full items-end justify-between`}>
          <div className="flex flex-col gap-1">
            <ToggleShowPretty />
            <ToggleSplit />
          </div>
          {sessionList && sessionList.length > 0 && (
            <div className="w-1/3">
              <Select
                value=""
                onValueChange={(value) => {
                  updateSelection(value);
                }}
              >
                <SelectTrigger>
                  <SquareCode size={16} />
                  <SelectValue placeholder="+ Add New" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sessionList.map((list) => {
                      return (
                        <SelectItem key={list.value} value={list.value}>
                          <span className="mr-1">
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
          )}
        </div>
        <div className="mt-3 flex">
          <PanelGroup
            direction="horizontal"
            className="flex flex-1 overflow-y-auto"
          >
            {selectedSessions?.map((list, i) => {
              return (
                <Fragment key={list.value}>
                  <Panel minSize={20}>
                    <div className="relative pt-2 pr-2">
                      {selectedSessions.length > 1 && (
                        <button
                          onClick={() => deleteSession(list.value)}
                          className="absolute top-0 right-0 z-20 rounded-full border border-black bg-white"
                        >
                          <X color="black" size={14} />
                        </button>
                      )}
                      <SessionPanel
                        ids={extractQueryIds(list.query)}
                        query={list.query}
                        onClickFilterBy={onClickFilterBy}
                      />
                    </div>
                  </Panel>

                  {i !== selectedSessions.length - 1 && (
                    <PanelResizeHandle className="flex h-auto items-center justify-center">
                      <div className="h-12 w-1 rounded-full bg-slate-700" />
                    </PanelResizeHandle>
                  )}
                </Fragment>
              );
            })}
          </PanelGroup>
        </div>
      </>
    )
  );
};
