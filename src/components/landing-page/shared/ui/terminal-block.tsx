"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShellCommand {
  bash: string;
  fish: string;
}

export interface TerminalBlockProps {
  commands: ShellCommand | ShellCommand[];
  className?: string;
}

const TerminalBlock: React.FC<TerminalBlockProps> = ({ commands, className }) => {
  const [copied, setCopied] = useState(false);
  const [activeShell, setActiveShell] = useState<"bash" | "fish">("bash");
  
  // Convert single command to array for consistent handling
  const commandsArray = Array.isArray(commands) ? commands : [commands];
  
  const handleCopy = () => {
    const textToCopy = commandsArray.map(cmd => cmd[activeShell]).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative my-2 rounded-md overflow-hidden border border-border", className)}>
      <div className="flex items-center justify-between bg-muted/30 px-4 py-2">
        <div className="flex rounded-md bg-muted/50 p-1">
          <button
            onClick={() => setActiveShell("bash")}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              activeShell === "bash" 
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80"
            )}
          >
            Bash
          </button>
          <button
            onClick={() => setActiveShell("fish")}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              activeShell === "fish" 
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80"
            )}
          >
            Fish
          </button>
        </div>
        <button
          onClick={handleCopy}
          className="rounded bg-muted/40 p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      
      <pre className="bg-muted/10 p-4 font-mono text-sm overflow-x-auto border-t border-border">
        <code>
          {commandsArray.map((cmd, i) => (
            <React.Fragment key={`${activeShell}-${i}`}>
              {cmd[activeShell]}
              {i < commandsArray.length - 1 && <br />}
            </React.Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default TerminalBlock;
