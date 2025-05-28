"use client";

import React from "react";
import { Highlight } from "prism-react-renderer";
import { useTheme } from "next-themes";

// Define custom themes
const darkTheme = {
  plain: {
    color: "#f8f8f2",
    backgroundColor: "#282a36",
  },
  styles: [
    {
      types: ["prolog", "constant", "builtin"],
      style: {
        color: "#ff79c6",
      },
    },
    {
      types: ["inserted", "function"],
      style: {
        color: "#50fa7b",
      },
    },
    {
      types: ["deleted"],
      style: {
        color: "#ff5555",
      },
    },
    {
      types: ["changed"],
      style: {
        color: "#ffb86c",
      },
    },
    {
      types: ["punctuation", "symbol"],
      style: {
        color: "#f8f8f2",
      },
    },
    {
      types: ["string", "char", "tag", "selector"],
      style: {
        color: "#8be9fd",
      },
    },
    {
      types: ["keyword", "variable"],
      style: {
        color: "#ff79c6",
        fontStyle: "italic",
      },
    },
    {
      types: ["comment"],
      style: {
        color: "#6272a4",
      },
    },
    {
      types: ["attr-name"],
      style: {
        color: "#50fa7b",
      },
    },
  ],
};

const lightTheme = {
  plain: {
    color: "#24292e",
    backgroundColor: "#f6f8fa",
  },
  styles: [
    {
      types: ["prolog", "constant", "builtin"],
      style: {
        color: "#005cc5",
      },
    },
    {
      types: ["inserted", "function"],
      style: {
        color: "#22863a",
      },
    },
    {
      types: ["deleted"],
      style: {
        color: "#d73a49",
      },
    },
    {
      types: ["changed"],
      style: {
        color: "#e36209",
      },
    },
    {
      types: ["punctuation", "symbol"],
      style: {
        color: "#24292e",
      },
    },
    {
      types: ["string", "char", "tag", "selector"],
      style: {
        color: "#032f62",
      },
    },
    {
      types: ["keyword", "variable"],
      style: {
        color: "#d73a49",
      },
    },
    {
      types: ["comment"],
      style: {
        color: "#6a737d",
      },
    },
    {
      types: ["attr-name"],
      style: {
        color: "#6f42c1",
      },
    },
  ],
};

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

export default function CodeBlock({
  code,
  language,
  className = "",
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  // If no language is specified, default to text
  const lang = language || "text";

  return (
    <Highlight theme={theme} code={code} language={lang as any}>
      {({ className: classes, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${classes} ${className} overflow-auto rounded-md p-4`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
