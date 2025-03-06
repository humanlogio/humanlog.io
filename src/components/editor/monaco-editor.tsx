"use client";

import { useTheme } from "next-themes";
import Editor, { EditorProps, OnMount } from "@monaco-editor/react";
import type {
  CancellationToken,
  editor,
  IRange,
  Position,
} from "monaco-editor";
import { useRef, useEffect, useCallback, useState } from "react";
import { languages } from "monaco-editor/esm/vs/editor/editor.api";
import { LANGUAGE_ID } from "@/components/editor/globals";
import LanguageConfiguration = languages.LanguageConfiguration;
import { humanlogqlLanguageDefinition } from "@/components/editor/monarch";
import { themes } from "@/components/editor/themes";
import { Symbol } from "api/js/types/v1/symbol_pb";
import { useApiClients } from "@/context/api-provider";
import { ConnectError } from "@connectrpc/connect";
import { toast } from "sonner";
import { ListSymbolsResponse_ListItem } from "api/js/svc/query/v1/service_pb";

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
  language: LANGUAGE_ID,
};

const MonacoEditor = ({
  width = "100%",
  height = 150,
  value,
  onChange,
  onMount,
  options,
  ...props
}: MonacoEditorProps) => {
  const { theme } = useTheme();
  const { apiClients } = useApiClients();
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
    monaco.editor.defineTheme("humanlogql-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0F172A",
      },
    });
    monaco.editor.defineTheme("humanlogql-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {},
    });

    monaco.languages.register({
      id: LANGUAGE_ID,
    });
    themes.forEach(({ name, data }) => monaco.editor.defineTheme(name, data));

    monaco.languages.setLanguageConfiguration(
      LANGUAGE_ID,
      languageConfiguration,
    );
    monaco.languages.setMonarchTokensProvider(
      LANGUAGE_ID,
      humanlogqlLanguageDefinition,
    );
    monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
      triggerCharacters: ["[", "|"],
      provideCompletionItems: async (
        model: editor.ITextModel,
        position: Position,
        context: languages.CompletionContext,
        token: CancellationToken,
      ) => {
        let suggestions: languages.CompletionItem[] = [];

        switch (context.triggerKind) {
          case languages.CompletionTriggerKind.Invoke:
            suggestions.push(...defaultColumnsSuggestions(model, position));
            break;

          case languages.CompletionTriggerKind.TriggerCharacter:
            switch (context.triggerCharacter) {
              case "[":
                const getSymbolList = async () => {
                  try {
                    const res = await apiClients?.query.listSymbols({
                      limit: 500,
                    });
                    return res?.items.map((li) => li.symbol!);
                  } catch (error) {
                    throw error;
                  }
                };
                const symbols = await getSymbolList();
                suggestions.push(
                  ...symbolsSuggestions(model, position, symbols || []),
                );
                break;
              case "|":
                suggestions.push(...tableOperatorSuggestions(model, position));
                break;
              default:
                break;
            }
            break;

          default:
            break;
        }

        return {
          suggestions: suggestions,
        };
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

    monacoRef.current.editor.setTheme(
      isDarkMode ? "humanlogql-dark" : "humanlogql-light",
    );
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
      defaultLanguage={LANGUAGE_ID}
      theme={theme === "dark" ? "humanlogql-dark" : "humanlogql-light"}
      defaultValue="// The query language is defined in the docs :)"
      value={value}
      onChange={onChange}
      options={mergedOptions}
      onMount={handleEditorDidMount}
      loading={<>Loading Editor...</>}
      {...props}
    />
  );
};

// largely lifted from https://github.com/Azure/monaco-kusto/tree/master/package/src/syntaxHighlighting
const languageConfiguration: LanguageConfiguration = {
  folding: {
    offSide: false,
    markers: { start: /^\s*[\r\n]/gm, end: /^\s*[\r\n]/gm },
  },
  comments: {
    lineComment: "//",
    blockComment: null,
  },
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "'", close: "'", notIn: ["string", "comment"] },
    { open: '"', close: '"', notIn: ["string", "comment"] },
  ],
  brackets: [
    ["[", "]"],
    ["{", "}"],
    ["(", ")"],
  ],
  colorizedBracketPairs: [],
};

