"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  className?: string;
}

export const InlineCode: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <code className="bg-muted/70 text-primary rounded px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  );
};

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative my-2 rounded-md overflow-hidden", className)}>
      <div className="absolute right-2 top-2">
        <button
          onClick={handleCopy}
          className="rounded bg-muted/80 p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="bg-muted/20 p-4 rounded-md font-mono text-sm overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
