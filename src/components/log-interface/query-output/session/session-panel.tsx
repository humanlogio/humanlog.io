import { formatDuration, formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { Loader, Share, UnfoldHorizontal, UnfoldVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragHandle } from "@/components/sortable/sortable-item";
import { Button } from "@/components/ui/button";

import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NoLogsView } from "@/components/log-interface/views/no-logs-view";
import { twJoin } from "tailwind-merge";
import { usePathname, useSearchParams } from "next/navigation";
import { decodeUint8Array } from "@/lib/utils/decode";
import { useRouter } from "next/navigation";
import { Val } from "api/js/types/v1/types_pb";
import { Data, Logs } from "api/js/types/v1/data_pb";
import { ShareQuery } from "@/components/log-interface/share-query";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { useAllEnvironments } from "@/context/list-environments";
import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { newLogsData } from "@/lib/utils/dataShapeFactories";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { useInView } from "react-intersection-observer";
import { LogLine } from "@/components/log-interface/query-output/session/log-line";
import { ulidToString } from "@/lib/utils/id-factories";

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

  const [sectionBreak, setSectionBreak] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [selectedLines, setSelectedLines] = useState<string | null>(null);
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const handleClickLine = useCallback(
    (line: string) => {
      const params = new URLSearchParams(searchParams);

      if (selectedLines === line) {
        params.delete("line");
      } else {
        params.set("line", line);
      }

      router.push(`?${params}`, { scroll: false });
    },
    [selectedLines, searchParams, router],
  );

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
        return valueValue.items.map((item) => formattedValue(item)).join(", ");
      case "null":
        return "null";
      default:
        return valueValue?.toString() || "";
    }
  }, []);

  const onClickShare = useCallback(() => {
    const data = newLogsData(new Logs({ logs }));
    setSharedData(data);
  }, [logs]);

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
                <LogLine
                  key={`${i}-${ulidToString(log.ulid)}`}
                  log={log}
                  index={i}
                  selectedLines={selectedLines}
                  pretty={pretty}
                  sectionBreak={sectionBreak}
                  isDark={isDark}
                  themes={themes}
                  localhostConfig={localhostConfig}
                  onClickLine={handleClickLine}
                />
              );
            })
          ) : (
            <NoLogsView />
          )}
          {hasNextPage && <div ref={targetRef} className="h-4" />}
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;
