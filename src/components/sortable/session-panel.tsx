import { Search, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DragHandle } from "@/components/sortable/sortable-item";
import { LogEventGroup } from "@/components/sortable/session-container";

type SessionPanelProps = {
  logEventGroup: LogEventGroup | undefined;
};

const SessionPanel = ({ logEventGroup }: SessionPanelProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-base border-2 border-border">
      <div className="flex flex-none flex-row items-center justify-between bg-slate-900 px-4 py-2 dark:bg-slate-800">
        <div className="flex w-1/3 justify-start">
          <h4 className="truncate font-bold text-white">
            Session {logEventGroup?.sessionId}
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
      <div className="flex flex-grow flex-col overflow-x-auto bg-gradient-to-r from-slate-300 from-10% via-slate-200 via-10% to-slate-200 to-100% text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {logEventGroup?.logs.map((log, index) => (
          <div
            key={log.id ?? index}
            className="group flex flex-row items-start hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
          >
            <div className="w-[10%] cursor-pointer p-2">
              <div className="hidden group-hover:inline-block">
                <Share size={12} />
              </div>
              <code className="block truncate text-slate-500 group-hover:hidden">
                {log.id ?? index}
              </code>
            </div>

            <div className="flex w-full flex-1 flex-row gap-4 px-4 py-2">
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
