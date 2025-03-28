import { EllipsisVertical, FileText } from "lucide-react";
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
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import {
  ListFavoriteQueryResponse_ListItem,
  ListQueryHistoryResponse_ListItem,
} from "api/js/svc/user/v1/service_pb";

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
  note?: string;
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
    setData,
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
        setData((prev) => {
          if (prev) {
            if (prev) {
              return prev.filter((item) => {
                if (item instanceof ListFavoriteQueryResponse_ListItem) {
                  return item.favorite?.id !== id;
                }
                if (item instanceof ListQueryHistoryResponse_ListItem) {
                  return item.entry?.id !== id;
                }
              });
            }
          }
          return [];
        });
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
      <div
        className={`flex justify-center ${items.length === 0 && "h-full items-center"}`}
      >
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
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  const hasNote = item.note && item.note.trim().length > 0;

  return (
    <div
      key={`${index + 1}-${item.id}`}
      className="group w-full rounded-lg border border-gray-200 p-3"
    >
      <div className="flex w-full cursor-pointer items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {item.name && (
                <div className="text-sm font-medium">{item.name}</div>
              )}

              {hasNote && (
                <button
                  onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                >
                  <FileText size={14} className="mr-1" />
                  {isNoteExpanded ? "Hide note" : "View note"}
                </button>
              )}
            </div>
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

      {hasNote && isNoteExpanded && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <div className="prose prose-sm max-w-none rounded-md bg-gray-50 p-2 dark:prose-invert dark:bg-gray-800">
            <ReactMarkdown>{item.note}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">{getTimeSince(item.createdAt)}</p>

        {/* 노트가 있는 경우 작은 아이콘 표시 */}
        {hasNote && !isNoteExpanded && (
          <button
            onClick={() => setIsNoteExpanded(true)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            <FileText size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
