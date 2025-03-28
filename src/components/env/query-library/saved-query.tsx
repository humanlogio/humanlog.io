import { useApiClients } from "@/context/api-provider";
import { useCallback } from "react";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { QueryList } from "@/components/env/query-library/query-list";
import { ListFavoriteQueryResponse_ListItem } from "api/js/svc/user/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { Cursor } from "api/js/types/v1/cursor_pb";

export const SavedQuery = () => {
  const { apiClients } = useApiClients();

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

  const getItemData = useCallback(
    (item: ListFavoriteQueryResponse_ListItem) => {
      return {
        id: item.favorite?.id as bigint,
        rawQuery: item.favorite?.rawQuery || "",
        createdAt: item.favorite?.createdAt as Timestamp,
        name: item.favorite?.name,
        note: item.favorite?.note,
      };
    },
    [],
  );

  const getItemID = (
    item: ListFavoriteQueryResponse_ListItem,
  ): bigint | undefined => {
    return item.favorite?.id;
  };

  const deleteSavedQuery = useCallback(
    (id: bigint) => {
      try {
        apiClients?.user.deleteFavoriteQuery({ id });
        toast.success("Successfully deleted saved query!");
      } catch (error) {
        if (error instanceof ConnectError) toast.error(error.message);
      }
    },
    [apiClients?.user],
  );

  return (
    <QueryList<ListFavoriteQueryResponse_ListItem>
      fetchItems={fetchSavedQueries}
      getItemData={getItemData}
      getItemID={getItemID}
      deleteItem={deleteSavedQuery}
      emptyMessage="No saved queries found"
    />
  );
};
