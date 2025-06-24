import { TooltipContent } from "@/components/ui/tooltip";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { formatTimestamp, getUnixTimestamp } from "@/lib/utils/formatTimeStamp";
import { Timestamp } from "@bufbuild/protobuf";
import { BinaryOp_Operator, Expr } from "api/js/types/v1/query_pb";
import { LocalhostConfig } from "api/js/types/v1/localhost_config_pb";
import { useAllEnvironments } from "@/context/list-environments";
import {
  newI64Expr,
  newIdentifierExpr,
  newStrExpr,
  newTimestampExpr,
} from "@/lib/utils/queryExpressions";

export const OPERATORS = [
  {
    label: "equals (==)",
    value: BinaryOp_Operator.CMP_EQ,
    cases: ["str", "i64", "ts", "blob", "arr", "obj", "map", "default"],
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
    <div className="flex">
      <span className="w-28 text-gray-400">{label} </span>
      <span>{value}</span>
    </div>
  ) : null;
};

interface MetaDataTooltipProps {
  log: IngestedLogEvent;
}
export const MetaDataTooltip = ({ log }: MetaDataTooltipProps) => {
  return (
    <TooltipContent align="start">
      <div>
        {!!log.machineId && (
          <div className="flex justify-between gap-2">
            <KeyValueRow label="Machine Id" value={log.machineId.toString()} />
            <FilterByKeyValue
              symbolName={newIdentifierExpr("machine")}
              symbolValue={newI64Expr(log.machineId)}
            />
          </div>
        )}

        <div className="flex justify-between gap-2">
          <KeyValueRow label="Session Id" value={log.sessionId.toString()} />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("session")}
            symbolValue={newI64Expr(log.sessionId)}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow label="Event Id" value={log.eventId.toString()} />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("event")}
            symbolValue={newI64Expr(log.eventId)}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow
            label="Level"
            value={log.structured?.lvl.toString() ?? "EMPTY"}
          />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("lvl")}
            symbolValue={newStrExpr(log.structured?.lvl)}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow
            label="Message"
            value={log.structured?.msg.toString() ?? "no message"}
          />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("msg")}
            symbolValue={newStrExpr(log.structured?.msg)}
            symbolCase="str"
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow
            label="Timestamp"
            value={getUnixTimestamp(
              (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
            ).toString()}
          />
          <FilterByKeyValue
            symbolName={newIdentifierExpr("ts")}
            symbolValue={newTimestampExpr(log.structured?.timestamp)}
            symbolCase="ts"
          />
        </div>

        <KeyValueRow
          label="UTC"
          value={formatTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
            "Jan _2 15:04:05.000",
            true,
          )}
        />

        <KeyValueRow
          label="Local"
          value={formatTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
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
