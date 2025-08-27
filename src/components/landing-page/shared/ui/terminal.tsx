"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Circle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Command = {
  text: string;
  tooltip?: string;
  output?: React.ReactNode; // Each command can have its own output
};

export interface TerminalProps {
  commands: Command | Command[];
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ commands, className }) => {
  // Track which commands have been copied
  const [copiedIndices, setCopiedIndices] = React.useState<
    Record<number, boolean>
  >({});

  // Normalize to array of commands
  const commandsArray = Array.isArray(commands) ? commands : [commands];

  const handleCopy = (commandText: string, index: number) => {
    copyToClipboard(commandText, "Terminal command");
    setCopiedIndices((prev) => ({
      ...prev,
      [index]: true,
    }));

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedIndices((prev) => ({
        ...prev,
        [index]: false,
      }));
    }, 2000);
  };

  const CommandLine = ({
    command,
    index,
  }: {
    command: Command;
    index: number;
  }) => {
    const isCopied = copiedIndices[index];

    // If there's a tooltip, wrap the entire command line with it
    const commandLine = (
      <div className="relative mb-0 flex cursor-pointer items-center justify-between px-0 py-0.5">
        <div className="flex-grow overflow-x-auto whitespace-nowrap">
          <span className="text-emerald-400">$ </span>
          <span>{command.text}</span>
        </div>
        <div className="ml-4 flex items-center">
          <div className="text-muted-foreground hover:text-foreground opacity-0 transition-colors group-hover:opacity-100">
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>
    );

    // Return with or without tooltip wrapper
    return command.tooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>{commandLine}</TooltipTrigger>
        <TooltipContent>
          <p>{command.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      commandLine
    );
  };

  return (
    <Card
      className={cn(
        "h-auto flex-1 overflow-auto bg-zinc-900 font-mono leading-relaxed shadow-md",
        className,
      )}
    >
      {/* Terminal window controls */}
      <div className="flex items-center border-b border-zinc-800 px-4 py-2">
        <div className="flex gap-2">
          <Circle className="h-3 w-3 fill-red-500 text-red-500" />
          <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
        </div>
      </div>

      {/* Terminal content */}
      <div className="px-4 py-3 text-zinc-300">
        {/* Commands with individual outputs */}
        {commandsArray.map((command, index) => (
          <div
            key={`cmd-group-${index}`}
            className={`group relative -mx-2 rounded px-2 transition-colors hover:bg-yellow-100/10 ${index < commandsArray.length - 1 ? "mb-3" : "mb-1"}`}
            onClick={() => handleCopy(command.text, index)}
          >
            {/* Command line */}
            <CommandLine command={command} index={index} />

            {/* Individual command output if available - aligned with the $ sign */}
            {command.output && (
              <div className="mt-1 text-zinc-500">{command.output}</div>
            )}
          </div>
        ))}

        {/* Each command has its own output now */}
      </div>
    </Card>
  );
};

export default Terminal;