const defaultColumnsSuggestions = (
  model: editor.ITextModel,
  pos: Position,
): languages.CompletionItem[] => {
  const range = {
    startLineNumber: pos.lineNumber,
    startColumn: pos.column,
    endLineNumber: pos.lineNumber,
    endColumn: pos.column,
  };

  const line = model.getLineContent(pos.lineNumber);
  const computeRange = (keyword: string): IRange => {
    // TODO:
    // find the overlap between the suffix of line and the prefix of keyword
    return {
      startLineNumber: pos.lineNumber,
      startColumn: pos.column,
      endLineNumber: pos.lineNumber,
      endColumn: pos.column,
    };
  };

  return [
    {
      label: {
        label: "machine",
        detail: " machine that emitted the log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "machine",
      documentation: "The machine on which a log was recorded.",
      range: computeRange("machine"),
    },
    {
      label: {
        label: "session",
        detail: " session of a log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "session",
      documentation:
        "The session during which a log was recorded. Sessions roughly map to processes, or a single invocation of `humanlog`. Sessions are unique only within a machine.",
      range: computeRange("machine"),
    },
    {
      label: {
        label: "event",
        detail: " event is an identifier for a log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "event",
      documentation:
        "The event during which a log was recorded. Events roughly map to log lines ingested by `humanlog`. Events are unique and ordered only within a (machine, session) pair. No global order exists.",
      range: computeRange("event"),
    },
    {
      label: {
        label: "parsed_at",
        detail: " parsed_at is the timestamp when the log event was parsed",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "parsed_at",
      documentation:
        "The timestamp when the log event was parsed in `humanlog`.",
      range: computeRange("parsed_at"),
    },
    {
      label: {
        label: "raw",
        detail: " raw is the raw content of the log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "raw",
      documentation: "The full unparsed content of the log event.",
      range: computeRange("raw"),
    },
    {
      label: {
        label: "ts",
        detail: " ts is a timestamp for a log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "ts",
      documentation:
        "The ts found in a log event, if parsed in `humanlog`. When no timestamp is found, the default timestamp is the time of parsing. See `parsed_at`.",
      range: computeRange("ts"),
    },
    {
      label: {
        label: "lvl",
        detail: " lvl is a log level",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "lvl",
      documentation:
        "The log level found in a log event, if parsed in `humanlog`. Usually one of `debug`, `info`, `warn`, `error`, `panic` or `fatal`.",
      range: computeRange("lvl"),
    },
    {
      label: {
        label: "msg",
        detail: " msg is the main message a log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "msg",
      documentation:
        "The message found in a log event, if parsed in `humanlog`.",
      range: computeRange("msg"),
    },
    {
      label: {
        label: "kv",
        detail: " kv are key-values in a log event",
      },
      kind: languages.CompletionItemKind.Property,
      insertText: "kv",
      documentation:
        "The key-values found in a log event, if parsed in `humanlog`.",
      range: computeRange("kv"),
    },
  ];
};

const symbolsSuggestions = (
  model: editor.ITextModel,
  pos: Position,
  symbols: Symbol[],
): languages.CompletionItem[] => {
  const range = {
    startLineNumber: pos.lineNumber,
    startColumn: pos.column,
    endLineNumber: pos.lineNumber,
    endColumn: pos.column,
  };

  const line = model.getLineContent(pos.lineNumber);
  const computeRange = (keyword: string): IRange => {
    // TODO:
    // find the overlap between the suffix of line and the prefix of keyword
    return {
      startLineNumber: pos.lineNumber,
      startColumn: pos.column,
      endLineNumber: pos.lineNumber,
      endColumn: pos.column,
    };
  };

  return symbols.map((sym): languages.CompletionItem => {
    return {
      label: sym.name,
      kind: languages.CompletionItemKind.Variable,
      insertText: "['" + sym.name + "']",
      range: computeRange("['" + sym.name + "']"),
    };
  });
};

const tableOperatorSuggestions = (
  model: editor.ITextModel,
  pos: Position,
): languages.CompletionItem[] => {
  const range = {
    startLineNumber: pos.lineNumber,
    startColumn: pos.column,
    endLineNumber: pos.lineNumber,
    endColumn: pos.column,
  };

  const line = model.getLineContent(pos.lineNumber);
  const computeRange = (keyword: string): IRange => {
    // TODO:
    // find the overlap between the suffix of line and the prefix of keyword
    return {
      startLineNumber: pos.lineNumber,
      startColumn: pos.column,
      endLineNumber: pos.lineNumber,
      endColumn: pos.column,
    };
  };

  return [
    {
      label: {
        label: "filter",
        detail: " filter <expr>",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "filter",
      range: computeRange("filter"),
    },
    {
      label: {
        label: "summarize",
        detail:
          " summarize [(<id> = )? <aggregate_func>]+ by [(<id> = )? <expr>]+",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "summarize",
      range: computeRange("summarize"),
    },
    {
      label: {
        label: "project",
        detail: " project [(<id> = )? <expr>]+",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "project",
      range: computeRange("project"),
    },
    {
      label: {
        label: "project-away",
        detail: " project-away [(<id> = )? <expr>]+",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "project-away",
      range: computeRange("project-away"),
    },
    {
      label: {
        label: "project-keep",
        detail: " project-keep [(<id> = )? <expr>]+",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "project-keep",
      range: computeRange("project-keep"),
    },
    {
      label: {
        label: "extend",
        detail: " extend [(<id> = )? <expr>]+",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "extend",
      range: computeRange("extend"),
    },
    {
      label: {
        label: "count",
        detail: " count",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "count",
      range: computeRange("count"),
    },
    {
      label: {
        label: "distinct",
        detail: " distinct <id>[, <id>]*",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "distinct",
      range: computeRange("distinct"),
    },
    {
      label: {
        label: "sample",
        detail: " sample <i64>",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "sample",
      range: computeRange("sample"),
    },
    {
      label: {
        label: "search",
        detail: " search <search-predicate>",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "search",
      range: computeRange("search"),
    },
    {
      label: {
        label: "sort",
        detail: " sort by <id> (asc|desc)? [, <id> (asc|desc)?]*",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "sort by",
      range: computeRange("sort by"),
    },
    {
      label: {
        label: "take",
        detail: " take <i64>",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "take",
      range: computeRange("take"),
    },
    {
      label: {
        label: "top",
        detail: " top <i64> by <expr> (asc|desc)?",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "top",
      range: computeRange("top"),
    },
    {
      label: {
        label: "render split by",
        detail: " render split by <expr> [, <expr>]*",
      },
      kind: languages.CompletionItemKind.Operator,
      insertText: "render split by",
      range: computeRange("render split by"),
    },
  ];
};

export default MonacoEditor;
