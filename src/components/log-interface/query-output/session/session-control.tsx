import { TooltipContent } from "@/components/ui/tooltip";
import { formatTimestamp, getUnixTimestamp } from "@/lib/utils/formatTimeStamp";
import { Timestamp } from "@bufbuild/protobuf";
import { BinaryOp_Operator, Expr } from "api/js/types/v1/query_pb";
import { useAllEnvironments } from "@/context/list-environments";
import {
  newI64Expr,
  newIdentifierExpr,
  newStrExpr,
  newTimestampExpr,
} from "@/lib/utils/queryExpressions";
import { Log } from "api/js/types/v1/otel_logging_pb";

export const OPERATORS = [
  {
    label: "equals (==)",
    value: BinaryOp_Operator.CMP_EQ,
    cases: [
      "str",
      "i64",
      "f64",
      "bool",
      "ts",
      "dur",
      "blob",
      "arr",
      "obj",
      "map",
      "default",
    ],
  },
  {
    label: "not equals (!=)",
    value: BinaryOp_Operator.CMP_NOTEQ,
    cases: ["str", "i64", "ts", "blob", "arr", "obj", "map", "default"],
  },
  {
    label: "contains",
    value: BinaryOp_Operator.STR_CONTAINS,
    cases: ["str"],
  },
  {
    label: "starts with",
    value: BinaryOp_Operator.STR_STARTSWITH,
    cases: ["str"],
  },
  {
    label: "ends with",
    value: BinaryOp_Operator.STR_ENDSWITH,
    cases: ["str"],
  },
  {
    label: "greater than (>)",
    value: BinaryOp_Operator.CMP_GT,
    cases: ["i64", "ts"],
  },
  {
    label: "greater than or equals (>=)",
    value: BinaryOp_Operator.CMP_GTE,
    cases: ["i64", "ts"],
  },
  {
    label: "less than (<)",
    value: BinaryOp_Operator.CMP_LT,
    cases: ["i64", "ts"],
  },
  {
    label: "less than or equals (<=)",
    value: BinaryOp_Operator.CMP_LTE,
    cases: ["i64"],
  },
];

export const KeyValueRow = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => {
  return value ? (
    <div className="flex max-w-[calc(100vw-5rem)]">
      <span className="w-28 text-gray-400">{label} </span>
      <span className="break-words">{value}</span>
    </div>
  ) : null;
};

interface MetaDataTooltipProps {
  log: Log;
}
export const MetaDataTooltip = ({ log }: MetaDataTooltipProps) => {
  return (
    <TooltipContent align="start">
      <div>
        <div className="flex justify-between gap-2">
          <KeyValueRow label="Level" value={log.severityText || "EMPTY"} />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("severity_text")}
            symbolValue={newStrExpr(log.severityText)}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow label="Message" value={log.body || "no message"} />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("body")}
            symbolValue={newStrExpr(log.body)}
            symbolCase="str"
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow
            label="Timestamp"
            value={getUnixTimestamp(
              (log.timestamp as Timestamp) ?? log.observedTimestamp,
            ).toString()}
          />
          <FilterByKeyValue
            symbolName={newIdentifierExpr(
              log.timestamp ? "_time" : "_indextime",
            )}
            symbolValue={newTimestampExpr(
              log.timestamp ?? log.observedTimestamp,
            )}
            symbolCase="ts"
          />
        </div>

        <KeyValueRow
          label="UTC"
          value={formatTimestamp(
            (log.timestamp as Timestamp) ?? log.observedTimestamp,
            "Jan _2 15:04:05.000",
            true,
          )}
        />

        <KeyValueRow
          label="Local"
          value={formatTimestamp(
            (log.timestamp as Timestamp) ?? log.observedTimestamp,
            "Jan _2 15:04:05.000",
          )}
        />
      </div>
    </TooltipContent>
  );
};

export const FilterByKeyValue = ({
  symbolName,
  symbolValue,
  symbolCase,
}: {
  symbolName: Expr;
  symbolValue: Expr;
  symbolCase?: string;
}) => {
  const { onClickFilterBy } = useAllEnvironments();
  return (
    <div className="mb-2 flex w-auto flex-wrap gap-1">
      {OPERATORS.filter((op) => {
        const valueCase = symbolCase ?? "default";
        return op.cases.includes(valueCase);
      }).map((op, index) => (
        <button
          key={`${op.value}-${index}`}
          className="bg-muted rounded px-2 py-1 text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          onClick={() =>
            onClickFilterBy &&
            onClickFilterBy(symbolName, symbolValue, op.value)
          }
        >
          {op.label}
        </button>
      ))}
    </div>
  );
};
