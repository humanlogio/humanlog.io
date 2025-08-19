"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  copyText?: string;
}

export default function CodeBlock({
  code,
  language,
  copyText = "Code",
}: CodeBlockProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code, copyText);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <pre className="bg-muted/20 border-border overflow-x-auto rounded-md border p-4 font-mono text-sm">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="relative"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <SyntaxHighlighter
        language={language || "text"}
        style={theme === "light" ? vs : vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
        codeTagProps={{
          style: {
            fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
      {isHovered && (
        <button
          onClick={handleCopy}
          className="hover:border-border absolute top-4 right-3"
          title="Copy code"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="text-muted-foreground hover:text-foreground h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
