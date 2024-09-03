import { Search } from "lucide-react";

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
      <div className="flex flex-grow flex-col bg-gradient-to-r from-slate-300 from-10% via-slate-200 via-10% to-slate-200 to-100% text-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {logEventGroup?.logs.map((log) => {
          return (
            <div key={log.id} className="flex flex-row items-center">
              <code className="w-[10%] truncate p-2 text-slate-500">
                {log.id}
              </code>
              <code className="w-[90%] p-2">{log.raw}</code>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionPanel;
