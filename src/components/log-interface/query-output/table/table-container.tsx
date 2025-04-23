import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { valueToJSX } from "@/lib/utils/valueFormatters";
import { Query } from "api/js/types/v1/query_pb";
import { Arr, Table, TableType_Column } from "api/js/types/v1/types_pb";
import { useEffect, useMemo, useState } from "react";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  newFreeFormTablular,
  newTable,
  newTabularData,
} from "@/lib/utils/dataBuilders";
import { Data } from "api/js/types/v1/data_pb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { ShareQuery } from "@/components/log-interface/share-query";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";

interface TableProps {
  query: Query | undefined;
  providedData?: Table;
  queryHistoryEntry?: QueryHistoryEntry;
}

const TableContainer = ({
  query,
  providedData,
  queryHistoryEntry,
}: TableProps) => {
  const { targetRef, fetchNext, fetchData, next } = useInfiniteQuery(query);

  const [tableColumns, setTableColumns] = useState<TableType_Column[]>();
  const [tableRows, setTableRows] = useState<Arr[]>();
  const [columnSizing, setColumnSizing] = useState({});
  const [columnSizingInfo, setColumnSizingInfo] = useState({});
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const columns = useMemo(() => {
    if (!tableColumns || tableColumns.length === 0) return [];

    return tableColumns.map((col, colIndex) => {
      let size = 100;
      let maxSize = 300;
      let minSize = 60;
      switch (col.name) {
        case "raw":
          size = 500;
          maxSize = 1500;
          minSize = 300;
          break;
        case "machine":
        case "event":
        case "lvl":
          size = 60;
          maxSize = 100;
          minSize = 30;
          break;
        case "parsed_at":
        case "ts":
          size = 180;
          break;
        case "session":
          size = 150;
          maxSize = 250;
          break;
        default:
          size = 100;
          maxSize = 300;
          minSize = 60;
      }

      return {
        accessorKey: col.name,
        header: col.name,
        minSize,
        size,
        maxSize,
        state: {
          columnSizing,
          columnSizingInfo,
        },
        onColumnSizingChange: setColumnSizing,
        onColumnSizingInfoChange: setColumnSizingInfo,
        cell: (info: CellContext<Arr, unknown>) => {
          const rowIndex = info.row.index;

          if (!tableRows || !tableRows[rowIndex] || !tableRows[rowIndex].items)
            return null;

          const item = tableRows[rowIndex].items[colIndex];
          return item ? valueToJSX(item) : null;
        },
      };
    });
  }, [tableColumns, tableRows]);

  const table = useReactTable({
    data: tableRows || [],
    getCoreRowModel: getCoreRowModel(),
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  useEffect(() => {
    if (providedData) {
      setTableColumns(providedData.type?.columns);
      setTableRows(providedData.rows);
      return;
    } else {
      if (!query) return;
      fetchData(({ value: shapeValue }) => {
        if (shapeValue?.type?.columns) {
          setTableColumns(shapeValue.type.columns);
        }

        if (shapeValue?.rows) {
          setTableRows(shapeValue.rows);
        }
      });
    }
  }, [query]);

  useEffect(() => {
    next &&
      fetchNext &&
      fetchData(({ value: shapeValue }) => {
        setTableRows((prev) => {
          if (prev) {
            return [...prev, ...shapeValue.rows];
          }
        });
      });
  }, [fetchNext]);

  const onClickShare = () => {
    const data = newTabularData(
      newFreeFormTablular(newTable(tableColumns, tableRows)),
    );
    setSharedData(data);
  };

  return (
    <TooltipProvider>
      {queryHistoryEntry && (
        <div className="flex w-full justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onClickShare} size="xs" variant="outline">
                <Share size={12} />
              </Button>
            </TooltipTrigger>
            {sharedData && (
              <ShareQuery
                sharedData={sharedData}
                setSharedData={setSharedData}
                queryHistoryEntry={queryHistoryEntry}
              />
            )}

            <TooltipContent>Share Query</TooltipContent>
          </Tooltip>
        </div>
      )}
      <div className="text-[10px]">
        <style jsx>{`
          .resizer {
            position: absolute;
            top: 0;
            right: -2px;
            height: 100%;
            width: 3px;
            cursor: col-resize;
            user-select: none;
            touch-action: none;
            z-index: 1;
          }

          .resizer.isResizing {
            background: rgba(0, 0, 0, 0.8);
            opacity: 1;
          }

          @media (hover: hover) {
            .resizer:hover {
              background: rgba(0, 0, 0, 0.6);
            }
          }
        `}</style>
        <div className="overflow-auto">
          <table className="mt-4 w-full table-fixed">
            <thead className="dark:bg-darkBg bg-muted border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      style={{
                        position: "relative",
                        width: `${header.getSize()}px`,
                        overflow: "visible",
                      }}
                      key={header.id}
                      className="border-border border px-2 dark:border-white"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                        ></div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      style={{
                        width: `${cell.column.getSize()}px`,
                        maxWidth: "none",
                      }}
                      key={cell.id}
                      className="border-border border px-2 break-words text-ellipsis dark:border-white"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr ref={targetRef}>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TableContainer;
