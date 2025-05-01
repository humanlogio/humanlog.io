import { valueToJSX } from "@/lib/utils/valueFormatters";
import { Arr, TableType_Column } from "api/js/types/v1/types_pb";
import { useMemo, useState } from "react";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  );
};

export default TableContainer;
