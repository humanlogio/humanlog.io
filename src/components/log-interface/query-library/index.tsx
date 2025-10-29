import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { useApiClients } from "@/context/api-provider";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  ListFavoriteQueryResponse_ListItemSchema,
  ListQueryHistoryResponse_ListItemSchema,
} from "api/js/svc/user/v1/service_private_pb";
import { SymbolList } from "@/components/log-interface/query-library/symbol-list";
import { SavedQuery } from "@/components/log-interface/query-library/saved-query";
import { RecentQuery } from "@/components/log-interface/query-library/recent-query";
import { ExecuteQuery } from "@/components/log-interface";
import { create } from "@bufbuild/protobuf";
import { useEnvironmentStore } from "@/stores/environment-store";

interface QueryLibraryProps {
  onClickSymbol: (symbolString: string) => void;
  recentQueryId?: bigint;
  savedQueryId?: bigint;
  setSavedQueryId: Dispatch<SetStateAction<bigint | undefined>>;
  onExecuteQuery: ExecuteQuery;
}

type tabsType = "symbols" | "saved" | "recent";

const tabs: { name: tabsType; text: string }[] = [
  { name: "symbols", text: "Symbol List" },
  { name: "saved", text: "Saved" },
  { name: "recent", text: "Recent" },
];

export const QueryLibrary = ({
  onClickSymbol,
  recentQueryId,
  savedQueryId,
  setSavedQueryId,
  onExecuteQuery,
}: QueryLibraryProps) => {
  const { apiClients } = useApiClients();
  const { activeEnvironment } = useEnvironmentStore();

  const [activeTab, setActiveTab] = useState<tabsType>("symbols");

  const fetchSymbolList = useCallback(
    async ({ cursor, limit }: { cursor: Cursor | null; limit: number }) => {
      const res = await apiClients?.query.listSymbols({
        environmentId: activeEnvironment?.environment?.id,
        ...(cursor && { cursor }),
        limit,
      });
      return {
        items: res?.items || [],
        next: res?.next || null,
      };
    },
    [apiClients?.query],
  );

  const fetchSavedQueries = useCallback(
    async ({ cursor, limit }: { cursor: Cursor | null; limit: number }) => {
      const res = await apiClients?.user.listFavoriteQuery({
        ...(cursor && { cursor }),
        limit,
      });
      return {
        items: res?.items || [],
        next: res?.next || null,
      };
    },
    [apiClients?.user],
  );

  const fetchRecentQueries = useCallback(
    async ({ cursor, limit }: { cursor: Cursor | null; limit: number }) => {
      const res = await apiClients?.user.listQueryHistory({
        ...(cursor && { cursor }),
        limit,
      });
      return {
        items: res?.items || [],
        next: res?.next || null,
      };
    },
    [apiClients?.user],
  );

  const {
    data: symbolListData,
    loading: symbolListLoading,
    error: symbolListError,
    targetRef: symbolListTargetRef,
  } = useInfiniteScroll(fetchSymbolList, { limit: 100 });

  const {
    data: savedQueryData,
    loading: savedQueryLoading,
    error: savedQueryError,
    targetRef: savedQueryTargetRef,
    setData: setSavedQueryData,
  } = useInfiniteScroll(fetchSavedQueries, { limit: 100 });

  const {
    data: recentQueriesData,
    loading: recentQueriesLoading,
    error: recentQueriesError,
    targetRef: recentQueriesTargetRef,
    setData: setRecentQueriesData,
  } = useInfiniteScroll(fetchRecentQueries, { limit: 100 });

  const updateQueryHistory = useCallback(async () => {
    const res = await apiClients?.user.getQueryHistory({ id: recentQueryId });
    if (!res) return;
    setRecentQueriesData((prev) => {
      const filtered = prev.filter(
        (query) => query.entry?.id !== recentQueryId,
      );
      const listItem = create(ListQueryHistoryResponse_ListItemSchema, {
        entry: res.entry,
      });
      return [listItem, ...filtered];
    });
  }, [recentQueryId, apiClients?.user, setRecentQueriesData]);

  const updateSavedQuery = useCallback(async () => {
    const res = await apiClients?.user.getFavoriteQuery({ id: savedQueryId });
    if (res) {
      setSavedQueryData((prev) => {
        const filtered = prev.filter(
          (query) => query.favorite?.id != savedQueryId,
        );
        const listItem = create(ListFavoriteQueryResponse_ListItemSchema, {
          favorite: res.favorite,
        });
        return [listItem, ...filtered];
      });
    }
  }, [savedQueryId, apiClients?.user, setSavedQueryData]);

  useEffect(() => {
    recentQueryId && updateQueryHistory();
  }, [recentQueryId]);

  useEffect(() => {
    savedQueryId && updateSavedQuery();
  }, [savedQueryId]);

  return (
    <div className="">
      <p className="mb-4 flex">
        {tabs.map((list) => {
          return (
            <button
              key={list.name}
              className={twMerge(
                "px-4 py-2 text-sm font-medium",
                activeTab === list.name
                  ? "border-main text-main border-b-2"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
              onClick={() => setActiveTab(list.name)}
            >
              {list.text}
            </button>
          );
        })}
      </p>
      <div className="h-[calc(100vh-160px)] w-full overflow-y-auto">
        {activeTab === "symbols" && (
          <SymbolList
            items={symbolListData}
            loading={symbolListLoading}
            error={symbolListError}
            targetRef={symbolListTargetRef}
            onClickSymbol={onClickSymbol}
          />
        )}
        {activeTab === "saved" && (
          <SavedQuery
            items={savedQueryData}
            loading={savedQueryLoading}
            error={savedQueryError}
            setData={setSavedQueryData}
            targetRef={savedQueryTargetRef}
            setSavedQueryId={setSavedQueryId}
            onExecuteQuery={onExecuteQuery}
          />
        )}
        {activeTab === "recent" && (
          <RecentQuery
            items={recentQueriesData}
            loading={recentQueriesLoading}
            error={recentQueriesError}
            setData={setRecentQueriesData}
            targetRef={recentQueriesTargetRef}
            onExecuteQuery={onExecuteQuery}
          />
        )}
      </div>
    </div>
  );
};
