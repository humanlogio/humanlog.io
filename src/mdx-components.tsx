import type { MDXComponents } from "mdx/types";
import React from "react";
import MermaidRenderer from "@/components/MermaidRenderer";
import CodeBlock from "@/components/CodeBlock";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Add Mermaid component for code blocks with language "mermaid"
    pre: ({ children, ...props }) => {
      const childNode = React.Children.only(children) as React.ReactElement;
      const codeContent = childNode.props?.children;
      const language =
        childNode.props?.className?.replace(/language-|lang-/, "") || "";

      // Check if this is a mermaid code block
      if (
        childNode.props?.className?.includes("language-mermaid") ||
        childNode.props?.className?.includes("lang-mermaid")
      ) {
        return <MermaidRenderer code={childNode.props.children} />;
      }

      // Check if this is a code block with a language and apply syntax highlighting
      if (childNode.type === "code" && language) {
        return (
          <CodeBlock
            code={codeContent}
            language={language}
            className="my-4 w-full"
          />
        );
      }

      // Otherwise, render the pre as normal
      return <pre {...props}>{children}</pre>;
    },

    ...components,
  };
}
