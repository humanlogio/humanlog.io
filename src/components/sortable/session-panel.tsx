import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DragHandle } from "@/components/sortable/sortable-item";

const SessionPanel = ({ logEventGroup }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-base border-2 border-border bg-secondary-900">
      <div className="flex flex-none flex-row items-center justify-between bg-secondary-100 px-4 py-2">
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
      <div className="flex flex-grow flex-col text-sm">
        {logEventGroup?.logs.map((log) => {
          return (
            <div key={log.id} className="flex flex-row items-center">
              <div className="w-[10%] truncate bg-secondary-400 p-2 text-slate-500">
                {log.id}
              </div>
              <div className="w-[90%] p-2 text-white">{log.raw}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionPanel;
