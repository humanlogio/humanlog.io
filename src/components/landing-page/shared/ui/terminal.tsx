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

const Terminal: React.FC<TerminalProps> = ({
  commands,
  className,
}) => {
  // Track which commands have been copied
  const [copiedIndices, setCopiedIndices] = React.useState<Record<number, boolean>>({});
  
  // Normalize to array of commands
  const commandsArray = Array.isArray(commands) ? commands : [commands];

  const handleCopy = (commandText: string, index: number) => {
    copyToClipboard(commandText, "Terminal command");
    setCopiedIndices(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedIndices(prev => ({
        ...prev,
        [index]: false
      }));
    }, 2000);
  };

  const CommandLine = ({ command, index }: { command: Command, index: number }) => {
    const isCopied = copiedIndices[index];
    
    // If there's a tooltip, wrap the entire command line with it
    const commandLine = (
      <div 
        className="flex items-center justify-between px-0 py-1 mb-1 relative cursor-pointer"
      >
        <div className="flex-grow overflow-x-auto whitespace-nowrap">
          <span className="text-emerald-400">$ </span>
          <span>{command.text}</span>
        </div>
        <div className="ml-4 flex items-center">
          <div className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </div>
        </div>
      </div>
    );
    
    // Return with or without tooltip wrapper
    return command.tooltip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {commandLine}
          </TooltipTrigger>
          <TooltipContent>
            <p>{command.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : commandLine;
  };

  return (
    <Card
      className={cn(
        "h-auto overflow-auto bg-zinc-900 font-mono leading-relaxed shadow-md flex-1",
        className
      )}
    >
      {/* Terminal window controls */}
      <div className="flex items-center px-4 py-2 border-b border-zinc-800">
        <div className="flex gap-2">
          <Circle className="h-3 w-3 fill-red-500 text-red-500" />
          <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          <Circle className="h-3 w-3 fill-green-500 text-green-500" />
        </div>
      </div>

      {/* Terminal content */}
      <div className="text-zinc-300 p-4">
        {/* Commands with individual outputs */}
        {commandsArray.map((command, index) => (
          <div 
            key={`cmd-group-${index}`} 
            className={`group relative rounded hover:bg-yellow-100/10 transition-colors px-2 -mx-2 ${index < commandsArray.length - 1 ? "mb-6" : "mb-2"}`}
            onClick={() => handleCopy(command.text, index)}
          >
            {/* Command line */}
            <CommandLine command={command} index={index} />
            
            {/* Individual command output if available - aligned with the $ sign */}
            {command.output && (
              <div className="text-zinc-500 mt-2">
                {command.output}
              </div>
            )}
          </div>
        ))}

        {/* Each command has its own output now */}
      </div>
    </Card>
  );
};

export default Terminal;
