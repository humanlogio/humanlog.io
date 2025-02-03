import { formatTimestamp, useInfiniteQuery } from "@/lib/utils";
import { Duration, Timestamp } from "@bufbuild/protobuf";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { FlatArr, TableType_Column } from "api/js/types/v1/types_pb";
import { useEffect, useState } from "react";

interface TableProps {
  query: LogQuery | undefined;
}

const TableContainer = ({ query }: TableProps) => {
  const { targetRef, isFetching, fetchNext, fetchData, next } =
    useInfiniteQuery(query);

  const [tableColumns, setTableColumns] = useState<TableType_Column[]>();
  const [tableRows, setTableRows] = useState<FlatArr[]>();

  useEffect(() => {
    fetchData(({ case: shapeCase, value: shapeValue }) => {
      if (shapeCase === "freeForm") {
        setTableColumns(shapeValue.type?.columns);

        setTableRows((prev) => {
          if (!prev) {
            return shapeValue.rows;
          }
          if (prev && next) {
            return [...prev, ...shapeValue.rows];
          }
          if (!next) {
            return prev;
          }
        });
      }
    });
  }, [fetchNext, query]);

  return (
    tableRows && (
      <table className="mt-4 w-full border">
        <thead className="border">
          <tr>
            {tableColumns?.map((col, i) => {
              return <td key={i}>{col?.name}</td>;
            })}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => {
            return (
              <tr key={i}>
                {row.items?.map((item, i) => {
                  return (
                    <td key={`${item.kind.case}-${i}`}>
                      {item.kind.value instanceof Timestamp ||
                      item.kind.value instanceof Duration
                        ? formatTimestamp(item.kind.value)
                        : item.kind.value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr ref={targetRef}>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    )
  );
};

export default TableContainer;
