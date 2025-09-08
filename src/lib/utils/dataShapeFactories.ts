import { Logs, Spans, DataSchema } from "api/js/types/v1/data_pb";
import {
  Arr,
  Table,
  TableType,
  TableType_Column,
  TableSchema,
  TableTypeSchema,
} from "api/js/types/v1/types_pb";
import { create } from "@bufbuild/protobuf";

export const newTableData = (v: Table) => {
  return create(DataSchema, {
    shape: {
      case: "freeForm",
      value: v,
    },
  });
};

export const newLogsData = (v: Logs) => {
  return create(DataSchema, {
    shape: {
      case: "logs",
      value: v,
    },
  });
};

export const newSpansData = (v: Spans) => {
  return create(DataSchema, {
    shape: {
      case: "spans",
      value: v,
    },
  });
};

export const newTable = (columns?: TableType_Column[], rows?: Arr[]) => {
  return create(TableSchema, {
    type: create(TableTypeSchema, {
      columns: columns || [],
    }),
    rows: rows || [],
  });
};
