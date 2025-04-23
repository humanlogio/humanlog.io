import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatTimestamp } from "@/lib/utils/formatTimeStamp";

import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { BinaryOp_Operator, Expr, Query } from "api/js/types/v1/query_pb";
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
import {
  FormatConfig_Themes,
  LocalhostConfig,
} from "api/js/types/v1/localhost_config_pb";
import { useTheme } from "next-themes";
import { useThemeColors } from "@/lib/utils/useThemeColors";
import { useApiClients } from "@/context/api-provider";
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
import { KV } from "api/js/types/v1/types_pb";
import {
  FilterByKeyValue,
  KeyValueRow,
  MetaDataTooltip,
} from "@/components/log-interface/query-output/session/session-control";
import { newLiteralExpr } from "@/lib/utils/queryBuilders";
import { Data, LogEvents, Tabular } from "api/js/types/v1/data_pb";
import { newLogEventsTablular, newTabularData } from "@/lib/utils/dataBuilders";
import { ShareQuery } from "@/components/log-interface/share-query";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";

interface SessionPanelProps {
  ids?: { machineId?: string; sessionId?: string };
  query: Query | undefined;
  providedData?: IngestedLogEvent[];
  mode?: "dark" | "light";
  themes?: FormatConfig_Themes;
  queryHistoryEntry?: QueryHistoryEntry;
  onClickFilterBy: (
    symbolName: string,
    symbolValue: Expr,
    op?: BinaryOp_Operator,
  ) => void;
}

