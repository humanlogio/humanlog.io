import { useApiClients } from "@/context/api-provider";
import { Dispatch, SetStateAction, useCallback } from "react";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { QueryList } from "@/components/log-interface/query-library/query-list";
import { ListFavoriteQueryResponse_ListItem } from "api/js/svc/user/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";

interface SavedQueryProps {
  items: ListFavoriteQueryResponse_ListItem[];
  loading: boolean;
  error: Error | null;
  setData: Dispatch<SetStateAction<ListFavoriteQueryResponse_ListItem[]>>;
  setSavedQueryId: Dispatch<SetStateAction<bigint | undefined>>;
  targetRef: (node?: Element | null) => void;
}

export const SavedQuery = ({
  items,
  loading,
  error,
  setData,
  setSavedQueryId,
  targetRef,
}: SavedQueryProps) => {
  const { apiClients } = useApiClients();

  const getItemData = useCallback(
    (item: ListFavoriteQueryResponse_ListItem) => {
      return {
        id: item.favorite?.id as bigint,
        rawQuery: item.favorite?.rawQuery || "",
        createdAt: item.favorite?.createdAt as Timestamp,
        updatedAt: item.favorite?.updatedAt,
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
      items={items}
      loading={loading}
      error={error}
      setData={setData}
      targetRef={targetRef}
      setSavedQueryId={setSavedQueryId}
      getItemData={getItemData}
      getItemID={getItemID}
      deleteItem={deleteSavedQuery}
      emptyMessage="No saved queries found"
      enableEdit={true}
    />
  );
};
