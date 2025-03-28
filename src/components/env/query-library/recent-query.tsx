import { useApiClients } from "@/context/api-provider";
import { useCallback } from "react";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { QueryList } from "@/components/env/query-library/query-list";
import { ListQueryHistoryResponse_ListItem } from "api/js/svc/user/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { Cursor } from "api/js/types/v1/cursor_pb";

export const RecentQuery = () => {
  const { apiClients } = useApiClients();

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

  const getItemData = useCallback((item: ListQueryHistoryResponse_ListItem) => {
    return {
      id: item.entry?.id as bigint,
      rawQuery: item.entry?.rawQuery || "",
      createdAt: item.entry?.createdAt as Timestamp,
    };
  }, []);

  const getItemID = (
    item: ListQueryHistoryResponse_ListItem,
  ): bigint | undefined => {
    return item.entry?.id;
  };

  const deleteHistoryQuery = useCallback(
    (id: bigint) => {
      try {
        apiClients?.user.deleteFavoriteQuery({ id });
        toast.success("Successfully deleted query!");
      } catch (error) {
        if (error instanceof ConnectError) toast.error(error.message);
      }
    },
    [apiClients?.user],
  );

  return (
    <QueryList<ListQueryHistoryResponse_ListItem>
      fetchItems={fetchRecentQueries}
      getItemData={getItemData}
      getItemID={getItemID}
      deleteItem={deleteHistoryQuery}
      emptyMessage="No recent queries found"
    />
  );
};
