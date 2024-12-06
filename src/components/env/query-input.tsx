"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Share } from "lucide-react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { LogEventGroup } from "@/components/sortable/session-container";
import Graph, { DataPoint, ZoomType } from "@/components/ui/graph/graph";
import { useApiClients } from "@/context/api-provider";
import DateRangePicker from "@/components/ui/graph/dateRangePicker";
import { useDebouncer } from "@/lib/utils/useDebouncer";
import { GRAPH_RANGE_MIN_WIDTH } from "@/components/ui/graph/scroller";
import { useAbortable } from "@/lib/utils/useAbortable";
import {
  closestIndex,
  convertToGraphDataPoints,
  convertToTimestamp,
} from "@/components/env/graph-utils";

const QueryInput = ({
  setSessions,
}: {
  setSessions: React.Dispatch<React.SetStateAction<LogEventGroup[] | null>>;
}) => {
  const { apiClients, activeEnvironment } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    // new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
    new Date(new Date().valueOf() - 1000 * 60 * 10),
  );
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );
  const [graphRange, setGraphRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({ startDate, endDate: new Date() });
  const [queryString, setQueryString] = useState<string>("");

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
            from: convertToTimestamp(targetStart ?? graphRange.startDate),
            to: convertToTimestamp(targetEnd ?? graphRange.endDate),
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

  const createNewSession = useAbortable(
    (signal: AbortSignal) => async () => {
      if (!queryString || !apiClients?.query) return;

      const stream = apiClients.query.watchQuery({
        environmentId: activeEnvironment?.id,
        query: {
          from: convertToTimestamp(startDate),
          to: endDate ? convertToTimestamp(endDate) : undefined,
        },
      });

      if (!stream) return;

      for await (const response of stream) {
        if (signal.aborted) break;
        if (!response.events.length) continue;

        setSessions(
          response.events.map((event) => ({
            ...event,
            isStreaming: !endDate,
          })),
        );
      }
    },
    [activeEnvironment, apiClients?.query, endDate, startDate, queryString],
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

  useEffect(() => {
    if (!eventsList) {
      updateGraphRange(startDate, endDate);
    }
  }, [eventsList, startDate, endDate, updateGraphRange]);

  return (
    <div className="container grid flex-none grid-cols-2 gap-8">
      <div className="col-span-2 md:col-span-1">
        <h1 className="text-2xl font-bold">
          Lorem ipsum dolor sit amet consectetur
        </h1>
        <p className="mt-2 text-slate-500">subtitle</p>
        <div className="ml-[4px] mt-4 flex flex-row gap-2">
          <AutosizeTextarea
            maxHeight={160}
            placeholder="Type to search"
            value={queryString}
            onChange={(event) => setQueryString(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                createNewSession();
              }
            }}
          />
          <Button size="icon" className="h-8" onClick={createNewSession}>
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

export default QueryInput;
