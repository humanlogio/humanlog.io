import {
  copyToClipboard,
  formatTimestamp,
  getUnixTimestamp,
  useInfiniteQuery,
} from "@/lib/utils";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { Ellipsis, Link, Loader, Search } from "lucide-react";
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

interface NewSessionPanelProps {
  ids?: { machineId?: string; sessionId?: string };
  query: LogQuery | undefined;
  fakeData?: IngestedLogEvent[];
  darkMode?: boolean;
  themes?: FormatConfig_Themes;
}

const NewSessionPanel = ({
  ids,
  query,
  fakeData,
  darkMode,
  themes,
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
    <div className="flex w-full flex-col rounded-base border-2 border-border">
      <div className="sticky left-0 right-0 top-0 z-10 flex h-11 w-full flex-none flex-row items-center justify-between bg-slate-900 px-4 py-2 dark:bg-slate-800">
        <div className="flex justify-start">
          <h4 className="flex flex-row items-center gap-3 truncate font-bold text-white">
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
          "flex flex-grow bg-gradient-to-r from-slate-300 via-slate-200 via-10% to-slate-200 text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950",
          darkMode && "from-slate-900 via-slate-950 to-slate-950",
        )}
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
                      "bg-slate-400 dark:bg-gray-700",
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
                      "bg-slate-400 dark:bg-gray-700" ? (
                        <div className="z-1 mr-2 flex h-5 w-5 items-center justify-center rounded bg-main shadow-sm">
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

                  {!pretty ? (
                    <div
                      className={twMerge(
                        "flex gap-1 whitespace-nowrap py-[1px]",
                      )}
                    >
                      {decodeUint8Array(log.raw)}
                    </div>
                  ) : (
                    <div
                      className={twMerge(
                        "flex gap-1 whitespace-nowrap py-[1px]",
                      )}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <code
                              style={{
                                color: getColor("time"),
                              }}
                            >
                              {formatTimestamp(
                                (log.structured?.timestamp as Timestamp) ??
                                  log.parsedAt,
                                config?.formatter?.time?.format ?? "",
                              )}
                            </code>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-secondaryBlack">
                            <div>
                              <KeyValueRow
                                label="Machine Id"
                                value={log.machineId.toString()}
                              />
                              <KeyValueRow
                                label="Session Id"
                                value={log.sessionId.toString()}
                              />
                              <KeyValueRow
                                label="Event Id"
                                value={log.eventId.toString()}
                              />
                              <KeyValueRow
                                label="Local"
                                value={formatTimestamp(
                                  (log.structured?.timestamp as Timestamp) ??
                                    log.parsedAt,
                                  "Jan _2 15:04:05.000",
                                )}
                              />
                              <KeyValueRow
                                label="UTC"
                                value={formatTimestamp(
                                  (log.structured?.timestamp as Timestamp) ??
                                    log.parsedAt,
                                  "Jan _2 15:04:05.000",
                                  true,
                                )}
                              />
                              <KeyValueRow
                                label="Timestamp"
                                value={getUnixTimestamp(
                                  (log.structured?.timestamp as Timestamp) ??
                                    log.parsedAt,
                                ).toString()}
                              />
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <code>
                        <span className="text-gray-400">
                          |
                          <span
                            style={{
                              color: getLevelColor(log?.structured?.lvl),
                            }}
                          >
                            {log?.structured?.lvl || "EMPTY"}
                          </span>
                          |
                        </span>
                      </code>

                      <code style={{ color: getColor("msg") }}>
                        {log.structured?.msg || "no message"}{" "}
                        {log.structured?.kvs.map((kv, kvIndex) => {
                          return (
                            <span
                              key={`${log.sessionId}-${log.eventId}-${kvIndex}`}
                              className="mr-1 flex-none"
                            >
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <code>
                                      <span style={{ color: getColor("key") }}>
                                        {kv.key}=
                                      </span>
                                      <span
                                        style={{ color: getColor("value") }}
                                      >
                                        {kv.value?.kind.value?.toString()}
                                      </span>
                                    </code>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-transparent bg-white dark:bg-secondaryBlack">
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
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </span>
                          );
                        })}
                      </code>
                    </div>
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
    </div>
  );
};

export default NewSessionPanel;

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
