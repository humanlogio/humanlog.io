import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Query } from "api/js/types/v1/query_pb";
import { Arr, Table, TableType_Column } from "api/js/types/v1/types_pb";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { ShareQuery } from "@/components/log-interface/share-query";
import { Data } from "api/js/types/v1/data_pb";
import {
  newFreeFormTablular,
  newTable,
  newTabularData,
} from "@/lib/utils/dataBuilders";
import TableContainer from "@/components/log-interface/query-output/freeform/table-container";
import Histogram from "@/components/log-interface/query-output/freeform/histogram-container";

interface FreeFormContainerProps {
  query: Query | undefined;
  providedData?: Table;
  queryHistoryEntry?: QueryHistoryEntry;
}

export const FreeFormContainer = ({
  query,
  providedData,
  queryHistoryEntry,
}: FreeFormContainerProps) => {
  const { targetRef, fetchNext, fetchData, next } = useInfiniteQuery(query);
  const [data, setData] = useState<Table>();
  const [tableColumns, setTableColumns] = useState<TableType_Column[]>();
  const [tableRows, setTableRows] = useState<Arr[]>();
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const onClickShare = () => {
    const data = newTabularData(
      newFreeFormTablular(newTable(tableColumns, tableRows)),
    );
    setSharedData(data);
  };

  useEffect(() => {
    if (providedData) {
      setData(providedData);
      setTableColumns(providedData.type?.columns);
      setTableRows(providedData.rows);
      return;
    } else {
      if (!query) return;
      fetchData(({ value: shapeValue }) => {
        setData(shapeValue);
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

  const isHistogram = tableColumns?.find(
    (col) => col.type?.type.case === "map",
  );

  return (
    <div className="flex-1">
      {queryHistoryEntry && (
        <div className="flex w-full justify-end">
          <TooltipProvider>
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
          </TooltipProvider>
        </div>
      )}
      {isHistogram ? (
        <Histogram
          data={data}
          tableColumns={tableColumns}
          tableRows={tableRows}
          targetRef={targetRef}
        />
      ) : (
        <TableContainer
          tableColumns={tableColumns}
          tableRows={tableRows}
          targetRef={targetRef}
        />
      )}
    </div>
  );
};
