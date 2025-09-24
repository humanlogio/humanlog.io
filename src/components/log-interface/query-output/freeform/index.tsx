import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { Arr, Table, TableType_Column } from "api/js/types/v1/types_pb";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { ShareQuery } from "@/components/log-interface/share-query";
import { Data } from "api/js/types/v1/data_pb";
import TableContainer from "@/components/log-interface/query-output/freeform/table-container";
import Histogram from "@/components/log-interface/query-output/freeform/histogram-container";
import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { extractFromStreamResponses } from "@/lib/utils/dataHelpers";
import { newTable, newTableData } from "@/lib/utils/dataShapeFactories";
import { EmptyDataView } from "@/components/log-interface/views/empty-data-view";

interface FreeFormContainerProps {
  freeForm: Table[] | undefined;
  hasNextPage?: boolean;
  isFetching?: boolean;
  fetchNextPage?: () => void;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
}

export const FreeFormContainer = ({
  freeForm,
  hasNextPage,
  isFetching,
  fetchNextPage,
  queryHistoryEntry,
  streamRes,
}: FreeFormContainerProps) => {
  const [tableData, setTableData] = useState<Table[]>();
  const [tableColumns, setTableColumns] = useState<TableType_Column[]>();
  const [tableRows, setTableRows] = useState<Arr[]>();
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const onClickShare = () => {
    const data = newTableData(newTable(tableColumns, tableRows));
    setSharedData(data);
  };

  useEffect(() => {
    if (freeForm) {
      setTableData(freeForm);
      const _tableColumns = freeForm[0]?.type?.columns;
      const _tableRows = freeForm.flatMap((table) => table.rows);
      setTableColumns(_tableColumns);
      setTableRows(_tableRows);
    }
  }, [freeForm]);

  useEffect(() => {
    if (!streamRes || streamRes.length === 0) return;
    const _tableRows = extractFromStreamResponses<Arr>(streamRes, (value) => {
      setTableColumns(value.type?.columns);
      return value.rows;
    });
    setTableRows(_tableRows);
  }, [streamRes]);

  const isHistogram = tableColumns?.find(
    (col) => col.type?.type.case === "map",
  );

  if (!tableData || tableData.length === 0) {
    return <EmptyDataView dataType="table" />;
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      {queryHistoryEntry && (
        <div className="flex w-full flex-none justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClickShare}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <Share size={14} />
                Share
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
      <div className="min-h-0 flex-1">
        {isHistogram ? (
          <Histogram
            data={tableData?.[0]}
            tableColumns={tableColumns}
            tableRows={tableRows}
          />
        ) : (
          <TableContainer
            tableColumns={tableColumns}
            tableRows={tableRows}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </div>
    </div>
  );
};
