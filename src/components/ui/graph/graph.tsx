import { useCallback, useState } from "react";
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
import Scroller from "./scroller";
import DateRangePicker from "./dateRangePicker";

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
  startDate: Date;
  endDate: Date | null;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  onZoom?: (zoom: ZoomType) => void;
}) => {
  const { data, startDate, endDate, setStartDate, setEndDate, onZoom } = props;
  const [zoom, setZoom] = useState<ZoomType | null>(null);
  const [activeAnimations, setActiveAnimations] = useState(true);

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
      <div className="space-y-8">
        <div className="h-full w-full">
          <p className="mt-1 rounded-md border bg-slate-200 p-4 text-sm font-medium leading-tight text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            No event list data was loaded for that time frame.
            <br />
            <br />
            Try expanding the date range. If still no data is coming through,
            please check that the bucket is configured correctly.
          </p>
        </div>

        <DateRangePicker
          dateFrom={startDate}
          dateTo={endDate}
          setDateFrom={setStartDate}
          setDateTo={setEndDate}
        />
      </div>
    );
  }

  const maxValue = data.length - 1;
  const { startIndex, endIndex } = {
    startIndex: zoom?.startIndex ?? maxValue - 20,
    endIndex: zoom?.endIndex ?? maxValue,
  } as { startIndex: number; endIndex: number };

  return (
    <Scroller data={data} zoom={zoom} onProcessed={updateGraph}>
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
          <Tooltip />
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
            dataKey={"date"}
            type="number"
            travellerWidth={15}
            gap={data.length / 100}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            }
            onChange={(zoom) => updateGraph(zoom, activeAnimations)}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </BarChart>
      </ResponsiveContainer>

      <DateRangePicker
        dateFrom={startDate}
        dateTo={endDate}
        setDateFrom={setStartDate}
        setDateTo={setEndDate}
      />
    </Scroller>
  );
};

export default Graph;
