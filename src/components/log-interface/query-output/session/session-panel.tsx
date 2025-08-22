import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { useInfiniteQuery } from "@/lib/hooks/useInfiniteQuery";
import { Query } from "api/js/types/v1/query_pb";
import {
  Ellipsis,
  Loader,
  Share,
  UnfoldHorizontal,
  UnfoldVertical,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragHandle } from "@/components/sortable/sortable-item";
import { Button } from "@/components/ui/button";
import { Timestamp } from "@bufbuild/protobuf";
import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import { useTheme } from "next-themes";
import { useThemeColors } from "@/lib/hooks/useThemeColors";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NoLogsView } from "@/components/log-interface/views/no-logs-view";
import { twJoin, twMerge } from "tailwind-merge";
import { usePathname, useSearchParams } from "next/navigation";
import { decodeUint8Array } from "@/lib/utils/decode";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@radix-ui/react-select";
import { KV, Val } from "api/js/types/v1/types_pb";
import {
  FilterByKeyValue,
  KeyValueRow,
  MetaDataTooltip,
} from "@/components/log-interface/query-output/session/session-control";
import { Data, Logs } from "api/js/types/v1/data_pb";
import { ShareQuery } from "@/components/log-interface/share-query";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { defaultConfig, getConfig } from "@/services/localhostService";
import { useAllEnvironments } from "@/context/list-environments";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { QueryResponse, StreamResponse } from "api/js/svc/query/v1/service_pb";
import { extractFromStreamResponses } from "@/lib/utils/dataHelpers";
import { newLogsData } from "@/lib/utils/dataShapeFactories";
import {
  newIdentifierExpr,
  newLiteralExpr,
} from "@/lib/utils/queryExpressions";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { InfiniteData } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

interface SessionPanelProps {
  resourceFingerprint?: string;

  logs: Log[] | undefined;
  hasNextPage?: boolean;
  isFetching?: boolean;
  fetchNextPage?: () => void;
  mode?: "dark" | "light";
  themes?: FormatConfig_Themes;
  queryHistoryEntry?: QueryHistoryEntry;
  streamRes?: StreamResponse[];
}

