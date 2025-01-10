import { Loader, Search, Share } from "lucide-react";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { DragHandle } from "@/components/sortable/sortable-item";
import {
  LogEvent,
  LogEventGroup,
} from "@/components/sortable/session-container";
import { useDebouncer } from "@/lib/utils/useDebouncer";
import { Val } from "api/js/types/v1/types_pb";
import { Duration, Timestamp } from "@bufbuild/protobuf";
import dayjs from "dayjs";
import { Panel, PanelGroup } from "react-resizable-panels";
import { ResizableHandle } from "@/components/ui/resizable";

type SessionPanelProps = {
  logEventGroup: LogEventGroup | undefined;
};

const PAGE_SIZE = 100;
const OVERLAP = 50;
const EDGE_SENSITIVITY = 30;

const SessionPanel = ({ logEventGroup }: SessionPanelProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [blockRetrigger, setBlocker] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const metaColumnRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(
    ((logEventGroup?.logs.length || 0) - OVERLAP) / (PAGE_SIZE - OVERLAP),
  );

  const currentLogs = logEventGroup?.logs.slice(
    currentPage * (PAGE_SIZE - OVERLAP),
    currentPage * (PAGE_SIZE - OVERLAP) + PAGE_SIZE,
  );

  const resetScroll = useDebouncer(
    (callback: () => void) => {
      setBlocker(false);
      if (containerRef.current) {
        containerRef.current.scrollTop =
          (containerRef.current.scrollHeight -
            containerRef.current.clientHeight) /
          2;
      }
      callback();
    },
    [],
    100,
  );

  const updateContentHeight = useDebouncer(
    (height: number) => setContentHeight(height),
    [],
    100,
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    if (blockRetrigger) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    if (
      scrollTop + clientHeight * 2 >= scrollHeight - EDGE_SENSITIVITY &&
      currentPage < totalPages - 1
    ) {
      setBlocker(true);
      resetScroll(() => setCurrentPage((prevPage) => prevPage + 1));
      return;
    }

    if (scrollTop <= EDGE_SENSITIVITY + clientHeight && currentPage > 0) {
      setBlocker(true);
      resetScroll(() => setCurrentPage((prevPage) => prevPage - 1));
    }
  }, [blockRetrigger, currentPage, resetScroll, totalPages]);

  const formatTimestamp = (log: LogEvent) => {
    const timestamp = log.structured?.timestamp ?? log.parsedAt;
    const milliseconds =
      Number(timestamp?.seconds) * 1000 +
      (timestamp?.nanos ? timestamp?.nanos / 1e6 : 0);
    return dayjs(milliseconds).toISOString();
  };

  useEffect(() => {
    const updateHeight = () => {
      if (metaColumnRef.current) {
        updateContentHeight(metaColumnRef.current.scrollHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (metaColumnRef.current) {
      resizeObserver.observe(metaColumnRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentPage, updateContentHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentPage, totalPages, handleScroll]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-base border-2 border-border">
      <div className="flex flex-none flex-row items-center justify-between bg-slate-900 px-4 py-2 dark:bg-slate-800">
        <div className="flex w-1/3 justify-start">
          <h4 className="flex flex-row items-center gap-3 truncate font-bold text-white">
            Session {logEventGroup?.sessionId.toString() ?? "#"}
            {blockRetrigger ? (
              <div className="contents" title="Fetching more log data...">
                <Loader className="animate-spin"></Loader>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              ""
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
        className="flex flex-grow overflow-y-auto bg-gradient-to-r from-slate-300 via-slate-200 via-10% to-slate-200 text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
      >
        <PanelGroup
          direction="horizontal"
          className="group h-full min-w-0 flex-1 !overflow-y-auto"
        >
          <div className="flex min-w-0 flex-1">
            <div ref={metaColumnRef} className="flex flex-none flex-col">
              {currentLogs?.map((log, index) => (
                <div
                  key={`${log.id ?? index}-meta`}
                  className="flex gap-2 px-4 py-2"
                >
                  <div className="flex-none">
                    <code>{formatTimestamp(log)}</code>
                  </div>

                  <div className="flex-none">
                    <code>
                      {log.structured?.lvl ? (
                        <span
                          className={
                            log.structured.lvl === "ERROR"
                              ? "text-red-600 dark:text-red-500"
                              : log.structured.lvl === "WARN"
                                ? "text-yellow-600 dark:text-yellow-500"
                                : log.structured.lvl === "INFO"
                                  ? "text-blue-600 dark:text-blue-500"
                                  : "text-slate-600 dark:text-slate-500"
                          }
                        >
                          [{log.structured.lvl}]
                        </span>
                      ) : (
                        <span className="text-slate-400">[empty]</span>
                      )}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            <Panel defaultSize={40} style={{ height: `${contentHeight}px` }}>
              <div className="flex w-full flex-col overflow-x-auto scrollbar-hide">
                {currentLogs?.map((log, index) => (
                  <div
                    key={`${log.id ?? index}-msg`}
                    className="h-[37px] hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
                  >
                    <div className="h-full px-4 py-2">
                      {log.structured ? (
                        <div className="h-full scrollbar-hide">
                          <code className="whitespace-nowrap">
                            {`${log.structured?.msg}` || (
                              <span className="text-slate-400">no message</span>
                            )}
                          </code>
                        </div>
                      ) : (
                        <code>
                          {log.raw || (
                            <span className="text-slate-400">no message</span>
                          )}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <ResizableHandle
              className="my-auto w-[0.1px] rounded-full bg-slate-700 opacity-0 group-hover:opacity-50"
              style={{ height: `${contentHeight}px` }}
            />

            <Panel style={{ height: `${contentHeight}px` }}>
              <div className="flex w-full flex-col overflow-x-auto scrollbar-hide">
                {currentLogs?.map((log, index) => (
                  <div
                    key={`${log.id ?? index}-kvs`}
                    className="h-[37px] hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
                  >
                    <div className="h-full px-4 py-2">
                      {log.structured && (
                        <code className="flex items-center gap-2 whitespace-nowrap">
                          {log.structured?.kvs.map((kv, kvIndex) => (
                            <span
                              key={`${log.id ?? index}-${kv.key}`}
                              className="flex-none"
                            >
                              <span className="text-green-700 dark:text-green-400">
                                {kv.key}
                              </span>
                              ={valueToJSX(kv.value)}
                              {kvIndex <
                                (log.structured?.kvs.length || 0) - 1 && ""}
                            </span>
                          ))}
                        </code>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </PanelGroup>
      </div>
    </div>
  );
};

const valueToJSX = (val: Val | undefined): ReactNode => {
  if (!val) {
    return <>null</>;
  }
  switch (val.kind.case) {
    case "str":
      return (
        <span className="text-red-600 dark:text-red-400">{val.kind.value}</span>
      );
    case "f64":
      return (
        <span className="text-red-600 dark:text-red-400">{val.kind.value}</span>
      );
    case "i64":
      return (
        <span className="text-red-600 dark:text-red-400">{val.kind.value}</span>
      );
    case "bool":
      return (
        <span className="text-red-600 dark:text-red-400">{val.kind.value}</span>
      );
    case "arr":
      return (
        <span className="text-red-600 dark:text-red-400">
          {JSON.stringify(val.kind.value)}
        </span>
      );
    case "obj":
      return (
        <span className="text-red-600 dark:text-red-400">
          {JSON.stringify(val.kind.value)}
        </span>
      );
    case "ts":
      return (
        <span className="text-red-600 dark:text-red-400">
          {val.kind.value.toDate().toISOString()}
        </span>
      );
    case "dur":
      return (
        <span className="text-red-600 dark:text-red-400">
          {durationToString(val.kind.value)}
        </span>
      );
  }
  return (
    <span className="text-red-600 dark:text-red-400">
      buggy UI is buggy: {val.kind.value}
    </span>
  );
};

const durationToString = (dur: Duration): string => {
  if (dur.seconds === BigInt(0)) {
    // sub-second duration
    if (dur.nanos > 1e6) {
      return wholeOrSingleDecimal(dur.nanos, 1e6) + "ms";
    } else if (dur.nanos > 1e3) {
      return wholeOrSingleDecimal(dur.nanos, 1e3) + "µs";
    } else {
      return dur.nanos + "ns";
    }
  }
  if (dur.seconds < 10) {
    if (dur.nanos > 0) {
      // note that "1s == 1e9ns" and thus "0.1s == 1e8ns"
      const decisecond = wholeOrSingleDecimal(dur.nanos, 1e8);
      return Number(dur.seconds) + "." + decisecond + "s";
    }
    return Number(dur.seconds) + "s";
  }
  if (dur.seconds < 120) {
    return Number(dur.seconds) + "s";
  }
  if (dur.seconds < 60 * 60) {
    return wholeOrSingleDecimal(Number(dur.seconds), 60) + "m";
  }
  if (dur.seconds < 24 * 60 * 60) {
    return wholeOrSingleDecimal(Number(dur.seconds), 60 * 60) + "m";
  }
  return dur.toJsonString();
};

const wholeOrSingleDecimal = (
  num: number,
  orderOfMagnitude: number,
): number => {
  if (num % orderOfMagnitude === 0) {
    // wholly divisible by millisecond
    return num / orderOfMagnitude;
  }
  // scale up and down to keep 1 decimal
  return Math.round((10 * num) / orderOfMagnitude) / 10;
};

export default SessionPanel;
