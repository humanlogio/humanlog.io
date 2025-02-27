"use client";

import { useTheme } from "next-themes";
import Editor, { EditorProps, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useRef, useEffect, useCallback } from "react";

interface MonacoEditorProps extends Omit<EditorProps, "theme"> {
  width?: number | string;
  height?: number;
  value: string;
  onChange?: (value: string | undefined) => void;
  onMount?: OnMount;
  options?: editor.IStandaloneEditorConstructionOptions;
}

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: false,
  minimap: { enabled: false },
  lineNumbers: "off",
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  renderLineHighlight: "none",
  scrollbar: {
    vertical: "auto",
    horizontal: "auto",
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false,
  },
};

const MonacoEditor = ({
  width = "100%",
  height = 80,
  value,
  onChange,
  onMount,
  options,
  ...props
}: MonacoEditorProps) => {
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const handleResize = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.getModel()?.updateOptions({ tabSize: 2 });
    editor.updateOptions(defaultOptions);

    // initialize the layout
    editor.layout();

    // set the theme for dark mode
    monaco.editor.defineTheme("my-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0F172A",
      },
    });

    onMount?.(editor, monaco);
  };

  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;

    const isDarkMode =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    console.log(
      "matches",
      window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    monacoRef.current.editor.setTheme(isDarkMode ? "my-dark" : "vs-light");
  }, [theme]);

  // detect resizing event
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <Editor
      width={width}
      height={height}
      defaultLanguage="sql"
      theme={theme === "dark" ? "my-dark" : "vs-light"}
      defaultValue="-- let's write some broken query 😈"
      value={value}
      onChange={onChange}
      options={mergedOptions}
      onMount={handleEditorDidMount}
      loading={<>Loading Editor...</>}
      {...props}
    />
  );
};

export default MonacoEditor;
