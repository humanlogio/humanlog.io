"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ShellCommand {
  bash: string;
  fish: string;
}

export interface TerminalCommandProps {
  commands: ShellCommand | ShellCommand[];
  className?: string;
}

const TerminalCodeBlock: React.FC<TerminalCommandProps> = ({ commands, className }) => {
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
      <Tabs defaultValue="bash" onValueChange={(value) => setActiveShell(value as "bash" | "fish")}>
        <div className="flex items-center justify-between bg-muted/30 px-4 py-2">
          <TabsList className="bg-transparent">
            <TabsTrigger value="bash" className="data-[state=active]:bg-background">Bash</TabsTrigger>
            <TabsTrigger value="fish" className="data-[state=active]:bg-background">Fish</TabsTrigger>
          </TabsList>
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
        
        <TabsContent value="bash" className="m-0">
          <pre className="bg-muted/10 p-4 font-mono text-sm overflow-x-auto border-t border-border">
            <code>
              {commandsArray.map((cmd, i) => (
                <React.Fragment key={`bash-${i}`}>
                  {cmd.bash}
                  {i < commandsArray.length - 1 && <br />}
                </React.Fragment>
              ))}
            </code>
          </pre>
        </TabsContent>
        
        <TabsContent value="fish" className="m-0">
          <pre className="bg-muted/10 p-4 font-mono text-sm overflow-x-auto border-t border-border">
            <code>
              {commandsArray.map((cmd, i) => (
                <React.Fragment key={`fish-${i}`}>
                  {cmd.fish}
                  {i < commandsArray.length - 1 && <br />}
                </React.Fragment>
              ))}
            </code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TerminalCodeBlock;
