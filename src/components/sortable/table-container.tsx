import { formatTimestamp, useInfiniteQuery } from "@/lib/utils";
import { valueToJSX } from "@/lib/utils/valueFormatters";
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
    fetchData(({ value: shapeValue }) => {
      setTableColumns(shapeValue.type?.columns);
      setTableRows(shapeValue.rows);
    });
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

  return (
    tableRows && (
      <table className="mt-4 w-full table-auto border">
        <thead className="border">
          <tr>
            {tableColumns?.map((col, i) => {
              return (
                <td key={i} className="px-2">
                  {col?.name}
                </td>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => {
            return (
              <tr key={i}>
                {row.items?.map((item, i) => {
                  return (
                    <td key={`${item.kind.case}-${i}`} className="px-2">
                      {valueToJSX(item)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr ref={targetRef}>
            <td />
          </tr>
        </tbody>
      </table>
    )
  );
};

export default TableContainer;
