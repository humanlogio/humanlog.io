import { EllipsisVertical, FileText } from "lucide-react";
import { Timestamp } from "@bufbuild/protobuf";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import {
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { getTimeSince } from "@/lib/utils/formatTimeStamp";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Dispatch, SetStateAction, useState } from "react";
import { SaveQueryModal } from "@/components/log-interface/query-library/save-query-modal";
import { ExecuteQuery } from "@/components/log-interface";
import CodeBlock from "@/components/CodeBlock";

interface DropdownMenuItem {
  key: string;
  text: string;
  func: (id: bigint, query: string) => void;
}

export interface QueryItem {
  id: bigint;
  rawQuery: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  name?: string;
  note?: string;
}

interface DropdownMenuItem {
  key: string;
  text: string;
  func: (id: bigint, query: string) => void;
}

interface QueryListProps<T> {
  items: T[];
  loading: boolean;
  error: Error | null;
  setData: Dispatch<SetStateAction<T[]>>;
  getItemData: (item: T) => QueryItem;
  getItemID: (item: T) => bigint | undefined;
  deleteItem?: (id: bigint) => void;
  targetRef: (node?: Element | null) => void;
  emptyMessage?: string;
  limit?: number;
  enableEdit?: boolean;
  setSavedQueryId?: Dispatch<SetStateAction<bigint | undefined>>;
  onExecuteQuery: ExecuteQuery;
}

export const QueryList = <T,>({
  items,
  loading,
  error,
  setData,
  getItemData,
  getItemID,
  deleteItem,
  targetRef,
  emptyMessage = "No recent queries found",
  enableEdit = false,
  setSavedQueryId,
  onExecuteQuery,
}: QueryListProps<T>) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editingQueryId, setEditingQueryId] = useState<bigint>();

  const makeFilterFn = (id: bigint | undefined) => {
    return (item: T): boolean => {
      const itemID = getItemID(item);
      return itemID !== id;
    };
  };

  if (error) {
    toast.error(`Failed to fetch items: ${error.message}`);
  }

  const dropDownMenu: DropdownMenuItem[] = [
    {
      key: "1",
      text: "Run Query",
      func: (id: bigint, query: string) => {
        onExecuteQuery(query);
      },
    },
    {
      key: "2",
      text: "Copy Query",
      func: (id: bigint, query: string) => copyToClipboard(query, `[${query}]`),
    },
  ];

  if (enableEdit) {
    dropDownMenu.push({
      key: "3",
      text: "Edit",
      func: (id: bigint) => {
        setEditingQueryId(id);
        setIsEditing(true);
      },
    });
  }

  if (deleteItem) {
    dropDownMenu.push({
      key: "4",
      text: "Delete query",
      func: (id: bigint) => {
        const fn = makeFilterFn(id);

        deleteItem(id);
        setData((prev: T[]) => {
          if (!prev) return [];
          return prev.filter(fn);
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
    <div className="space-y-2">
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
      {editingQueryId && (
        <SaveQueryModal
          id={editingQueryId}
          isSaveQueryModalOpen={isEditing && !!editingQueryId}
          setIsSaveQueryModalOpen={setIsEditing}
          setSavedQueryId={setSavedQueryId}
        />
      )}
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
      className="group w-full rounded-lg border p-3"
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
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

          <div className="mt-2 max-w-full overflow-x-auto rounded">
            <CodeBlock code={item.rawQuery} language="kusto" />
          </div>
        </div>
      </div>

      {hasNote && isNoteExpanded && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <div className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-gray-50 p-2 dark:bg-gray-800">
            <ReactMarkdown>{item.note}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {item.updatedAt
            ? `saved ${getTimeSince(item.updatedAt)}`
            : `executed ${getTimeSince(item.createdAt)}`}
        </p>
      </div>
    </div>
  );
};
