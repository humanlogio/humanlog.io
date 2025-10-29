import { formatDuration, formatTimestamp } from "@/lib/utils/format-timestamp";
import {
  Loader,
  Loader2,
  Share,
  UnfoldHorizontal,
  UnfoldVertical,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragHandle } from "@/components/sortable/sortable-item";
import { Button } from "@/components/ui/button";

import {
  FormatConfig_Themes,
  LocalhostConfig,
} from "api/js/types/v1/localhost_config_pb";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmptyDataView } from "@/components/log-interface/views/empty-data-view";
import { twJoin } from "tailwind-merge";
import { usePathname, useSearchParams } from "next/navigation";
import { decodeUint8Array } from "@/lib/utils/decode";
import { useRouter } from "next/navigation";
import { Val } from "api/js/types/v1/types_pb";
import { Data, LogsSchema } from "api/js/types/v1/data_pb";
import { ShareQuery } from "@/components/log-interface/share-query";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { StreamResponse } from "api/js/svc/query/v1/service_pb";
import { newLogsData } from "@/lib/utils/data-shape-factories";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { LogLine } from "@/components/log-interface/query-output/session/log-line";
import { create } from "@bufbuild/protobuf";
import { Virtuoso } from "react-virtuoso";
import { useQuery } from "@connectrpc/connect-query";
import { getConfig } from "api/js/svc/localhost/v1/service-LocalhostService_connectquery";
import { defaultConfig } from "@/services/localhostService";

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

  const { theme } = useTheme();

  const pretty = searchParams.get("pretty") !== "false";

  const [sectionBreak, setSectionBreak] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [selectedLines, setSelectedLines] = useState<string | null>(null);
  const [sharedData, setSharedData] = useState<Data | null>(null);

  const [localhostConfig, setLocalhostConfig] = useState<LocalhostConfig>();

  const {
    data: localhostConfigData,
    isLoading: isLoadingLocalhostConfig,
    isError: isErrorLocalhostConfig,
  } = useQuery(getConfig);

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

  const onClickShare = useCallback(() => {
    const data = newLogsData(create(LogsSchema, { logs }));
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
    if (isErrorLocalhostConfig) {
      setLocalhostConfig(defaultConfig);
      return;
    }
    setLocalhostConfig(localhostConfigData?.config);
  }, [localhostConfigData, isErrorLocalhostConfig]);

  const loadMore = useCallback(() => {
    hasNextPage && fetchNextPage && fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

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
      className={`flex h-full w-full flex-col rounded-md border ${isDark ? "bg-black" : "bg-white"}`}
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
      </div>

      <div
        className={twJoin(
          "flex min-h-0 flex-1 flex-col overflow-hidden text-sm",
          isDark && "bg-black",
        )}
      >
        {logs && logs.length > 0 && !isLoadingLocalhostConfig ? (
          <Virtuoso
            style={{ height: "100%" }}
            totalCount={logs?.length}
            endReached={loadMore}
            itemContent={(i) => (
              <LogLine
                index={i}
                log={logs[i]}
                selectedLines={selectedLines}
                pretty={pretty}
                sectionBreak={sectionBreak}
                isDark={isDark}
                themes={themes}
                localhostConfig={localhostConfig}
                onClickLine={handleClickLine}
              />
            )}
          />
        ) : isFetching || isLoadingLocalhostConfig ? (
          <div className="flex h-full flex-1 items-center justify-center">
            <Loader2 className="mb-2 animate-spin dark:text-white" />
          </div>
        ) : (
          <EmptyDataView dataType="logs" showBackground={false} />
        )}
      </div>
    </div>
  );
};

export default SessionPanel;