const SessionPanel = ({
  ids,
  query,
  providedData,
  mode,
  themes,
  queryHistoryEntry,
  onClickFilterBy,
}: SessionPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const isDark = mode
    ? mode === "dark"
    : theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

  const pretty = searchParams.get("pretty") !== "false";

  const { apiClients } = useApiClients();

  const { targetRef, isFetching, fetchNext, fetchData, next } =
    useInfiniteQuery(query);

  /** Can be extended with additional options as needed */
  const dropDownMenu = [
    {
      key: "1",
      text: "Copy Line",
      func: (text: string) => copyToClipboard(text),
    },
  ];

  // state
  const [logs, setLogs] = useState<IngestedLogEvent[]>();
  const [config, setConfig] = useState<LocalhostConfig>();
  const [sectionBreak, setSectionBreak] = useState(false);
  const { getColor, getLevelColor } = useThemeColors(
    isDark ?? false,
    themes ?? config?.formatter?.themes,
  );
  const [selectedLines, setSelectedLines] = useState<string | null>();
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const getConfig = useCallback(async () => {
    const res = await apiClients?.localhost.getConfig({});

    setConfig(res?.config);
  }, []);

  const handleClickLine = (line: string) => {
    if (providedData) return;

    const params = new URLSearchParams(searchParams);

    if (selectedLines === line) {
      params.delete("line");
    } else {
      params.set("line", line);
    }

    router.push(`?${params}`, { scroll: false });
  };

  const isStructuredLog = (log: IngestedLogEvent) => {
    if (
      log.structured?.lvl ||
      log.structured?.msg ||
      (log.structured?.kvs && log.structured.kvs.length > 0)
    ) {
      return true;
    }
    return false;
  };

  const formatKvText = (kvs?: KV[], sectionBreak?: boolean): string => {
    if (!kvs || kvs.length === 0) return "";

    let result = "";
    kvs.forEach((kv, index) => {
      if (sectionBreak && index > 0) {
        result += "\n";
      }
      result += `${kv.key}=${kv.value?.kind.value} `;
    });

    return result;
  };

  const updateSelection = (value: string, log: IngestedLogEvent) => {
    const selected = dropDownMenu?.find((select) => select.key === value);
    if (!selected) return;

    let text: string;

    if (!pretty || !isStructuredLog(log)) {
      text = decodeUint8Array(log.raw);
    } else {
      const timestamp = formatTimestamp(
        (log.structured?.timestamp as Timestamp) ?? log.parsedAt,
        config?.formatter?.time?.format ?? "",
      );

      const level = log.structured?.lvl ?? "EMPTY";
      const message = log.structured?.msg ?? "no message";
      const kvText = formatKvText(log.structured?.kvs, sectionBreak);
      text = `${timestamp} |${level}| ${message} ${kvText}`;
    }

    selected.func(text);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    if (providedData) {
      setLogs(providedData);
      return;
    }
    fetchData(({ value: shapeValue }) => {
      setLogs(shapeValue.events);
    });
  }, [query]);

  useEffect(() => {
    next &&
      fetchNext &&
      fetchData(({ value: shapeValue }) => {
        setLogs((prev) => {
          if (prev) {
            return [...prev, ...shapeValue.events];
          }
        });
        setSharedData(shapeValue.events);
      });
  }, [fetchNext]);

  const onClickShare = () => {
    const data = newTabularData(
      newLogEventsTablular(new LogEvents({ events: logs })),
    );
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
                <div className="text-sm">
                  {ids?.machineId && <p>M-{ids?.machineId}</p>}
                  {ids?.sessionId && <p>S-{ids?.sessionId}</p>}
                </div>
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
          className={twJoin(
            "flex flex-grow text-sm",
            mode === "dark" && "bg-black",
          )}
        >
          <div className="flex-1 border-separate overflow-x-auto py-2">
            {logs && logs.length > 0 ? (
              logs?.map((log, i) => {
                return (
                  <div
                    key={`${i + 1}-${log.machineId}-${log.sessionId}-${log.eventId}`}
                    className={twMerge(
                      "relative flex w-full px-2",
                      selectedLines ===
                        `${i + 1}${log.machineId}${log.sessionId}${log.eventId}` &&
                        "bg-muted",
                      sectionBreak && pretty && "py-1",
                    )}
                  >
                    <button
                      type="button"
                      className={`w-5 flex-none hover:text-gray-400 ${isDark ? "text-white" : "text-black"}`}
                      onClick={() =>
                        handleClickLine(
                          `${i + 1}${log.machineId}${log.sessionId}${log.eventId}`,
                        )
                      }
                    >
                      {i + 1}
                    </button>
                    <Select
                      value=""
                      onValueChange={(value) => updateSelection(value, log)}
                    >
                      <SelectTrigger>
                        {selectedLines ===
                          `${i + 1}${log.machineId}${log.sessionId}${log.eventId}` &&
                        "bg-muted" ? (
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

                    {!pretty || !isStructuredLog(log) ? (
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
                        <MetaDataTooltip
                          log={log}
                          onClickFilterBy={onClickFilterBy}
                        />
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
                                  (log.structured?.timestamp as Timestamp) ??
                                    log.parsedAt,
                                  config?.formatter?.time?.format ?? "",
                                )}{" "}
                              </span>
                              <span className="text-gray-400">
                                |
                                <span
                                  style={{
                                    color: getLevelColor(log?.structured?.lvl),
                                  }}
                                >
                                  {log?.structured?.lvl || "EMPTY"}
                                </span>
                                |{" "}
                              </span>

                              <span
                                style={{ color: getColor("msg") }}
                                className="mr-1"
                              >
                                {log.structured?.msg || "no message"}
                              </span>
                            </span>
                          </TooltipTrigger>
                          <MetaDataTooltip
                            log={log}
                            onClickFilterBy={onClickFilterBy}
                          />
                        </Tooltip>
                        <div
                          className={twMerge(
                            "flex",
                            sectionBreak && "flex-col",
                          )}
                        >
                          {log.structured?.kvs.map((kv, kvIndex) => (
                            <span
                              key={`${log.sessionId}-${log.eventId}-${kvIndex}`}
                              className="mr-1 inline-flex"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline">
                                    <span style={{ color: getColor("key") }}>
                                      {kv.key}=
                                    </span>
                                    <span style={{ color: getColor("value") }}>
                                      {kv.value?.kind.value?.toString()}
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
                                    value={
                                      kv.value?.kind.value?.toString() ?? ""
                                    }
                                  />
                                  <div className="mt-2 border-t border-gray-200 pt-2" />
                                  <FilterByKeyValue
                                    symbolName={kv.key}
                                    symbolValue={newLiteralExpr(kv.value!)}
                                    symbolCase={kv.value?.kind.case}
                                    onClickFilterBy={onClickFilterBy}
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
            <div>{next && <div ref={targetRef} className="h-4" />}</div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default SessionPanel;
