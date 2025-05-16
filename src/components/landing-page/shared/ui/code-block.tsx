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
    <div className={cn("relative my-2 overflow-hidden rounded-md", className)}>
      <div className="absolute top-2 right-2">
        <button
          onClick={handleCopy}
          className="bg-muted/80 text-muted-foreground hover:bg-muted rounded p-1.5 transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre className="bg-muted/20 overflow-x-auto rounded-md p-4 font-mono text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