const SessionPanel = ({
  resourceFingerprint,

  logs,
  hasNextPage,
  isFetching,
  fetchNextPage,
  mode,
  themes,
  queryHistoryEntry,
  streamRes,
}: SessionPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const { localhostConfig } = useAllEnvironments();
  const { ref: targetRef, inView } = useInView();
  const { theme } = useTheme();

  const pretty = searchParams.get("pretty") !== "false";

  /** Can be extended with additional options as needed */
  const dropDownMenu = [
    {
      key: "1",
      text: "Copy Line",
      func: (text: string) => copyToClipboard(text),
    },
  ];

  const [sectionBreak, setSectionBreak] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const { getColor, getLevelColor } = useThemeColors(
    isDark,
    themes ?? localhostConfig?.formatter?.themes,
  );
  const [selectedLines, setSelectedLines] = useState<string | null>();
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const handleClickLine = (line: string) => {
    const params = new URLSearchParams(searchParams);

    if (selectedLines === line) {
      params.delete("line");
    } else {
      params.set("line", line);
    }

    router.push(`?${params}`, { scroll: false });
  };

  const formattedValue = (value?: Val): string => {
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
        return valueValue.items.map((item) => formattedValue(item)).join(", ");
      case "null":
        return "null";
      default:
        return valueValue?.toString() || "";
    }
  };

  const formatKvText = (kvs?: KV[], sectionBreak?: boolean): string => {
    if (!kvs || kvs.length === 0) return "";

    let result = "";
    kvs.forEach((kv, index) => {
      if (sectionBreak && index > 0) {
        result += "\n";
      }
      result += `${kv.key}=${formattedValue(kv.value)} `;
    });

    return result;
  };

  const updateSelection = (value: string, log: Log) => {
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
  };

  const shouldShowRaw = (log: Log): boolean => {
    if (log.body && log.body !== "") {
      return false;
    }
    if (log.attributes.length > 0) {
      return false;
    }
    if (log.severityText && log.severityText !== "") {
      return false;
    }
    return !!log.raw.length;
  };

  useEffect(() => {
    const darkMode = mode
      ? mode === "dark"
      : theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(darkMode);
  }, [mode, theme]);

  useEffect(() => {
    if (inView && fetchNextPage) fetchNextPage();
  }, [inView]);

  // useEffect(() => {
  //   if (!streamRes || streamRes.length === 0) return;
  //   const _logs = extractFromStreamResponses<Log>(
  //     streamRes,
  //     (value) => value.logs,
  //   );
  //   setLogs(_logs);
  // }, [streamRes]);

  const onClickShare = () => {
    const data = newLogsData(new Logs({ logs }));
    setSharedData(data);
  };

  useEffect(() => {
    const line = searchParams.get("line");
    if (line) {
      setSelectedLines(line);
    } else {
      setSelectedLines(null);
    }
  }, [pathname, searchParams]);

  return (
    <div
      className={`flex w-full flex-col rounded-md border ${isDark ? "bg-black" : "bg-white"}`}
    >
      <TooltipProvider>
        <div className="bg-muted flex h-11 w-full flex-none flex-row items-center justify-between p-2">
          <div className="flex justify-start">
            <h4 className="flex flex-row items-center gap-3 truncate font-bold">
              {isFetching ? (
                <div className="contents" title="Fetching more log data...">
                  <Loader className="animate-spin"></Loader>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <div className="text-sm">{resourceFingerprint}</div>
              )}
            </h4>
          </div>
          <div className="flex gap-1">
            {queryHistoryEntry && queryString && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onClickShare} size="xs" variant="outline">
                    <Share size={12} />
                  </Button>
                </TooltipTrigger>
                {sharedData && (
                  <ShareQuery
                    sharedData={sharedData}
                    setSharedData={setSharedData}
                    queryHistoryEntry={queryHistoryEntry}
                  />
                )}
                <TooltipContent>Share Query</TooltipContent>
              </Tooltip>
            )}
            {pretty && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setSectionBreak(!sectionBreak)}
                  >
                    {sectionBreak ? (
                      <UnfoldHorizontal size={13} />
                    ) : (
                      <UnfoldVertical size={13} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Toggle section line breaks in logs</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* TODO: later.. */}
          {/*
        <div className="flex w-1/3 justify-end">
          <Button size="icon" className="mb-1 h-8">
            <Search size={14} />
          </Button>
        </div> */}
        </div>

        <div
          ref={containerRef}
          className={twJoin("flex flex-grow text-sm", isDark && "bg-black")}
        >
          <div className="flex-1 border-separate overflow-x-auto py-2">
            {logs && logs.length > 0 ? (
              logs?.map((log: Log, i: number) => {
                return (
                  <div
                    key={`${i}-${log.ulid}`}
                    className={twMerge(
                      "relative flex w-full px-2",
                      selectedLines === `${i}-${log.ulid}` && "bg-muted",
                      sectionBreak && pretty && "py-1",
                    )}
                  >
                    <button
                      type="button"
                      className={`w-5 flex-none hover:text-gray-400 ${isDark ? "text-white" : "text-black"}`}
                      onClick={() => handleClickLine(`${i}-${log.ulid}`)}
                    >
                      {i + 1}
                    </button>
                    <Select
                      value=""
                      onValueChange={(value) => updateSelection(value, log)}
                    >
                      <SelectTrigger>
                        {selectedLines === `${i}-${log.ulid}` && "bg-muted" ? (
                          <div className="bg-main z-1 mr-2 flex h-5 w-5 items-center justify-center rounded border">
                            <Ellipsis size={14} />
                            <SelectValue placeholder="" />
                          </div>
                        ) : (
                          <div className="w-5 flex-none" />
                        )}
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectGroup>
                          {dropDownMenu.map((menu, index) => {
                            return (
                              <SelectItem key={menu.key} value={menu.key}>
                                {menu.text}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {!pretty || shouldShowRaw(log) ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <code
                            className={twMerge(
                              "flex gap-1 py-[1px] whitespace-nowrap",
                            )}
                          >
                            {decodeUint8Array(log.raw)}
                          </code>
                        </TooltipTrigger>
                        <MetaDataTooltip log={log} />
                      </Tooltip>
                    ) : (
                      <pre
                        className={twMerge(
                          "log-line flex whitespace-nowrap",

                          sectionBreak && "flex-col",
                        )}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center">
                              <span style={{ color: getColor("time") }}>
                                {formatTimestamp(
                                  (log.timestamp as Timestamp) ??
                                    log.observedTimestamp,
                                  localhostConfig?.formatter?.time?.format ??
                                    "",
                                )}{" "}
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

                              <span
                                style={{ color: getColor("msg") }}
                                className="mr-1"
                              >
                                {log.body || "no message"}
                              </span>
                            </span>
                          </TooltipTrigger>

                          <MetaDataTooltip log={log} />
                        </Tooltip>
                        <div
                          className={twMerge(
                            "flex",
                            sectionBreak && "flex-col",
                          )}
                        >
                          {log.attributes.map((kv, kvIndex) => (
                            <span key={kvIndex} className="mr-1 inline-flex">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline">
                                    <span style={{ color: getColor("key") }}>
                                      {kv.key}=
                                    </span>
                                    <span style={{ color: getColor("value") }}>
                                      {formattedValue(kv.value)}
                                    </span>
                                  </span>
                                </TooltipTrigger>

                                <TooltipContent>
                                  <KeyValueRow label="Key" value={kv.key} />
                                  <KeyValueRow
                                    label="Type"
                                    value={
                                      kv.value?.kind.case?.toString() ?? ""
                                    }
                                  />
                                  <KeyValueRow
                                    label="Value"
                                    value={formattedValue(kv.value)}
                                  />
                                  <div className="mt-2 border-t border-gray-200 pt-2" />
                                  <FilterByKeyValue
                                    symbolName={newIdentifierExpr(kv.key)}
                                    symbolValue={newLiteralExpr(kv.value!)}
                                    symbolCase={kv.value?.kind.case}
                                  />
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          ))}
                        </div>
                      </pre>
                    )}
                  </div>
                );
              })
            ) : (
              <NoLogsView />
            )}
            <div>{hasNextPage && <div ref={targetRef} className="h-4" />}</div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default SessionPanel;
