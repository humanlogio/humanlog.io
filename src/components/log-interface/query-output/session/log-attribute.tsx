import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KV, Val } from "api/js/types/v1/types_pb";
import { memo } from "react";
import {
  FilterByKeyValue,
  KeyValueRow,
} from "@/components/log-interface/query-output/session/session-control";
import {
  newIdentifierExpr,
  newLiteralExpr,
} from "@/lib/utils/queryExpressions";

type ThemeType = "msg" | "time" | "key" | "value" | "levels";

interface LogAttributeProps {
  kv: KV;
  getColor: (type: ThemeType) => string | undefined;
  formattedValue: (value?: Val) => string;
}

export const LogAttribute = memo(
  ({ kv, getColor, formattedValue }: LogAttributeProps) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline">
            <span style={{ color: getColor("key") }}>{kv.key}=</span>
            <span style={{ color: getColor("value") }}>
              {formattedValue(kv.value)}
            </span>
          </span>
        </TooltipTrigger>

        <TooltipContent>
          <KeyValueRow label="Key" value={kv.key} />
          <KeyValueRow
            label="Type"
            value={kv.value?.kind.case?.toString() ?? ""}
          />
          <KeyValueRow label="Value" value={formattedValue(kv.value)} />
          <div className="mt-2 border-t border-gray-200 pt-2" />
          <FilterByKeyValue
            symbolName={newIdentifierExpr(kv.key)}
            symbolValue={newLiteralExpr(kv.value!)}
            symbolCase={kv.value?.kind.case}
          />
        </TooltipContent>
      </Tooltip>
    );
  },
);

LogAttribute.displayName = "LogAttribute";
