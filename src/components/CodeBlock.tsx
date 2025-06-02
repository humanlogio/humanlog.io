"use client";

import React from "react";
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
