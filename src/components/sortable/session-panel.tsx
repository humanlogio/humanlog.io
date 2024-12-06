import { Loader, Search, Share } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DragHandle } from "@/components/sortable/sortable-item";
import { LogEventGroup } from "@/components/sortable/session-container";
import { useDebouncer } from "@/lib/utils/useDebouncer";

type SessionPanelProps = {
  logEventGroup: LogEventGroup | undefined;
};

const PAGE_SIZE = 100;
const OVERLAP = 50;
const EDGE_SENSITIVITY = 30;

const SessionPanel = ({ logEventGroup }: SessionPanelProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [blockRetrigger, setBlocker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="flex flex-grow flex-col overflow-x-auto bg-gradient-to-r from-slate-300 from-10% via-slate-200 via-10% to-slate-200 to-100% text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
      >
        {currentLogs?.map((log, index) => (
          <div
            key={log.id ?? index}
            className="group flex flex-row items-start hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
          >
            <div className="min-w-[10%] cursor-pointer p-2">
              <div className="hidden group-hover:inline-block">
                <Share size={12} />
              </div>
              <code className="block truncate text-slate-500 group-hover:hidden">
                {log.id ?? index + OVERLAP * currentPage}
              </code>
            </div>

            <div className="flex w-full flex-shrink flex-row gap-4 px-4 py-2">
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

              <div className="flex flex-col">
                <code>
                  {log.structured?.msg || (
                    <span className="text-slate-400">[no message]</span>
                  )}
                </code>

                <div className="flex flex-wrap gap-x-4">
                  {log.structured?.kvs.map((kv) => (
                    <code key={`${log.id ?? index}-${kv.key}`}>
                      <span className="text-green-700 dark:text-green-400">
                        {kv.key}
                      </span>
                      =
                      <span className="text-red-600 dark:text-red-400">
                        {kv.value}
                      </span>
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionPanel;
