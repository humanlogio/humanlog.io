import { useApiClients } from "@/context/api-provider";
import { Dispatch, SetStateAction, useCallback } from "react";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { ListQueryHistoryResponse_ListItem } from "api/js/svc/user/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { QueryList } from "@/components/log-interface/query-library/query-list";

interface RecentQueryProps {
  items: ListQueryHistoryResponse_ListItem[];
  loading: boolean;
  error: Error | null;
  setData: Dispatch<SetStateAction<ListQueryHistoryResponse_ListItem[]>>;
  targetRef: (node?: Element | null) => void;
}

export const RecentQuery = ({
  items,
  loading,
  error,
  setData,
  targetRef,
}: RecentQueryProps) => {
  const { apiClients } = useApiClients();

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
      items={items}
      loading={loading}
      error={error}
      setData={setData}
      targetRef={targetRef}
      getItemData={getItemData}
      getItemID={getItemID}
      deleteItem={deleteHistoryQuery}
      emptyMessage="No recent queries found"
    />
  );
};
