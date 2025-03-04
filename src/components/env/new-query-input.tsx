"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ListTree, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { OnMount } from "@monaco-editor/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SymbolList } from "@/components/env/symbol-list";

interface NewQueryInputProps {
  errMsg: string;
  onExecuteQuery: (query: string) => void;
}

const NewQueryInput = ({ errMsg, onExecuteQuery }: NewQueryInputProps) => {
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
      setEditorContent(decodeURIComponent(`${queryString}`));
    } else {
      setEditorContent("");
    }
  }, [queryString, symbol]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (symbol) {
      const query = `${decodeURIComponent(queryString as string)}['${symbol}']`;
      setEditorContent(query);
      params.set("query", encodeURIComponent(query));
      router.push(`?${params}`);
    }
  }, [symbol]);

  return (
    <div className="container grid grid-cols-2 items-start gap-8">
      {/* TEXT INPUT */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex w-full flex-row gap-2">
          <div className="w-full overflow-hidden rounded-base border-2 border-border py-3">
            <MonacoEditor
              value={editorContent}
              onChange={(value) => setEditorContent(value || "")}
              onMount={handleEditorDidMount}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="h-8">
                <ListTree size={14} />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col items-start dark:bg-darkBg">
              <SheetHeader>
                <SheetTitle>Symbols</SheetTitle>
              </SheetHeader>
              <SymbolList
                onClickSymbol={(symbolString) => setSymbol(symbolString)}
              />
            </SheetContent>
          </Sheet>

          {/* TODO: not implemented */}
          {/* <Button
            size="icon"
            className="h-8"           
          >
            <Share size={14} />
          </Button> */}
        </div>
        <p className="mt-2 text-xs text-[red]">{errMsg}</p>
      </div>

      {/* CHART */}
      <div className="col-span-2 flex flex-col items-center gap-2 md:col-span-1">
        <Graph data={eventsList} zoom={zoom} onZoom={updateTimeFrame} />
        <DateRangePicker
          dateFrom={startDate}
          dateTo={endDate}
          setDateFrom={setStartDate}
          setDateTo={setEndDate}
        />
      </div>
    </div>
  );
};

export default NewQueryInput;
