import { Data, LogEvents, Tabular } from "api/js/types/v1/data_pb";

import {
  Arr,
  Table,
  TableType,
  TableType_Column,
} from "api/js/types/v1/types_pb";

export const newTabularData = (v: Tabular) => {
  return new Data({
    shape: {
      case: "tabular",
      value: v,
    },
  });
};

export const newLogEventsTablular = (v: LogEvents) => {
  return new Tabular({
    shape: {
      case: "logEvents",
      value: v,
    },
  });
};

export const newFreeFormTablular = (v: Table) => {
  return new Tabular({
    shape: {
      case: "freeForm",
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
