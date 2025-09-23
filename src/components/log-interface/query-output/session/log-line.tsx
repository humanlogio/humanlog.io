import { useThemeColors } from "@/lib/hooks/useThemeColors";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { decodeUint8Array } from "@/lib/utils/decode";
import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { Timestamp } from "@bufbuild/protobuf/wkt";
import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Ellipsis } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MetaDataTooltip } from "@/components/log-interface/query-output/session/session-control";
import { LogAttribute } from "@/components/log-interface/query-output/session/log-attribute";
import {
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ulidToString } from "@/lib/utils/id-factories";

interface LogLineProps {
  log: Log;
  index: number;
  selectedLines: string | null;
  pretty: boolean;
  sectionBreak: boolean;
  isDark: boolean;
  themes: FormatConfig_Themes | undefined;
  localhostConfig: any;
  onClickLine: (line: string) => void;
}

export const LogLine = memo(
  ({
    log,
    index,
    selectedLines,
    pretty,
    sectionBreak,
    isDark,
    themes,
    localhostConfig,
    onClickLine,
  }: LogLineProps) => {
    if (!log) return <div></div>;

    const { getColor, getLevelColor } = useThemeColors(
      isDark,
      themes ?? localhostConfig?.formatter?.themes,
    );

    // State for metadata tooltip - changed from hover to click
    const [isTooltipOpen, setisTooltipOpen] = useState(false);

    /** Can be extended with additional options as needed */
    const dropDownMenu = [
      {
        key: "1",
        text: "Copy Line",
        func: (text: string) => copyToClipboard(text),
      },
    ];

    const lineId = `${index}-${ulidToString(log.ulid)}`;
    const isSelected = selectedLines === lineId;

    const handleMetadataClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setisTooltipOpen((prev) => !prev);
    };

    const formattedValue = useCallback((value?: Val): string => {
      if (!value) return "";

      const {
        kind: { case: valueCase, value: valueValue },
      } = value;

      switch (valueCase) {
        case "i64":
          return valueValue?.toString();
        case "ts":
          return formatTimestamp(valueValue, "Jan _2 15:04:05.000");
        case "dur":
          return formatDuration(valueValue);
        case "blob":
          return decodeUint8Array(valueValue);
        case "arr":
          return valueValue.items
            .map((item) => formattedValue(item))
            .join(", ");
        case "null":
          return "null";
        default:
          return valueValue?.toString() || "";
      }
    }, []);

    const formatKvText = useCallback(
      (kvs?: KV[], sectionBreak?: boolean): string => {
        if (!kvs || kvs.length === 0) return "";

        let result = "";
        kvs.forEach((kv, index) => {
          if (sectionBreak && index > 0) {
            result += "\n";
          }
          result += `${kv.key}=${formattedValue(kv.value)} `;
        });

        return result;
      },
      [formattedValue],
    );

    const updateSelection = useCallback(
      (value: string, log: Log) => {
        const selected = dropDownMenu?.find((select) => select.key === value);
        if (!selected) return;

        let text: string;

        if (!pretty) {
          text = decodeUint8Array(log.raw);
        } else {
          const timestamp = formatTimestamp(
            (log.timestamp as Timestamp) ?? log.observedTimestamp,
            localhostConfig?.formatter?.time?.format ?? "",
          );

          const level = log.severityText ?? "EMPTY";
          const message = log.body ?? "no message";
          const kvText = formatKvText(log.attributes, sectionBreak);
          text = `${timestamp} |${level}| ${message} ${kvText}`;
        }

        selected.func(text);
      },
      [
        dropDownMenu,
        pretty,
        localhostConfig?.formatter?.time?.format,
        sectionBreak,
        formatKvText,
      ],
    );

    const formattedTimestamp = useMemo(() => {
      return formatTimestamp(
        (log.timestamp as Timestamp) ?? log.observedTimestamp,
        localhostConfig?.formatter?.time?.format ?? "",
      );
    }, [
      log.timestamp,
      log.observedTimestamp,
      localhostConfig?.formatter?.time?.format,
    ]);

    const shouldShowRaw = useMemo(() => {
      if (log.body && log.body !== "") return false;
      if (log.attributes.length > 0) return false;
      if (log.severityText && log.severityText !== "") return false;
      return !!log.raw.length;
    }, [log.body, log.attributes.length, log.severityText, log.raw.length]);

    return (
      <div
        key={lineId}
        className={twMerge(
          "relative flex w-full px-2",
          isSelected && "bg-muted",
          sectionBreak && pretty && "py-1",
        )}
      >
        <button
          type="button"
          className={`w-5 flex-none hover:text-gray-400 ${isDark ? "text-white" : "text-black"}`}
          onClick={() => onClickLine(lineId)}
        >
          {index + 1}
        </button>
        {isSelected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-main z-1 mr-2 flex h-5 w-5 items-center justify-center rounded border hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <Ellipsis size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {dropDownMenu.map((menu) => (
                <DropdownMenuItem
                  key={menu.key}
                  onClick={() => updateSelection(menu.key, log)}
                >
                  {menu.text}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-5 flex-none" />
        )}

        {!pretty || shouldShowRaw ? (
          isTooltipOpen ? (
            <Tooltip open={isTooltipOpen}>
              <TooltipTrigger asChild>
                <code
                  className={twMerge(
                    "flex cursor-pointer gap-1 rounded px-1 py-[1px] whitespace-nowrap transition-colors",
                    isTooltipOpen
                      ? "border border-blue-300 bg-blue-100 dark:bg-blue-900"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                  onClick={handleMetadataClick}
                >
                  {decodeUint8Array(log.raw)}
                  {isTooltipOpen && (
                    <span className="ml-1 text-xs text-blue-500">📌</span>
                  )}
                </code>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="relative">
                  <MetaDataTooltip log={log} />
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <code
              className="flex cursor-pointer gap-1 rounded px-1 py-[1px] whitespace-nowrap transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleMetadataClick}
              title="Click to view metadata"
            >
              {decodeUint8Array(log.raw)}
            </code>
          )
        ) : (
          <pre
            className={twMerge(
              "log-line flex whitespace-nowrap",
              sectionBreak && "flex-col",
            )}
          >
            {isTooltipOpen ? (
              <Tooltip open={isTooltipOpen}>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-flex cursor-pointer items-center rounded px-1 py-0.5 transition-colors ${
                      isTooltipOpen
                        ? "border border-blue-300 bg-blue-100 dark:bg-blue-900"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={handleMetadataClick}
                  >
                    <span style={{ color: getColor("time") }}>
                      {formattedTimestamp}{" "}
                    </span>
                    <span className="text-gray-400">
                      |
                      <span
                        style={{
                          color: getLevelColor(log.severityText),
                        }}
                      >
                        {log?.severityText || "EMPTY"}
                      </span>
                      |{" "}
                    </span>
                    <span style={{ color: getColor("msg") }} className="mr-1">
                      {log.body || "no message"}
                    </span>
                    {isTooltipOpen && (
                      <span className="ml-1 text-xs text-blue-500">📌</span>
                    )}
                  </span>
                </TooltipTrigger>

                <div className="relative">
                  <MetaDataTooltip log={log} />
                </div>
              </Tooltip>
            ) : (
              <span
                className="inline-flex cursor-pointer items-center rounded px-1 py-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={handleMetadataClick}
                title="Click to view metadata"
              >
                <span style={{ color: getColor("time") }}>
                  {formattedTimestamp}{" "}
                </span>
                <span className="text-gray-400">
                  |
                  <span
                    style={{
                      color: getLevelColor(log.severityText),
                    }}
                  >
                    {log?.severityText || "EMPTY"}
                  </span>
                  |{" "}
                </span>
                <span style={{ color: getColor("msg") }} className="mr-1">
                  {log.body || "no message"}
                </span>
              </span>
            )}
            <div className={twMerge("flex", sectionBreak && "flex-col")}>
              {log.attributes.map((kv, kvIndex) => (
                <LogAttribute
                  key={kvIndex}
                  kv={kv}
                  getColor={getColor}
                  formattedValue={formattedValue}
                />
              ))}
            </div>
          </pre>
        )}
      </div>
    );
  },
);

LogLine.displayName = "LogLine";
