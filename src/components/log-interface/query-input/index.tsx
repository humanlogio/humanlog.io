"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Graph, { DataPoint, ZoomType } from "@/components/ui/graph/graph";
import { useApiClients } from "@/context/api-provider";
import DateRangePicker from "@/components/ui/graph/dateRangePicker";
import { useDebouncer } from "@/lib/utils/useDebouncer";
import { GRAPH_RANGE_MIN_WIDTH } from "@/components/ui/graph/scroller";
import {
  closestIndex,
  convertToGraphDataPoints,
  convertToTimestamp,
} from "@/components/env/graph-utils";
import MonacoEditor from "@/components/editor/monaco-editor";
import { editor as monacoEditor } from "monaco-editor";
import type { OnMount } from "@monaco-editor/react";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import * as monaco from "monaco-editor";
import config from "@/features/config";
import { Button } from "@/components/ui/button";
import { List, Play, Star } from "lucide-react";
import {
  BinaryOp_Operator,
  FilterOperator,
  LogQuery,
  Statement,
} from "api/js/types/v1/logquery_pb";
import { FormatRequest, ParseResponse } from "api/js/svc/query/v1/service_pb";
import { KV } from "api/js/types/v1/types_pb";
import {
  newBinaryExpr,
  newIdentifierExpr,
  newLiteralExpr,
} from "@/lib/utils/queryBuilders";
import { formatQuery, parseQuery } from "@/services/queryService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SaveQueryModal } from "@/components/log-interface/query-library/save-query-modal";

interface QueryInputProps {
  errMsg: string;
  onExecuteQuery: (query: string) => void;
  symbol?: string;
  editorContent: string;
  filterByKv?: {
    kv: KV;
    op?: BinaryOp_Operator;
  };
  setEditorContent: Dispatch<SetStateAction<string>>;
  parsedQuery?: LogQuery;
  setSavedQueryId?: Dispatch<SetStateAction<bigint | undefined>>;
  setIsLibraryOpen: Dispatch<SetStateAction<boolean>>;
}

