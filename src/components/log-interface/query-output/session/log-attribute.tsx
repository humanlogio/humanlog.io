import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KV, Val } from "api/js/types/v1/types_pb";
import { memo, useState } from "react";
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
    const [isTooltipOpen, setisTooltipOpen] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setisTooltipOpen((prev) => !prev);
    };

    return (
      <span className="mr-1 inline-flex">
        {isTooltipOpen ? (
          <Tooltip open={isTooltipOpen}>
            <TooltipTrigger asChild>
              <span
                className={`inline cursor-pointer rounded px-1 py-0.5 transition-colors ${
                  isTooltipOpen
                    ? "border border-blue-300 bg-blue-100 shadow-sm dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={handleClick}
              >
                <span style={{ color: getColor("key") }}>{kv.key}=</span>
                <span style={{ color: getColor("value") }}>
                  {formattedValue(kv.value)}
                </span>
                {isTooltipOpen && (
                  <span className="ml-1 text-xs text-blue-500">📌</span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <div className="relative">
                <KeyValueRow label="Key" value={kv.key} />
                <KeyValueRow
                  label="Type"
                  value={kv.value?.kind.case?.toString() ?? ""}
                />
                <KeyValueRow label="Value" value={formattedValue(kv.value)} />

                <div className="mt-2 border-t border-gray-200 pt-2">
                  <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Filter Options:
                  </div>
                  <FilterByKeyValue
                    symbolName={newIdentifierExpr(kv.key)}
                    symbolValue={newLiteralExpr(kv.value!)}
                    symbolCase={kv.value?.kind.case}
                  />
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span
            className="inline cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleClick}
            title="Click to view details"
          >
            <span style={{ color: getColor("key") }}>{kv.key}=</span>
            <span style={{ color: getColor("value") }}>
              {formattedValue(kv.value)}
            </span>
          </span>
        )}
      </span>
    );
  },
);

LogAttribute.displayName = "LogAttribute";
