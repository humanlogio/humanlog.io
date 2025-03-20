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
import { useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import * as monaco from "monaco-editor";
import { QueryLibrary } from "./query-library";
import { X } from "lucide-react";

interface NewQueryInputProps {
  errMsg: string;
  onExecuteQuery: (query: string) => void;
  symbol?: string;
  isLibraryOpen: boolean;
  setIsLibraryOpen: Dispatch<SetStateAction<boolean>>;
}

const NewQueryInput = ({
  errMsg,
  onExecuteQuery,
  isLibraryOpen,
  setIsLibraryOpen,
}: NewQueryInputProps) => {
  const isProd = process.env.NODE_ENV === "production";
  const searchParams = useSearchParams();
  const queryString = searchParams.get("query");

  const { apiClients, activeEnvironment } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
  );
  const [editorContent, setEditorContent] = useState<string>("");
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().valueOf()));
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );
  const [graphRange, setGraphRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({ startDate, endDate: new Date() });
  const [symbol, setSymbol] = useState("");

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
      onExecuteQuery(currentValue);

      setEditorContent(currentValue);
    });
  };

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
          onExecuteQuery(currentValue);
          setEditorContent(currentValue);
        },
      );
    }
  }, [searchParams, onExecuteQuery]);

  return (
    <div
      className={twMerge(
        "container items-center gap-8",
        !isProd && "grid grid-cols-2",
      )}
    >
      {/* TEXT INPUT */}
      <div className="col-span-2 md:col-span-1">
        <div className="mb-2 flex w-full flex-row items-center justify-between">
          <div>{/* 필요한 경우 왼쪽에 추가 컨트롤 위치 */}</div>
          <div className="flex gap-2 text-sm">
            <button className="border">Save</button>
            <button onClick={() => setIsLibraryOpen(true)} className="border">
              Query Library
            </button>
          </div>
        </div>
        <div className="w-full overflow-hidden rounded-base border-2 border-border py-3">
          <MonacoEditor
            value={editorContent}
            onChange={(value) => setEditorContent(value || "")}
            onMount={handleEditorDidMount}
          />
        </div>
        <p className="mt-2 text-xs text-[red]">{errMsg}</p>
      </div>

      <div
        className={`fixed bottom-0 right-0 top-16 w-96 border-l-2 border-black bg-white p-4 pt-4 shadow-lg transition-transform duration-300 ease-in-out dark:border-white dark:bg-darkBg ${
          isLibraryOpen ? "translate-x-0" : "translate-x-full"
        } z-20`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Query Library</h2>
          <button
            onClick={() => setIsLibraryOpen(false)}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <QueryLibrary
          onClickSymbol={(symbolString) => {
            setSymbol(symbolString);
          }}
        />
      </div>

      {/* CHART */}
      {!isProd && (
        <div className="col-span-2 flex flex-col items-center gap-2 md:col-span-1">
          <DateRangePicker
            dateFrom={startDate}
            dateTo={endDate}
            setDateFrom={setStartDate}
            setDateTo={setEndDate}
          />
          <Graph
            data={eventsList}
            bucketCount={bucketCount}
            zoom={zoom}
            onZoom={updateTimeFrame}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
};

export default NewQueryInput;
