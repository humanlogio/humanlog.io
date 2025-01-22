"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Share } from "lucide-react";
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
import { QueryRequest } from "api/js/svc/query/v1/service_pb";
import { LogData } from "@/components/env/log-interface";
import { Cursor } from "api/js/types/v1/cursor_pb";
import { LogEvents, Tabular } from "api/js/types/v1/query_pb";

interface NewQueryInputProps {
  setLogData: Dispatch<SetStateAction<LogData>>;
  fetchNext: boolean;
  setIsFetching: Dispatch<SetStateAction<boolean>>;
}

const NewQueryInput = ({
  setLogData,
  fetchNext,
  setIsFetching,
}: NewQueryInputProps) => {
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
  const [queryString, setQueryString] = useState<string>("");
  const [next, setNext] = useState<Cursor | null>();
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

  const pasrseQuery = async (parseReq: { query: string }) => {
    try {
      const parsedQuery = await apiClients?.query.parse(parseReq);
      return parsedQuery;
    } catch (error) {
      alert("Query parsing failed. Please check your query syntax.");
      console.error("Query parsing error:", error);
    }
  };

  const getLogData = useCallback(
    async (editorContent: string) => {
      setIsFetching(true);
      if (!editorContent || !apiClients?.query) {
        console.log("Invalid content or missing API client:", {
          editorContent,
          hasApiClient: !!apiClients?.query,
        });
        setIsFetching(false);
        return;
      }

      try {
        const parseReq = { query: editorContent };
        const parseRes = await pasrseQuery(parseReq);

        if (parseRes) {
          const queryReq = new QueryRequest({
            environmentId: activeEnvironment?.id,
            query: parseRes.query,
            ...(next && { cursor: next }), // Only when next value exists
            limit: 30,
          });

          const queryRes = await apiClients.query.query(queryReq);

          if (queryRes.next) {
            setNext(queryRes.next);
          } else {
            setNext(null);
          }

          if (queryRes.data) {
            const { case: dataCase, value } = queryRes.data.shape;

            if (dataCase === "tabular" && value instanceof Tabular) {
              const { case: shapeCase, value: shapeValue } = value.shape;
              if (shapeCase === "logEvents") {
                setLogData((prev) => {
                  if (prev.value && prev.value instanceof Tabular) {
                    const { value: prevShapeValue } = prev.value.shape;

                    if (prevShapeValue && prevShapeValue instanceof LogEvents) {
                      const newValue = new Tabular({
                        shape: {
                          case: shapeCase,
                          value: {
                            events: [
                              ...prevShapeValue.events,
                              ...shapeValue.events,
                            ],
                          },
                        },
                      });

                      return {
                        case: dataCase,
                        value: newValue,
                      };
                    }
                  }

                  return { case: dataCase, value };
                });
              }
            }
          }
        }
        setIsFetching(false);
      } catch (error: any) {
        setIsFetching(false);
        console.error(error);
      }
    },
    [
      activeEnvironment,
      apiClients?.query,
      endDate,
      startDate,
      queryString,
      next,
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
        editor.setValue("");
        isFirstFocusRef.current = false;
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const currentValue = editor.getValue();

      // initialize
      setNext(null);
      setLogData({ case: undefined, value: undefined });

      getLogData(currentValue);
    });
  };

  useEffect(() => {
    updateGraphRange(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (fetchNext && next) {
      getLogData(queryString);
    }
  }, [fetchNext]);

  return (
    <div className="container grid grid-cols-2 gap-8">
      <div className="col-span-2 md:col-span-1">
        <h1 className="text-2xl font-bold">
          Lorem ipsum dolor sit amet consectetur
        </h1>
        <p className="mt-2 text-slate-500">subtitle</p>
        <div className="ml-[4px] mt-4 flex flex-row gap-2">
          <div className="w-11/12 rounded-base border-2 border-border py-3">
            <MonacoEditor
              value={queryString}
              onChange={(value) => setQueryString(value || "")}
              onMount={handleEditorDidMount}
            />
          </div>

          <Button
            size="icon"
            className="h-8"
            onClick={() => {
              setNext(null);
              getLogData(queryString);
            }}
          >
            <Share size={14} />
          </Button>
        </div>
      </div>

      <div className="col-span-2 space-y-8 md:col-span-1">
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
