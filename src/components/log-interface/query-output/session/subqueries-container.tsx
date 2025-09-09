import { BinaryOp_Operator, Expr, Query } from "api/js/types/v1/query_pb";
import { Fragment, useEffect, useMemo, useState } from "react";
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
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { useInfiniteQuery } from "@connectrpc/connect-query";
import { query as queryMethod } from "api/js/svc/query/v1/service-QueryService_connectquery";
import { useActiveTransport, useApiClients } from "@/context/api-provider";
import { CursorSchema } from "api/js/types/v1/cursor_pb";
import { QueryResponse } from "api/js/svc/query/v1/service_pb";
import { InfiniteData } from "@tanstack/react-query";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { create } from "@bufbuild/protobuf";

interface SubQueriesContainerProps {
  queries: Query[];
  queryHistoryEntry?: QueryHistoryEntry;
}

interface SelectedSessionsType {
  value: string;
  resourceFingerprint: string | undefined;
  query: Query;
}

export const SubQueriesContainer = ({
  queries,
  queryHistoryEntry,
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
      const resourceFingerprint = extractQueryIds(query);

      _selectList.push({
        value: `${i}-${resourceFingerprint}`,
        resourceFingerprint,
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
                            resourceFingerprint: {list.resourceFingerprint}
                          </span>
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
                <SubQueryPanel
                  key={list.value}
                  index={i}
                  list={list}
                  selectedSessions={selectedSessions}
                  deleteSession={deleteSession}
                  queryHistoryEntry={queryHistoryEntry}
                />
              );
            })}
          </PanelGroup>
        </div>
      </>
    )
  );
};

interface SubQueryPanelProps {
  index: number;
  list: SelectedSessionsType;
  selectedSessions: SelectedSessionsType[];
  deleteSession: (value: string) => void;
  queryHistoryEntry?: QueryHistoryEntry;
}

interface DataValue {
  pages?: QueryResponse[];

  logs: Log[];
}

const SubQueryPanel = ({
  index,
  list,
  selectedSessions,
  deleteSession,
  queryHistoryEntry,
}: SubQueryPanelProps) => {
  const { activeEnvironment } = useApiClients();
  const {
    data: rawData,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    status,
    isLoading: isQueryLoading,
  } = useInfiniteQuery(
    queryMethod,
    {
      environmentId: activeEnvironment?.id ?? BigInt(0),
      query: list.query,
      limit: 1000,
      cursor: create(CursorSchema, {}),
    },
    {
      pageParamKey: "cursor" as const,
      getNextPageParam: (lastPage: QueryResponse) => {
        return lastPage?.next || undefined;
      },
      initialPageParam: undefined,
      transport: useActiveTransport(),
      queryKey: ["logs", list.query],
    },
  );

  const data: DataValue | undefined = useMemo(() => {
    if (!rawData?.pages?.length) return;
    const logs: Log[] = [];

    rawData.pages.forEach((page: QueryResponse) => {
      const shape = page.data?.shape;
      if (shape?.case === "logs") {
        logs.push(...shape.value.logs);
      }
    });

    return {
      logs,
    };
  }, [rawData]);

  return (
    <Fragment>
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
            logs={data?.logs}
            resourceFingerprint={extractQueryIds(list.query)}
            queryHistoryEntry={queryHistoryEntry}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </Panel>

      {index !== selectedSessions.length - 1 && (
        <PanelResizeHandle className="flex h-auto items-center justify-center">
          <div className="h-12 w-1 rounded-full bg-slate-700" />
        </PanelResizeHandle>
      )}
    </Fragment>
  );
};
