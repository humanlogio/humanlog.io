import { Data, Logs, Spans } from "api/js/types/v1/data_pb";
import {
  Arr,
  Table,
  TableType,
  TableType_Column,
} from "api/js/types/v1/types_pb";

export const newTableData = (v: Table) => {
  return new Data({
    shape: {
      case: "freeForm",
      value: v,
    },
  });
};

export const newLogsData = (v: Logs) => {
  return new Data({
    shape: {
      case: "logs",
      value: v,
    },
  });
};

export const newSpansData = (v: Spans) => {
  return new Data({
    shape: {
      case: "spans",
      value: v,
    },
  });
};

export const newTable = (columns?: TableType_Column[], rows?: Arr[]) => {
  return new Table({
    type: new TableType({
      columns: columns || [],
    }),
    rows: rows || [],
  });
};
