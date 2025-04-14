import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { getUnixTimestamp } from "@/lib/utils/formatTimeStamp";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import {
  Ellipsis,
  Filter,
  Loader,
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
import { NoLogsView } from "@/components/sortable/no-logs-view";
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

interface NewSessionPanelProps {
  ids?: { machineId?: string; sessionId?: string };
  query: LogQuery | undefined;
  fakeData?: IngestedLogEvent[];
  darkMode?: boolean;
  themes?: FormatConfig_Themes;
  onClickFilterBy: (kv: KV) => void;
}

const NewSessionPanel = ({
  ids,
  query,
  fakeData,
  darkMode,
  themes,
  onClickFilterBy,
}: NewSessionPanelProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const isDark = darkMode
    ? darkMode
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
    isDark,
    themes ?? config?.formatter?.themes,
  );
  const [selectedLines, setSelectedLines] = useState<string | null>();

  const getConfig = useCallback(async () => {
    const res = await apiClients?.localhost.getConfig({});

    setConfig(res?.config);
  }, []);

  const handleClickLine = (line: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("line", line);
    router.push(`?${params}`, { scroll: false });
  };

  const updateSelection = (
    value: string,
    text: Uint8Array<ArrayBufferLike>,
  ) => {
    const selected = dropDownMenu?.find((select) => select.key === value);
    selected?.func(decodeUint8Array(text));
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

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    if (fakeData) {
      setLogs(fakeData);
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
      });
  }, [fetchNext]);

  useEffect(() => {
    const line = searchParams.get("line");
    if (line) {
      setSelectedLines(line);
    } else {
      setSelectedLines(null);
    }
  }, [pathname, searchParams]);

  return (
    <div className="flex w-full flex-col rounded-md border">
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

          {pretty && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="h-7 w-7"
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
          className={twJoin("flex flex-grow text-sm", darkMode && "bg-black")}
        >
          <div className="border-separate overflow-x-auto py-2">
            {logs && logs.length > 0 ? (
              logs?.map((log, i) => {
                return (
                  <div
                    key={`${i + 1}-${log.machineId}-${log.sessionId}-${log.eventId}`}
                    className={twMerge(
                      "relative flex px-2",
                      selectedLines ===
                        `${i + 1}${log.machineId}${log.sessionId}${log.eventId}` &&
                        "bg-muted w-full",
                      sectionBreak && pretty && "py-1",
                    )}
                  >
                    <button
                      className="w-5 flex-none hover:text-white"
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
                      onValueChange={(value) => updateSelection(value, log.raw)}
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
                              </span>{" "}
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
                                  <div className="mt-2 border-t border-gray-200 pt-2">
                                    <button
                                      className="bg-muted flex w-full items-center justify-center gap-1 rounded px-2 py-1 text-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                      onClick={() => {
                                        onClickFilterBy(kv);
                                      }}
                                    >
                                      <Filter size={14} />
                                      <span>Filter by this value</span>
                                    </button>
                                  </div>
                                </TooltipContent>
                              </Tooltip>{" "}
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

export default NewSessionPanel;

interface MetaDataTooltipProps {
  log: IngestedLogEvent;
}

const MetaDataTooltip = ({ log }: MetaDataTooltipProps) => {
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

interface KeyValueRowProps {
  label: string;
  value: string | bigint;
}

const KeyValueRow = ({ label, value }: KeyValueRowProps) => {
  return value ? (
    <div className="flex">
      <span className="w-28 text-gray-400">{label} </span>
      <span>{value}</span>
    </div>
  ) : null;
};
