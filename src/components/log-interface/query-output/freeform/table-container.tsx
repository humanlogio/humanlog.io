import { valueToString, varTypeToString } from "@/lib/utils/value-formatters";
import { Arr, TableType_Column, ScalarType } from "api/js/types/v1/types_pb";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnSizingInfoState,
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
import config from "@/features/config";
import { TableVirtuoso } from "react-virtuoso";

interface TableProps {
  tableColumns?: TableType_Column[];
  tableRows?: Arr[];
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

const TableContainer = ({
  tableColumns,
  tableRows,
  hasNextPage,
  fetchNextPage,
}: TableProps) => {
  const isProd = config.NEXT_PUBLIC_IS_PROD;

  const [columnSizing, setColumnSizing] = useState({});
  const [columnSizingInfo, setColumnSizingInfo] =
    useState<ColumnSizingInfoState>({
      columnSizingStart: [],
      deltaOffset: 0,
      deltaPercentage: 0,
      isResizingColumn: false,
      startOffset: 0,
      startSize: 0,
    });
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    hasNextPage && fetchNextPage && fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate initial column width based on column count
  const calculateInitialColumnWidth = (
    columnCount: number,
    containerWidth: number,
  ) => {
    const MIN_COLUMN_WIDTH = 120;
    const PADDING = 32;

    const availableWidth = containerWidth - PADDING;
    const evenWidth = availableWidth / columnCount;

    return Math.max(MIN_COLUMN_WIDTH, evenWidth);
  };

  // Check if total table width exceeds screen width
  const shouldEnableHorizontalScroll = (
    columnCount: number,
    containerWidth: number,
  ) => {
    const minTableWidth = columnCount * 120; // Minimum column width * column count
    return minTableWidth > containerWidth - 32;
  };

  const columns = useMemo(() => {
    if (!tableColumns || tableColumns.length === 0) return [];

    const columnCount = tableColumns.length;
    const initialWidth = calculateInitialColumnWidth(
      columnCount,
      containerWidth,
    );
    const enableScroll = shouldEnableHorizontalScroll(
      columnCount,
      containerWidth,
    );

    return tableColumns.map((col, colIndex) => {
      return {
        accessorKey: col.name,
        header: col.name,
        minSize: 80,
        size: initialWidth,
        maxSize: 9999,
        enableResizing: true,
        cell: (info: CellContext<Arr, unknown>) => {
          const rowIndex = info.row.index;

          if (!tableRows || !tableRows[rowIndex] || !tableRows[rowIndex].items)
            return null;

          const item = tableRows[rowIndex].items[colIndex];
          const column = tableColumns[colIndex];

          return item ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="px-1 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800">
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
  }, [tableColumns, tableRows, containerWidth]);

  const table = useReactTable({
    data: tableRows || [],
    getCoreRowModel: getCoreRowModel(),
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      columnSizing,
      columnSizingInfo,
    },
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
  });

  // Determine table mode based on column count
  const columnCount = tableColumns?.length || 0;
  const isScrollMode = shouldEnableHorizontalScroll(
    columnCount,
    containerWidth,
  );
  const tableWidth = isScrollMode ? "auto" : "100%";

  return (
    <div
      ref={containerRef}
      className="table-container flex w-full flex-col rounded-md bg-white dark:bg-black"
    >
      <div className="flex flex-grow text-xs">
        <div className="w-full py-2">
          <style jsx>{`
            .resizer {
              position: absolute;
              top: 0;
              right: -3px;
              height: 100%;
              width: 3px;
              cursor: col-resize;
              user-select: none;
              touch-action: none;
              z-index: 1;
              background: transparent;
              transition: background-color 0.2s ease;
            }

            .resizer.isResizing {
              background: gray;
              opacity: 0.8;
            }

            @media (hover: hover) {
              .resizer:hover {
                background: gray;
                opacity: 0.6;
              }
            }

            .scroll-container {
              overflow-x: auto !important;
              overflow-y: visible;
              width: 100%;
            }

            .table-wrapper {
              width: ${tableWidth};
              min-width: ${isScrollMode ? `${columnCount * 120}px` : "100%"};
              display: block;
            }

            .table-container table {
              width: ${isScrollMode ? `${columnCount * 120}px` : "100%"};
              min-width: ${isScrollMode ? `${columnCount * 120}px` : "100%"};
            }
          `}</style>

          <div className="overflow-hidden rounded">
            <div
              className="scroll-container scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-600"
              style={{ overflowX: "auto" }}
            >
              <div className="table-wrapper">
                <TableVirtuoso
                  style={{ height: "calc(100vh - 260px)" }}
                  totalCount={tableRows?.length}
                  endReached={loadMore}
                  components={{
                    Table: ({ style, ...props }) => (
                      <table
                        className="w-full font-mono"
                        {...props}
                        style={{
                          ...style,
                          tableLayout: isScrollMode ? "auto" : "fixed",
                          minWidth: isScrollMode
                            ? `${columnCount * 120}px`
                            : "100%",
                        }}
                      />
                    ),
                    TableRow: (props) => {
                      if (!tableRows) return <tr {...props} />;

                      const index = props["data-index"];
                      const row = table.getRowModel().rows[index];

                      return (
                        <tr
                          {...props}
                          key={row.id}
                          className="border-b border-slate-100 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              style={{
                                width: `${cell.column.getSize()}px`,
                                maxWidth: `${cell.column.getSize()}px`,
                              }}
                              key={cell.id}
                              className="overflow-hidden border-r border-slate-100 px-2 py-1 last:border-r-0 dark:border-slate-800"
                            >
                              <div className="break-words text-ellipsis">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    },
                  }}
                  fixedHeaderContent={() => {
                    return table.getHeaderGroups().map((headerGroup) => (
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
                              className="bg-muted border-r border-slate-200 px-2 py-2 text-left font-semibold tracking-wider text-slate-700 last:border-r-0 dark:border-slate-700 dark:text-slate-300"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate">
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
                    ));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableContainer;
