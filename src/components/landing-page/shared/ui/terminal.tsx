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
};

export interface TerminalProps {
  commands: Command | Command[];
  output?: React.ReactNode;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({
  commands,
  output,
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
    
    return (
      <div 
        className="group flex items-center justify-between transition-colors rounded hover:bg-yellow-100/10 px-2 py-1 -ml-2 mb-1 relative cursor-pointer"
        onClick={() => handleCopy(command.text, index)}
      >
        <div className="flex-grow overflow-x-auto whitespace-nowrap">
          <span className="text-emerald-400">$ </span>
          <span>{command.text}</span>
        </div>
        <div className="ml-4 flex items-center">
          {command.tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground hover:text-foreground transition-colors">
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{command.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="text-muted-foreground hover:text-foreground transition-colors">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </div>
          )}
        </div>
      </div>
    );
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
        {/* Commands */}
        <div className="mb-2">
          {commandsArray.map((command, index) => (
            <CommandLine key={`cmd-${index}`} command={command} index={index} />
          ))}
        </div>

        {/* Output (if any) */}
        {output && (
          <div className="text-zinc-500 mt-2">
            {output}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Terminal;
