"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useApiClients } from "@/context/api-provider";
import MonacoEditor from "@/components/editor/monaco-editor";
import { editor as monacoEditor } from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import * as monaco from "monaco-editor";
import { Button } from "@/components/ui/button";
import { List, Play, Star } from "lucide-react";
import {
  BinaryOp_Operator,
  Expr,
  FilterOperator,
  Query,
  Statement,
} from "api/js/types/v1/query_pb";
import { FormatRequest, ParseResponse } from "api/js/svc/query/v1/service_pb";
import { newBinaryExpr, newIdentifierExpr } from "@/lib/utils/queryBuilders";
import { formatQuery, parseQuery } from "@/services/queryService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SaveQueryModal } from "@/components/log-interface/query-library/save-query-modal";
import Graph from "@/components/ui/graph/graph";
import { useAllEnvironments } from "@/context/list-environments";

interface QueryInputProps {
  errMsg: string;
  onExecuteQuery: (query: string) => void;
  symbol?: string;
  editorContent: string;
  setEditorContent: Dispatch<SetStateAction<string>>;
  parsedQuery?: Query;
  setSavedQueryId?: Dispatch<SetStateAction<bigint | undefined>>;
  setIsLibraryOpen?: Dispatch<SetStateAction<boolean>>;
  fromExternalPage?: boolean;
}

const QueryInput = ({
  errMsg,
  onExecuteQuery,
  symbol,
  editorContent,
  setEditorContent,
  parsedQuery,
  setSavedQueryId,
  setIsLibraryOpen,
  fromExternalPage = false,
}: QueryInputProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");

  const { apiClients } = useApiClients();
  const { filterBySymbol, user } = useAllEnvironments();

  const [isSaveValid, setIsSaveValid] = useState(false);
  const [isSaveQueryModalOpen, setIsSaveQueryModalOpen] = useState(false);

  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monaco>();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const currentValue = editor.getValue();

      onExecuteQuery(currentValue);
      setEditorContent(currentValue);
    });
  };

  const executeQuery = (query: string, fromExternalPage?: boolean) => {
    if (fromExternalPage) {
      window.open(
        `/localhost/query?query=${encodeURIComponent(query)}`,
        "_blank",
      );
    } else {
      onExecuteQuery(query);
      setEditorContent(query);
    }
  };

  const addFilterSymbolByStatement = (
    parseRes: ParseResponse,
    filter: {
      symbolName: string;
      symbolValue: Expr;
      op?: BinaryOp_Operator;
    },
  ) => {
    if (!parseRes.query) return parseRes.query;
    const { symbolName, symbolValue, op } = filter;

    const statements: Statement[] = parseRes.query?.query?.statements ?? [];

    const nextFilter = newBinaryExpr(
      newIdentifierExpr(symbolName),
      op ?? BinaryOp_Operator.CMP_EQ,
      symbolValue,
    );

    const filterStmt = new Statement({
      stmt: {
        case: "filter",
        value: new FilterOperator({
          expr: nextFilter,
        }),
      },
    });

    statements.unshift(filterStmt);

    const newQuery = new Query({
      ...parseRes.query,
      query: {
        statements,
      },
    });

    return newQuery;
  };

  const handleFormatQuery = async (query?: Query) => {
    if (!apiClients || !query) return;

    const formatReq = new FormatRequest({
      query: {
        value: query,
        case: "parsed",
      },
    });
    formatQuery(apiClients?.query, formatReq, {
      onSuccess: (formatted: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        editorRef.current.setValue(formatted);
        setEditorContent(formatted);
      },
    });
  };

  useEffect(() => {
    if (!apiClients || !filterBySymbol) return;

    parseQuery(
      apiClients?.query,
      {
        query: editorContent,
      },
      {
        onSuccess: (parseRes: ParseResponse) => {
          handleFormatQuery(
            addFilterSymbolByStatement(parseRes, filterBySymbol),
          );
        },
      },
    );
  }, [filterBySymbol]);

  useEffect(() => {
    if (queryString) {
      setEditorContent(decodeURIComponent(queryString));
    } else {
      setEditorContent("");
    }
  }, [queryString]);

  useEffect(() => {
    if (symbol && editorRef.current) {
      const selection = editorRef.current.getSelection();

      if (selection) {
        const position = selection.getPosition();

        const operation = {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text: `['${symbol}']`,
          forceMoveMarkers: true,
        };

        editorRef.current.executeEdits("symbol-insertion", [operation]);

        setEditorContent(editorRef.current.getValue());

        editorRef.current.focus();
      }
    }
  }, [symbol]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      editorRef.current.addCommand(
        monacoRef.current.KeyMod.CtrlCmd | monacoRef.current.KeyCode.Enter,
        () => {
          const currentValue = editorRef.current?.getValue() || "";
          executeQuery(currentValue, fromExternalPage);
        },
      );
    }
  }, [searchParams, onExecuteQuery]);

  useEffect(() => {
    setIsSaveValid(editorContent.length > 0);
  }, [editorContent]);

  return (
    <>
      <div className="col-span-2 md:col-span-1">
        <div className="relative w-full overflow-hidden rounded-md border py-2">
          <TooltipProvider>
            <div className="absolute top-2 right-2 z-1 flex gap-1 text-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() =>
                      executeQuery(editorContent, fromExternalPage)
                    }
                    size="xs"
                    variant="outline"
                  >
                    <Play size={10} />
                    Run
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {!fromExternalPage
                    ? "Run this query (⌘+Enter)"
                    : "Run this query on your machine"}
                </TooltipContent>
              </Tooltip>
              {setIsLibraryOpen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setIsLibraryOpen((prev) => !prev)}
                    >
                      <List size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open the Query Library</TooltipContent>
                </Tooltip>
              )}
              {user !== "not-logged-in" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={!isSaveValid}
                      onClick={() => setIsSaveQueryModalOpen(true)}
                    >
                      <Star size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Query</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
          <MonacoEditor
            value={editorContent}
            onChange={(value) => setEditorContent(value || "")}
            onMount={handleEditorDidMount}
          />
        </div>
        <p className="mt-2 text-xs text-[red]">{errMsg}</p>
      </div>

      {/* Save Query Modal */}
      <SaveQueryModal
        query={editorContent || ""}
        isSaveQueryModalOpen={isSaveQueryModalOpen}
        setIsSaveQueryModalOpen={setIsSaveQueryModalOpen}
        parsedQuery={parsedQuery}
        setSavedQueryId={setSavedQueryId}
      />
    </>
  );
};

export default QueryInput;
