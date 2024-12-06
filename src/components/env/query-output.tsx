"use client";

import { useState } from "react";
import SessionContainer, {
  LogEventGroup,
} from "@/components/sortable/session-container";
import { useFullWidth } from "@/context/full-width-provider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const QueryOutput = ({ sessions }: { sessions: LogEventGroup[] | null }) => {
  const [isPretty, setIsPretty] = useState(true);
  const { isFullWidth } = useFullWidth();

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-grow flex-col gap-4 overflow-y-auto px-4 transition-all duration-300",
        isFullWidth ? "max-w-full" : "max-w-screen-xl",
      )}
    >
      <div className="flex flex-none flex-row items-center gap-2">
        <Label
          htmlFor="pretty"
          className={cn("transition-colors duration-200", {
            "text-slate-500": isPretty,
          })}
        >
          Raw
        </Label>
        <Switch id="pretty" checked={isPretty} onCheckedChange={setIsPretty} />
        <Label
          htmlFor="pretty"
          className={cn("transition-colors duration-200", {
            "text-slate-500": !isPretty,
          })}
        >
          Pretty
        </Label>
      </div>
      <SessionContainer sessions={sessions} />
    </div>
  );
};

export default QueryOutput;
