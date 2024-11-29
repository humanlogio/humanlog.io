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

export type ZoomType = {
  startIndex?: number;
  endIndex?: number;
};

export type DataPoint = {
  dayNumber: number;
  name: string;
  date: Date;
  amt: number;
  pv?: number;
};

const Graph = (props: {
  data?: DataPoint[] | null;
  zoom: ZoomType;
  onZoom?: (zoom: ZoomType) => void;
}) => {
  const { data, onZoom } = props;
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

  if (!data) {
    return (
      <div className="h-full w-full">
        <p className="mt-1 rounded-md border bg-slate-200 p-4 text-sm font-medium leading-tight text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          No log data was found for that time frame.
          <br />
          <br />
          Try expanding the date range. If still no data is coming through,
          please check that the log source is configured correctly.
        </p>
      </div>
    );
  }

  const [minValue, maxValue] = [0, data.length - 1];
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
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            wrapperClassName="dark:bg-bg bg-darkBg"
            labelClassName="dark:text-text text-darkText"
            contentStyle={{ background: "currentColor" }}
          />
          <Legend />
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
            height={16}
            dataKey={"name"}
            type="number"
            travellerWidth={15}
            gap={data.length / 100}
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
