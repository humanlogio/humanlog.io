"use client";

import { useTheme } from "next-themes";
import Editor, { EditorProps, OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useRef } from "react";

interface MonacoEditorProps extends Omit<EditorProps, "theme"> {
  width?: number | string;
  height?: number;
  value: string;
  onChange?: (value: string | undefined) => void;
  onMount?: OnMount;
  options?: editor.IStandaloneEditorConstructionOptions;
}

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
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
  height = 100,
  value,
  onChange,
  onMount,
  options,
  ...props
}: MonacoEditorProps) => {
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.getModel()?.updateOptions({ tabSize: 2 });
    editor.updateOptions(defaultOptions);

    onMount?.(editor, monaco);
  };

  return (
    <Editor
      width={width}
      height={height}
      defaultLanguage="sql"
      theme={theme === "dark" ? "vs-dark" : "vs-light"}
      defaultValue="-- let's write some broken query 😈"
      value={value}
      onChange={onChange}
      options={mergedOptions}
      onMount={handleEditorDidMount}
      loading={<div>Loading Editor...</div>}
      {...props}
    />
  );
};

export default MonacoEditor;
