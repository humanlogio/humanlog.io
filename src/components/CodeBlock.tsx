"use client";

import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
  );
}
