import {
  formatTimestamp,
  getUnixTimestamp,
  useInfiniteQuery,
} from "@/lib/utils";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { Loader, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragHandle } from "@/components/sortable/sortable-item";
import { Button } from "@/components/ui/button";
import { Timestamp } from "@bufbuild/protobuf";
import { LocalhostConfig } from "api/js/types/v1/localhost_config_pb";
import { useTheme } from "next-themes";
import { useThemeColors } from "@/lib/utils/useThemeColors";
import { useApiClients } from "@/context/api-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewSessionPanelProps {
  query: LogQuery | undefined;
}

const NewSessionPanel = ({ query }: NewSessionPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { apiClients } = useApiClients();

  const { targetRef, isFetching, fetchNext, fetchData, next } =
    useInfiniteQuery(query);

  // state
  const [logs, setLogs] = useState<IngestedLogEvent[]>();
  const [config, setConfig] = useState<LocalhostConfig>();
  const { getColor, getLevelColor } = useThemeColors(
    isDark,
    config?.formatter?.themes,
  );

  const getConfig = useCallback(async () => {
    const res = await apiClients?.localhost.getConfig({});
    setConfig(res?.config);
  }, []);

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
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

  return (
    <div className="flex h-[500px] w-full flex-col rounded-base border-2 border-border">
      <div className="flex flex-none flex-row items-center justify-between bg-slate-900 px-4 py-2 dark:bg-slate-800">
        <div className="flex w-1/3 justify-start">
          <h4 className="flex flex-row items-center gap-3 truncate font-bold text-white">
            {isFetching && (
              <div className="contents" title="Fetching more log data...">
                <Loader className="animate-spin"></Loader>
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </h4>
        </div>
        <div className="flex w-1/3 justify-center">
          <DragHandle />
        </div>
        <div className="flex w-1/3 justify-end">
          <Button size="icon" className="mb-1 h-8">
            <Search size={14} />
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex flex-grow overflow-auto bg-gradient-to-r from-slate-300 via-slate-200 via-10% to-slate-200 text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
      >
        <div className="border-separate p-1">
          {logs &&
            logs.map((log, i) => {
              return (
                <div
                  className="flex gap-1 whitespace-nowrap py-[1px]"
                  key={`${i + 1}-${log.machineId}-${log.sessionId}-${log.eventId}`}
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
                            value={log.machineId}
                          />

                          <KeyValueRow
                            label="Session Id"
                            value={log.sessionId}
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
                                  <span style={{ color: getColor("value") }}>
                                    {kv.value?.kind.value?.toString()}
                                  </span>
                                </code>
                              </TooltipTrigger>
                              <TooltipContent className="bg-transparent bg-white dark:bg-secondaryBlack">
                                <KeyValueRow label="Key" value={kv.key} />
                                <KeyValueRow
                                  label="Type"
                                  value={kv.value?.kind.case?.toString() ?? ""}
                                />
                                <KeyValueRow
                                  label="Value"
                                  value={kv.value?.kind.value?.toString() ?? ""}
                                />
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      );
                    })}
                  </code>
                </div>
              );
            })}

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
