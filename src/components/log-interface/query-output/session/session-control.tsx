import { TooltipContent } from "@/components/ui/tooltip";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { formatTimestamp, getUnixTimestamp } from "@/lib/utils/formatTimeStamp";
import { Timestamp } from "@bufbuild/protobuf";
import { BinaryOp_Operator, Expr } from "api/js/types/v1/query_pb";
import {
  newI64Expr,
  newStrExpr,
  newTimestampExpr,
} from "@/lib/utils/queryBuilders";
import { LocalhostConfig } from "api/js/types/v1/localhost_config_pb";

const OPERATORS = [
  {
    label: "equals (==)",
    value: BinaryOp_Operator.CMP_EQ,
    cases: ["str", "i64", "ts", "default"],
  },
  {
    label: "not equals (!=)",
    value: BinaryOp_Operator.CMP_NOTEQ,
    cases: ["str", "i64", "ts", "default"],
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

export const defaultConfig: LocalhostConfig = new LocalhostConfig({
  version: BigInt(2),
  formatter: {
    themes: {
      light: {
        key: {
          foreground: {
            htmlHexColor: "#146e23",
          },
        },
        value: {
          foreground: {
            htmlHexColor: "#878376",
          },
        },
        time: {
          foreground: {
            htmlHexColor: "#565454",
          },
        },
        msg: {
          foreground: {
            htmlHexColor: "#000000",
          },
        },
        levels: {
          debug: {
            foreground: {
              htmlHexColor: "#d33682",
            },
          },
          info: {
            foreground: {
              htmlHexColor: "#2aa198",
            },
          },
          warn: {
            foreground: {
              htmlHexColor: "#ff8800",
            },
          },
          error: {
            foreground: {
              htmlHexColor: "#d82626",
            },
          },
          panic: {
            foreground: {
              htmlHexColor: "#d82626",
            },
            background: {
              htmlHexColor: "#ffffff",
            },
          },
          fatal: {
            foreground: {
              htmlHexColor: "#d82626",
            },
            background: {
              htmlHexColor: "#ffff00",
            },
          },
          unknown: {
            foreground: {
              htmlHexColor: "#a9a9a9",
            },
          },
        },
      },
      dark: {
        key: {
          foreground: {
            htmlHexColor: "#48df61",
          },
        },
        value: {
          foreground: {
            htmlHexColor: "#8c887c",
          },
        },
        time: {
          foreground: {
            htmlHexColor: "#9e9e9e",
          },
        },
        msg: {
          foreground: {
            htmlHexColor: "#ffffff",
          },
        },
        levels: {
          debug: {
            foreground: {
              htmlHexColor: "#d33682",
            },
          },
          info: {
            foreground: {
              htmlHexColor: "#2aa198",
            },
          },
          warn: {
            foreground: {
              htmlHexColor: "#ff8800",
            },
          },
          error: {
            foreground: {
              htmlHexColor: "#ff6a6a",
            },
          },
          panic: {
            foreground: {
              htmlHexColor: "#ff6a6a",
            },
            background: {
              htmlHexColor: "#ffffff",
            },
          },
          fatal: {
            foreground: {
              htmlHexColor: "#ff6a6a",
            },
            background: {
              htmlHexColor: "#ffff00",
            },
          },
          unknown: {
            foreground: {
              htmlHexColor: "#a9a9a9",
            },
          },
        },
      },
    },
    time: {
      format: "Jan _2 15:04:05.000",
    },
  },
});

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

interface MetaDataTooltipProps {
  log: IngestedLogEvent;
  onClickFilterBy: (
    symbolName: string,
    symbolValue: Expr,
    op?: BinaryOp_Operator,
  ) => void;
}
export const MetaDataTooltip = ({
  log,
  onClickFilterBy,
}: MetaDataTooltipProps) => {
  return (
    <TooltipContent align="start">
      <div>
        {!!log.machineId && (
          <div className="flex justify-between gap-2">
            <KeyValueRow label="Machine Id" value={log.machineId.toString()} />
            <FilterByKeyValue
              symbolName="machine"
              symbolValue={newI64Expr(log.machineId)}
              onClickFilterBy={onClickFilterBy}
            />
          </div>
        )}

        <div className="flex justify-between gap-2">
          <KeyValueRow label="Session Id" value={log.sessionId.toString()} />
          <FilterByKeyValue
            symbolName="session"
            symbolValue={newI64Expr(log.sessionId)}
            onClickFilterBy={onClickFilterBy}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow label="Event Id" value={log.eventId.toString()} />
          <FilterByKeyValue
            symbolName="event"
            symbolValue={newI64Expr(log.eventId)}
            onClickFilterBy={onClickFilterBy}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow
            label="Level"
            value={log.structured?.lvl.toString() ?? "EMPTY"}
          />
          <FilterByKeyValue
            symbolName="lvl"
            symbolValue={newStrExpr(log.structured?.lvl)}
            onClickFilterBy={onClickFilterBy}
          />
        </div>
        <div className="flex justify-between gap-2">
          <KeyValueRow
            label="Message"
            value={log.structured?.msg.toString() ?? "no message"}
          />
          <FilterByKeyValue
            symbolName="msg"
            symbolValue={newStrExpr(log.structured?.msg)}
            onClickFilterBy={onClickFilterBy}
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
            symbolName="ts"
            symbolValue={newTimestampExpr(log.structured?.timestamp)}
            onClickFilterBy={onClickFilterBy}
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
  onClickFilterBy,
}: {
  symbolName: string;
  symbolValue: Expr;
  symbolCase?: string;
  onClickFilterBy: (
    symbolName: string,
    symbolValue: Expr,
    op?: BinaryOp_Operator,
  ) => void;
}) => {
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
