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
import {
  LogQuery,
  RenderStatement,
  SplitOperator,
  SplitOperator_ByOperator,
} from "api/js/types/v1/logquery_pb";

interface NewQueryInputProps {
  setParsedQuery: Dispatch<SetStateAction<LogQuery | undefined>>;
  setLogData: Dispatch<SetStateAction<LogData>>;
  splitByDefault: boolean;
}

const NewQueryInput = ({
  splitByDefault,
  setParsedQuery,
  setLogData,
}: NewQueryInputProps) => {
  const { apiClients, activeEnvironment } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
  );
  const [queryString, setQueryString] = useState<string>("");
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().valueOf()));
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );
  const [graphRange, setGraphRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({ startDate, endDate: new Date() });

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

  const parseQuery = async (parseReq: { query: string }) => {
    try {
      const parsedQuery = await apiClients?.query.parse(parseReq);
      return parsedQuery;
    } catch (error) {
      alert("Query parsing failed. Please check your query syntax.");
      console.error("Query parsing error:", error);
    }
  };

  const getLogData = useCallback(
    async (editorContent: string, splitByDefault?: boolean) => {
      if (!editorContent || !apiClients?.query) {
        console.log("Invalid content or missing API client:", {
          editorContent,
          hasApiClient: !!apiClients?.query,
        });
        return;
      }

      try {
        const parseReq = { query: editorContent };
        const parseRes = await parseQuery(parseReq);

        if (parseRes) {
          const q = parseRes.query;

          if (
            q?.query?.statements?.some(
              (stmt) => stmt.stmt?.case === "filter",
            ) &&
            splitByDefault
          ) {
            q!.query!.render = new RenderStatement({
              stmt: {
                case: "split",
                value: new SplitOperator({
                  by: new SplitOperator_ByOperator({
                    scalars: [
                      {
                        expr: {
                          case: "identifier",
                          value: { name: "session" },
                        },
                      },
                      {
                        expr: {
                          case: "identifier",
                          value: { name: "machine" },
                        },
                      },
                    ],
                  }),
                }),
              },
            });
          }

          setParsedQuery(parseRes.query);
          const queryReq = new QueryRequest({
            environmentId: activeEnvironment?.id,
            query: parseRes.query,
            limit: 30,
          });

          const queryRes = await apiClients.query.query(queryReq);

          if (queryRes.data) {
            setLogData(queryRes.data.shape);
          }
        }
      } catch (error: any) {
        console.error(error);
      }
    },
    [
      activeEnvironment,
      apiClients?.query,
      endDate,
      startDate,
      queryString,
      splitByDefault,
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
      setLogData({ case: undefined, value: undefined });

      getLogData(currentValue, splitByDefault);
      setQueryString(currentValue);
    });
  };

  useEffect(() => {
    updateGraphRange(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    getLogData(queryString, splitByDefault);
  }, [splitByDefault]);

  return (
    <div className="container grid grid-cols-2 items-start gap-8">
      {/* TEXT INPUT */}
      <div className="col-span-2 ml-[4px] flex flex-row gap-2 md:col-span-1">
        <div className="w-full overflow-hidden rounded-base border-2 border-border py-3">
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
            getLogData(queryString);
          }}
        >
          <Share size={14} />
        </Button>
      </div>

      {/* CHART */}
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
