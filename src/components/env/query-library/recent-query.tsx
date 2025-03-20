import { useApiClients } from "@/context/api-provider";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronRight } from "lucide-react";
import { ListQueryHistoryResponse_ListItem } from "api/js/svc/user/v1/service_pb";

dayjs.extend(relativeTime);

export const RecentQuery = () => {
  const { apiClients } = useApiClients();
  const [queryHistory, setQueryHistory] =
    useState<ListQueryHistoryResponse_ListItem[]>();

  const getRecentQuery = useCallback(async () => {
    try {
      const res = await apiClients?.user.listQueryHistory({ limit: 100 });
      const validQueries =
        res?.items.filter(
          (item) =>
            item?.entry?.query && Object.keys(item.entry.query).length > 0,
        ) || [];
      setQueryHistory(validQueries);
    } catch (error) {
      console.error("Failed to fetch query history:", error);
    }
  }, [apiClients?.user]);

  useEffect(() => {
    getRecentQuery();
  }, [getRecentQuery]);

  if (queryHistory?.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-gray-500">
        <p>No recent queries found</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] w-full space-y-2 overflow-y-auto scrollbar-hide">
      {queryHistory?.map((item) => (
        <div
          key={item.entry?.id}
          className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Recent Query #{item.entry?.id}
              </div>
              <span className="text-xs text-gray-500">
                {/* {dayjs(item.entry?.createdAt).fromNow()} */}
              </span>
            </div>
            <div className="mt-1 line-clamp-3 text-xs text-gray-600 dark:text-gray-300">
              {JSON.stringify(item.entry?.query)}
              {/* {formatQueryDisplay(item.entry?.query)} */}
            </div>
          </div>
          <ChevronRight className="ml-2 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
};
