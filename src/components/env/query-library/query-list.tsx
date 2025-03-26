import { EllipsisVertical } from "lucide-react";
import { Timestamp } from "@bufbuild/protobuf";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import {
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { getTimeSince } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";

interface DropdownMenuItem {
  key: string;
  text: string;
  func: (id: bigint, query: string) => void;
}

interface QueryItem {
  id: bigint;
  rawQuery: string;
  createdAt: Timestamp;
  name?: string;
}

interface DropdownMenuItem {
  key: string;
  text: string;
  func: (id: bigint, query: string) => void;
}

interface QueryListProps<T> {
  fetchItems: (params: { cursor: Cursor | null; limit: number }) => Promise<{
    items: T[];
    next: Cursor | null;
  }>;
  getItemData: (item: T) => QueryItem;
  deleteItem?: (id: bigint) => void;
  emptyMessage?: string;
  limit?: number;
}

export const QueryList = <T,>({
  fetchItems,
  getItemData,
  deleteItem,
  emptyMessage = "No recent queries found",
  limit = 100,
}: QueryListProps<T>) => {
  const router = useRouter();

  const {
    data: items,
    loading,
    error,
    targetRef,
    refresh,
  } = useInfiniteScroll(fetchItems, { limit });

  if (error) {
    toast.error(`Failed to fetch items: ${error.message}`);
  }

  const dropDownMenu: DropdownMenuItem[] = [
    {
      key: "1",
      text: "Run Query",
      func: (id: bigint, query: string) => router.push(`?query=${query}`),
    },
    {
      key: "2",
      text: "Copy Line",
      func: (id: bigint, query: string) => copyToClipboard(query, `[${query}]`),
    },
  ];

  if (deleteItem) {
    dropDownMenu.push({
      key: "3",
      text: "Delete query",
      func: (id: bigint, query: string) => {
        deleteItem(id);
        refresh();
      },
    });
  }

  const updateSelection = (value: string, item: QueryItem) => {
    const selected = dropDownMenu?.find((select) => select.key === value);
    if (selected) {
      selected.func(item.id, item.rawQuery);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] w-full space-y-2 overflow-y-auto">
      {items.map((item, i) => {
        const itemData = getItemData(item);
        return (
          <QueryListItem
            key={`${i}-${itemData.id}`}
            item={itemData}
            index={i}
            dropDownMenu={dropDownMenu}
            updateSelection={updateSelection}
          />
        );
      })}
      <div className="flex justify-center">
        {loading ? (
          <Loader className="animate-spin"></Loader>
        ) : (
          <div ref={targetRef} className="h-1" />
        )}
      </div>
    </div>
  );
};

interface QueryListItemProps {
  item: QueryItem;
  index: number;
  dropDownMenu: DropdownMenuItem[];
  updateSelection: (value: string, item: QueryItem) => void;
}

export const QueryListItem = ({
  item,
  index,
  dropDownMenu,
  updateSelection,
}: QueryListItemProps) => {
  return (
    <div
      key={`${index + 1}-${item.id}`}
      className="group w-full rounded-lg border border-gray-200 p-3"
    >
      <div className="flex w-full cursor-pointer items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex w-full items-center justify-between">
            {item.name && (
              <div className="text-sm font-medium">{item.name}</div>
            )}
            <Select
              value=""
              onValueChange={(value) => updateSelection(value, item)}
            >
              <SelectTrigger>
                <EllipsisVertical
                  size={13}
                  className="text-gray-400 transition-opacity"
                />
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="item-aligned">
                <SelectGroup>
                  {dropDownMenu.map((menu) => (
                    <SelectItem key={menu.key} value={menu.key}>
                      {menu.text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 max-w-full overflow-x-auto">
            <code className="block w-full whitespace-pre text-xs text-gray-700 dark:text-gray-300">
              {item.rawQuery}
            </code>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {getTimeSince(item.createdAt)}
      </p>
    </div>
  );
};
