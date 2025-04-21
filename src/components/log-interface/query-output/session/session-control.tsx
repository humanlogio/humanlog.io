import { TooltipContent } from "@/components/ui/tooltip";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";

import { formatTimestamp, getUnixTimestamp } from "@/lib/utils/formatTimeStamp";
import { Timestamp } from "@bufbuild/protobuf";

export const KeyValueRow = ({
  label,
  value,
}: {
  label: string;
  value: string | bigint;
}) => {
  return value ? (
    <div className="flex">
      <span className="w-28 text-gray-400">{label} </span>
      <span>{value}</span>
    </div>
  ) : null;
};

export const MetaDataTooltip = ({ log }: { log: IngestedLogEvent }) => {
  return (
    <TooltipContent align="start">
      <div>
        <KeyValueRow label="Machine Id" value={log.machineId.toString()} />
        <KeyValueRow label="Session Id" value={log.sessionId.toString()} />
        <KeyValueRow label="Event Id" value={log.eventId.toString()} />
        <KeyValueRow
          label="Local"
          value={formatTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
            "Jan _2 15:04:05.000",
          )}
        />
        <KeyValueRow
          label="UTC"
          value={formatTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
            "Jan _2 15:04:05.000",
            true,
          )}
        />
        <KeyValueRow
          label="Timestamp"
          value={getUnixTimestamp(
            (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
          ).toString()}
        />
      </div>
    </TooltipContent>
  );
};
import { BinaryOp_Operator } from "api/js/types/v1/logquery_pb";
import { KV } from "api/js/types/v1/types_pb";

export const FilterByKeyValue = ({
  kv,
  onClickFilterBy,
}: {
  kv: KV;
  onClickFilterBy: (kv: KV, op?: BinaryOp_Operator) => void;
}) => {
  const OPERATORS = [
    {
      label: "equals (==)",
      value: BinaryOp_Operator.CMP_EQ,
      cases: ["str", "i64", "default"],
    },
    {
      label: "not equals (!=)",
      value: BinaryOp_Operator.CMP_NOTEQ,
      cases: ["str", "i64", "default"],
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
      cases: ["i64"],
    },
    {
      label: "greater than or equals (>=)",
      value: BinaryOp_Operator.CMP_GTE,
      cases: ["i64"],
    },
    { label: "less than (<)", value: BinaryOp_Operator.CMP_LT, cases: ["i64"] },
    {
      label: "less than or equals (<=)",
      value: BinaryOp_Operator.CMP_LTE,
      cases: ["i64"],
    },
  ];

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <div className="mb-2 flex w-auto flex-wrap gap-1">
        {OPERATORS.filter((op) => {
          const valueCase = kv.value?.kind.case || "default";
          return op.cases.includes(valueCase);
        }).map((op, index) => (
          <button
            key={`${kv.key}-${op.value}-${index}`}
            className="bg-muted rounded px-2 py-1 text-xs hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            onClick={() => onClickFilterBy && onClickFilterBy(kv, op.value)}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
};