const QueryInput = ({
  errMsg,
  onExecuteQuery,
  symbol,
  editorContent,
  filterByKv,
  setEditorContent,
  parsedQuery,
  setSavedQueryId,
  setIsLibraryOpen,
}: QueryInputProps) => {
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");

  const { apiClients, activeEnvironment } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
  );
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().valueOf()));
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );
  const [graphRange, setGraphRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({ startDate, endDate: new Date() });
  // const [isHovered, setIsHovered] = useState(false);
  const [isSaveValid, setIsSaveValid] = useState(false);
  const [isSaveQueryModalOpen, setIsSaveQueryModalOpen] = useState(false);
  const [isQueryShareModalOpen, setIsQueryShareModalOpen] = useState(false);

  const isFirstFocusRef = useRef(true);
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor>();
  const monacoRef = useRef<typeof monaco>();

  const updateGraphRange = useCallback(
    (
      zoomStartDate: Date,
      zoomEndDate: Date | null,
      targetStart?: Date,
      targetEnd?: Date,
    ) => {
      (async () => {
        try {
          const events = await apiClients?.query.summarizeEvents({
            environmentId: activeEnvironment?.id,
            from: convertToTimestamp(targetStart ?? startDate),
            to: convertToTimestamp(targetEnd ?? endDate),
            bucketCount,
          });
          if (events) {
            setEvents(
              convertToGraphDataPoints(events.buckets, startDate, endDate),
            );
            setGraphRange({
              startDate: targetStart ?? graphRange.startDate,
              endDate: targetEnd ?? graphRange.endDate,
            });
            setZoom({
              startIndex: closestIndex(events.buckets, zoomStartDate),
              endIndex:
                (zoomEndDate && closestIndex(events.buckets, zoomEndDate)) ??
                events.buckets.length - 1,
            });
          }
        } catch (e) {
          console.log("it crashed", e);
        }
      })();
    },
    [
      apiClients?.query,
      activeEnvironment,
      bucketCount,
      graphRange.startDate,
      graphRange.endDate,
      startDate,
      endDate,
    ],
  );

  const updateTimeFrame = useDebouncer(
    (zoom: ZoomType) => {
      if (!eventsList) {
        return;
      }

      setZoom(zoom);

      const { startIndex, endIndex } = zoom;
      const listSize = eventsList.length;
      const borderRange = 0.05;
      const graphGapRate = 0.3;

      let zoomStart: Date = startDate;
      let zoomEnd: Date | null = endDate;
      let targetGraphStart: Date | undefined;
      let targetGraphEnd: Date | undefined;

      if (
        typeof startIndex === "number" &&
        eventsList[Math.floor(startIndex)]?.date
      ) {
        zoomStart = eventsList[Math.floor(startIndex)].date;
        setStartDate(zoomStart);

        if (startIndex / listSize <= borderRange) {
          targetGraphStart = new Date(
            graphRange.startDate.getTime() -
              Math.floor(
                Math.abs(
                  graphRange.endDate.getTime() - graphRange.startDate.getTime(),
                ) * graphGapRate,
              ),
          );
        }
      }

      if (
        typeof endIndex === "number" &&
        eventsList[Math.floor(endIndex)]?.date
      ) {
        zoomEnd = eventsList[Math.floor(endIndex)].date;
        setEndDate(zoomEnd);

        if (endIndex / listSize >= 1 - borderRange) {
          targetGraphEnd = new Date(
            graphRange.endDate.getTime() +
              Math.floor(
                Math.abs(
                  graphRange.endDate.getTime() - graphRange.startDate.getTime(),
                ) * graphGapRate,
              ),
          );
        }
      }

      if (
        typeof startIndex === "number" &&
        typeof endIndex === "number" &&
        (Math.abs(endIndex - startIndex) <= eventsList.length * borderRange ||
          Math.abs(endIndex - startIndex) <= GRAPH_RANGE_MIN_WIDTH)
      ) {
        zoomStart = eventsList[Math.floor(startIndex)].date;
        zoomEnd = eventsList[Math.floor(endIndex)].date;

        const diff = Math.floor(
          Math.abs(zoomEnd.getTime() - zoomStart.getTime()) / 2,
        );

        targetGraphStart = new Date(zoomStart.getTime() - diff);
        targetGraphEnd = new Date(zoomEnd.getTime() + diff);
      }

      if (targetGraphStart || targetGraphEnd) {
        updateGraphRange(zoomStart, zoomEnd, targetGraphStart, targetGraphEnd);
      }
    },
    [
      eventsList,
      startDate,
      endDate,
      graphRange.startDate,
      graphRange.endDate,
      updateGraphRange,
    ],
  );

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidFocusEditorText(() => {
      if (isFirstFocusRef.current) {
        !queryString && editor.setValue("");
        isFirstFocusRef.current = false;
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const currentValue = editor.getValue();
      const params = new URLSearchParams(searchParams);
      params.set("query", encodeURIComponent(currentValue));
      router.push(`?${params}`);
      onExecuteQuery(currentValue);

      setEditorContent(currentValue);
    });
  };

  const executeQuery = (query: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("query", encodeURIComponent(query));
    router.push(`?${params}`);
    onExecuteQuery(query);
    setEditorContent(query);
  };

  const addFilterByStatement = (
    parseRes: ParseResponse,
    filter: {
      kv: KV;
      op?: BinaryOp_Operator;
    },
  ) => {
    if (!parseRes.query) return parseRes.query;
    const {
      kv: { key, value },
      op,
    } = filter;

    const statements: Statement[] = parseRes.query?.query?.statements ?? [];

    const nextFilter = newBinaryExpr(
      newIdentifierExpr(key),
      op ?? BinaryOp_Operator.CMP_EQ,
      newLiteralExpr(value!),
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

    const newQuery = new LogQuery({
      ...parseRes.query,
      query: {
        statements,
      },
    });

    return newQuery;
  };

  const handleFormatQuery = async (query?: LogQuery) => {
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
    if (!apiClients || !filterByKv) return;

    parseQuery(
      apiClients?.query,
      {
        query: editorContent,
      },
      {
        onSuccess: (parseRes: ParseResponse) => {
          handleFormatQuery(addFilterByStatement(parseRes, filterByKv));
        },
      },
    );
  }, [filterByKv]);

  useEffect(() => {
    updateGraphRange(startDate, endDate);
  }, [startDate, endDate]);

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
          executeQuery(currentValue);
        },
      );
    }
  }, [searchParams, onExecuteQuery]);

  useEffect(() => {
    setIsSaveValid(editorContent.length > 0);
  }, [editorContent]);

  return (
    <div
      className={twMerge("items-center gap-8", !isProd && "grid grid-cols-2")}
    >
      <div className="col-span-2 md:col-span-1">
        <div className="w-full overflow-hidden rounded-md border py-2">
          <div className="mr-2 flex justify-end gap-1 text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => executeQuery(editorContent)}
                    size="xs"
                    variant="outline"
                  >
                    <Play size={10} />
                    Run
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run the query (⌘+Enter)</TooltipContent>
              </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="xs"
                    variant="outline"
                    // disabled={!isSaveValid}
                    // onClick={() => setIsSaveQueryModalOpen(true)}
                  >
                    <Share2 size={12} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Query</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <MonacoEditor
            value={editorContent}
            onChange={(value) => setEditorContent(value || "")}
            onMount={handleEditorDidMount}
          />
        </div>
        <p className="mt-2 text-xs text-[red]">{errMsg}</p>
      </div>

      {/* Save Query Modal */}
      {isSaveQueryModalOpen && (
        <SaveQueryModal
          query={editorContent || ""}
          isSaveQueryModalOpen={isSaveQueryModalOpen}
          setIsSaveQueryModalOpen={setIsSaveQueryModalOpen}
          parsedQuery={parsedQuery}
          setSavedQueryId={setSavedQueryId}
        />
      )}

      {/* CHART */}
      {!isProd && (
        <div className="col-span-2 flex flex-col items-center gap-2 md:col-span-1">
          <Graph
            data={eventsList}
            bucketCount={bucketCount}
            zoom={zoom}
            onZoom={updateTimeFrame}
            startDate={startDate}
            endDate={endDate}
          />
          <DateRangePicker
            dateFrom={startDate}
            dateTo={endDate}
            setDateFrom={setStartDate}
            setDateTo={setEndDate}
          />
        </div>
      )}
    </div>
  );
};

export default QueryInput;
