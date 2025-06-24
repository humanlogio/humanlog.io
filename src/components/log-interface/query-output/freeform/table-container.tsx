import { valueToString, varTypeToString } from "@/lib/utils/valueFormatters";
import { Arr, TableType_Column, ScalarType } from "api/js/types/v1/types_pb";
import { useMemo, useState } from "react";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FilterByKeyValue,
  KeyValueRow,
} from "@/components/log-interface/query-output/session/session-control";
import {
  newIdentifierExpr,
  newLiteralExpr,
} from "@/lib/utils/queryExpressions";

interface TableProps {
  tableColumns?: TableType_Column[];
  tableRows?: Arr[];
  targetRef: (node?: Element | null) => void;
}

const TableContainer = ({ tableColumns, tableRows, targetRef }: TableProps) => {
  const [columnSizing, setColumnSizing] = useState({});
  const [columnSizingInfo, setColumnSizingInfo] = useState({});

  const columns = useMemo(() => {
    if (!tableColumns || tableColumns.length === 0) return [];

    return tableColumns.map((col, colIndex) => {
      return {
        accessorKey: col.name,
        header: col.name,
        minSize: 60,
        size: 150,
        maxSize: 1000,
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
          const column = tableColumns[colIndex];

          return item ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer rounded px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {valueToString(item)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <KeyValueRow label="Value" value={valueToString(item)} />
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <FilterByKeyValue
                      symbolName={newIdentifierExpr(column?.name || "")}
                      symbolValue={newLiteralExpr(item)}
                      symbolCase={item.kind.case}
                    />
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : null;
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
  });

  return (
    <div className="flex w-full flex-col rounded-md bg-white dark:bg-black">
      <div className="flex flex-grow text-xs">
        <div className="w-full overflow-x-auto py-2">
          <style jsx>{`
            .resizer {
              position: absolute;
              top: 0;
              right: -3px;
              height: 100%;
              width: 6px;
              cursor: col-resize;
              user-select: none;
              touch-action: none;
              z-index: 1;
            }

           

            @media (hover: hover) {
              .resizer:hover {
                background: black;
                opacity: 0.5;
              }
            }
          `}</style>

          <div className="overflow-hidden rounded">
            <div className="scroll-container scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600 overflow-x-auto">
              <TooltipProvider>
                <table className="w-full table-fixed font-mono">
                  <thead className="bg-muted">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header, headerIndex) => {
                          const column = tableColumns?.[headerIndex];
                          const typeString = column
                            ? varTypeToString(column.type)
                            : "unknown";

                          return (
                            <th
                              style={{
                                position: "relative",
                                width: `${header.getSize()}px`,
                                overflow: "visible",
                              }}
                              key={header.id}
                              className="px-2 py-2 text-left font-semibold tracking-wider text-slate-700 dark:text-slate-300"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 text-xs">
                                    <KeyValueRow
                                      label="Column"
                                      value={column?.name || ""}
                                    />
                                    <KeyValueRow
                                      label="Type"
                                      value={typeString}
                                    />
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                              {header.column.getCanResize() && (
                                <div
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={`resizer ${
                                    header.column.getIsResizing()
                                      ? "isResizing"
                                      : ""
                                  }`}
                                  title="Drag to resize column"
                                ></div>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>

                  <tbody>
                    {table.getRowModel().rows.map((row, rowIndex) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-100 dark:hover:bg-slate-900 ${
                          rowIndex % 2 === 1
                            ? "bg-black/[0.02] dark:bg-white/[0.1]"
                            : ""
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            style={{
                              width: `${cell.column.getSize()}px`,
                              maxWidth: "none",
                            }}
                            key={cell.id}
                            className="px-2 py-1 break-words text-ellipsis"
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
                      <td colSpan={tableColumns?.length || 1} className="h-4" />
                    </tr>
                  </tbody>
                </table>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableContainer;
