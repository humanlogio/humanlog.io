import { useCallback, useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import Scroller from "@/components/ui/graph/scroller";
import dayjs from "dayjs";
import { useApiClients } from "@/context/api-provider";
import {
  convertToGraphDataPoints,
  convertToTimestamp,
} from "@/components/env/graph-utils";

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

const Graph = (props: {
  data?: DataPoint[] | null;
  bucketCount: number;
  zoom: ZoomType;
  onZoom?: (zoom: ZoomType) => void;
  startDate: Date;
  endDate: Date;
}) => {
  const { data, bucketCount, onZoom, startDate, endDate } = props;
  const [zoom, setZoom] = useState<ZoomType>(props.zoom);
  const [activeAnimations, setActiveAnimations] = useState(true);

  useEffect(() => {
    setZoom(props.zoom);
  }, [props.zoom]);

  const updateGraph = useCallback(
    (zoom: ZoomType, animate: boolean) => {
      setZoom(zoom);
      setActiveAnimations(animate);
      if (typeof onZoom === "function") onZoom(zoom);
    },
    [onZoom],
  );

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        <p className="mt-1 rounded-md border bg-slate-200 p-4 text-sm leading-tight font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          No log data was found for that time frame.
          <br />
          <br />
          Try expanding the date range. If still no data is coming through,
          please check that the log source is configured correctly.
        </p>
      </div>
    );
  }

  const [minValue, maxValue] = [0, bucketCount];
  const { startIndex, endIndex } = {
    startIndex: Math.max(zoom?.startIndex ?? minValue, minValue),
    endIndex: Math.min(zoom?.endIndex ?? maxValue, maxValue),
  } as { startIndex: number; endIndex: number };

  return (
    <Scroller
      minValue={minValue}
      maxValue={maxValue}
      startIndex={startIndex}
      endIndex={endIndex}
      lockScroll={true}
      onProcessed={updateGraph}
    >
      <ResponsiveContainer>
        <BarChart data={data}>
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
            labelClassName="text-xs text-white dark:text-slate-500"
            contentStyle={{ background: "currentColor", fontSize: "0.75rem" }}
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
            stroke={"rgba(24, 106, 188, 0.6)"}
            fill="rgba(136, 170, 238, 0.3)"
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
  );
};

export default Graph;
