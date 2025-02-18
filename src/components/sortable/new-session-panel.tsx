import { formatTimestamp, useInfiniteQuery } from "@/lib/utils";
import { useDebouncer } from "@/lib/utils/useDebouncer";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";
import { LogQuery } from "api/js/types/v1/logquery_pb";
import { Loader, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { DragHandle } from "@/components/sortable/sortable-item";
import { Button } from "@/components/ui/button";
import { Timestamp } from "@bufbuild/protobuf";
import { ResizableHandle } from "@/components/ui/resizable";
import { valueToJSX } from "@/lib/utils/valueFormatters";

interface NewSessionPanelProps {
  query: LogQuery | undefined;
}

const NewSessionPanel = ({ query }: NewSessionPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const metaColumnRef = useRef<HTMLDivElement>(null);

  const { targetRef, isFetching, fetchNext, fetchData, next } =
    useInfiniteQuery(query);

  // state
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [logs, setLogs] = useState<IngestedLogEvent[]>();

  const updateContentHeight = useDebouncer(
    (height: number) => setContentHeight(height),
    [],
    100,
  );

  useEffect(() => {
    fetchData(({ value: shapeValue }) => {
      setLogs(shapeValue.events);
    });
  }, []);

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
  }, [updateContentHeight, metaColumnRef.current, next]);

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
        className="flex flex-grow overflow-y-auto bg-gradient-to-r from-slate-300 via-slate-200 via-10% to-slate-200 text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950"
      >
        {logs && (
          <PanelGroup
            direction="horizontal"
            className="group h-full min-w-0 flex-1 !overflow-y-auto"
          >
            <div className="flex min-w-0 flex-1">
              <div className="flex flex-none flex-col">
                {logs.map((log, index) => {
                  return (
                    <div
                      key={`${log.machineId}-${log.sessionId}-${log.eventId}-${index}`}
                      className="flex gap-2 px-2 py-2"
                    >
                      [{log.machineId}]
                    </div>
                  );
                })}
                <div ref={targetRef}>-</div>
              </div>
              <div className="flex flex-none flex-col">
                {logs.map((log, index) => {
                  return (
                    <div
                      key={`${log.machineId}-${log.sessionId}-${log.eventId}-${index}`}
                      className="flex gap-2 px-2 py-2"
                    >
                      [{log.sessionId}]
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-none flex-col">
                {logs.map((log, index) => {
                  return (
                    <div
                      key={`${log.machineId}-${log.sessionId}-${log.eventId}-${index}`}
                      className="flex gap-2 px-2 py-2"
                    >
                      [{log.eventId}]
                    </div>
                  );
                })}
              </div>
              <div ref={metaColumnRef} className="flex flex-none flex-col">
                {logs.map((log, index) => (
                  <div
                    key={`${log.machineId}-${log.sessionId}-${log.eventId}-${index}`}
                    className="flex gap-2 px-4 py-2"
                  >
                    <div className="flex-none">
                      <code>
                        {formatTimestamp(
                          log.structured?.timestamp ??
                            (log.parsedAt as Timestamp),
                        )}
                      </code>
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
                  {logs.map((log, index) => (
                    <div
                      key={`${log.machineId}-${log.sessionId}-${log.eventId}-${index}`}
                      className="hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
                    >
                      <div className="h-full px-4 py-2">
                        {log.structured ? (
                          <div className="h-full scrollbar-hide">
                            <code className="whitespace-nowrap">
                              {`${log.structured.msg}` || (
                                <span className="text-slate-400">
                                  no message
                                </span>
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
                  {logs.map((log, index) => (
                    <div
                      key={`${log.machineId}-${log.sessionId}-${log.eventId}-${index}`}
                      className="h-[37px] hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
                    >
                      <div className="h-full px-4 py-2">
                        {log.structured && (
                          <code className="flex items-center gap-2 whitespace-nowrap">
                            {log.structured?.kvs.map((kv, kvIndex) => (
                              <span key={log.eventId} className="flex-none">
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
        )}
      </div>
    </div>
  );
};

export default NewSessionPanel;
