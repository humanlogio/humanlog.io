import { useCallback, useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import Scroller, {
  GRAPH_RANGE_MIN_WIDTH,
} from "@/components/ui/graph/scroller";
import dayjs from "dayjs";
import { useApiClients } from "@/context/api-provider";
import {
  closestIndex,
  convertToGraphDataPoints,
  convertToTimestamp,
} from "@/components/env/graph-utils";
import { useDebouncer } from "@/hooks/useDebouncer";
import DateRangePicker from "@/components/ui/graph/dateRangePicker";
import { useEnvironmentStore } from "@/stores/environment-store";

export type ZoomType = {
  startIndex?: number;
  endIndex?: number;
};

export type DataPoint = {
  dayNumber: number;
  date: Date;
  amt: number;
  pv?: number;
};

const Graph = () => {
  const { activeEnvironment } = useEnvironmentStore();
  const { apiClients } = useApiClients();

  const [bucketCount, setBucketCount] = useState<number>(100);
  const [activeAnimations, setActiveAnimations] = useState(true);
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
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);

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
            environmentId: activeEnvironment?.environment?.id,
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

  useEffect(() => {
    setZoom(zoom);
  }, [zoom]);

  const updateGraph = useCallback(
    (zoom: ZoomType, animate: boolean) => {
      setZoom(zoom);
      setActiveAnimations(animate);
      if (typeof updateTimeFrame === "function") updateTimeFrame(zoom);
    },
    [updateTimeFrame],
  );

  useEffect(() => {
    updateGraphRange(startDate, endDate);
  }, [startDate, endDate]);

  const [minValue, maxValue] = [0, bucketCount];
  const { startIndex, endIndex } = {
    startIndex: Math.max(zoom?.startIndex ?? minValue, minValue),
    endIndex: Math.min(zoom?.endIndex ?? maxValue, maxValue),
  } as { startIndex: number; endIndex: number };

  return (
    <div className="col-span-2 flex flex-col items-center gap-2 md:col-span-1">
      {!eventsList || eventsList.length === 0 ? (
        <div className="w-full">
          <p className="bg-muted mt-1 rounded-md p-4 text-sm leading-tight font-medium">
            No log data was found for that time frame.
            <br />
            <br />
            Try expanding the date range. If still no data is coming through,
            please check that the log source is configured correctly.
          </p>
        </div>
      ) : (
        <Scroller
          minValue={minValue}
          maxValue={maxValue}
          startIndex={startIndex}
          endIndex={endIndex}
          lockScroll={true}
          onProcessed={updateGraph}
        >
          <ResponsiveContainer>
            <BarChart data={eventsList}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                domain={[startDate.getTime(), endDate.getTime()]}
                type="number"
                scale="time"
                tickFormatter={(timestamp) => dayjs(timestamp).format("MM/DD")}
              />
              <YAxis width={40} />
              <Tooltip
                labelClassName="text-xs text-white dark:text-muted-foreground"
                contentStyle={{
                  background: "currentColor",
                  fontSize: "0.75rem",
                }}
              />
              <Bar
                type="monotone"
                dataKey="amt"
                name="Log Amount"
                stroke="rgba(136, 170, 238, var(--tw-bg-opacity))"
                fill="rgba(136, 170, 238, var(--tw-bg-opacity))"
                isAnimationActive={activeAnimations}
              />
              <Brush
                height={16}
                dataKey={"date"}
                gap={1}
                onChange={(zoom) => updateGraph(zoom, activeAnimations)}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </BarChart>
          </ResponsiveContainer>
        </Scroller>
      )}

      <DateRangePicker
        dateFrom={startDate}
        dateTo={endDate}
        setDateFrom={setStartDate}
        setDateTo={setEndDate}
      />
    </div>
  );
};

export default Graph;
