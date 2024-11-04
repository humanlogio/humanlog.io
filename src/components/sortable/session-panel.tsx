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
        {logEventGroup?.logs.map((log) => {
          return (
            <div
              key={log.id}
              className="group flex flex-row items-start hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
            >
              <div className="w-[10%] cursor-pointer p-2">
                <div className="hidden group-hover:inline-block">
                  <Share size={12} />
                </div>
                <code className="block truncate text-slate-500 group-hover:hidden">
                  {log.id}
                </code>
              </div>

              <div className="flex w-full flex-1 flex-col">
                <div className="flex w-full flex-row gap-4 px-4 py-2">
                  {log.structured?.lvl && (
                    <code>
                      [
                      <span className="text-red-500">{log.structured.lvl}</span>
                      ]
                    </code>
                  )}

                  <code>
                    {log.structured?.msg ?? (
                      <span className="text-slate-400">[no message]</span>
                    )}
                  </code>
                </div>

                {log.structured?.kvs.map((kv) => (
                  <code className="pl-16">
                    <span className="text-green-400">{kv.key}</span>=
                    <span className="text-red-400">{kv.value}</span>
                  </code>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionPanel;
