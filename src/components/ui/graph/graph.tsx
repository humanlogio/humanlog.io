import { DataPoint, generateRandomData } from "@/lib/faker";
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

const Graph = (props: { onZoom?: (zoom: ZoomType) => void } = {}) => {
  const { onZoom } = props;
  const [data, setData] = useState(generateRandomData(50));
  const [zoom, setZoom] = useState<ZoomType | null>(null);
  const [activeAnimations, setActiveAnimations] = useState(true);
  const [dateFromValue, setDateTo] = useState(
    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 30),
  );
  const [dateToValue, setDateFrom] = useState(new Date());

  const maxValue = data.length - 1;
  const { startIndex, endIndex } = {
    startIndex: zoom?.startIndex ?? maxValue - 20,
    endIndex: zoom?.endIndex ?? maxValue,
  } as { startIndex: number; endIndex: number };

  const updateGraph = useCallback(
    (data: DataPoint[], zoom: ZoomType, animate: boolean) => {
      setData(data);
      setZoom(zoom);
      setActiveAnimations(animate);
      if (typeof onZoom === "function") onZoom(zoom);
    },
    [onZoom],
  );

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
            dataKey="pv"
            stroke="#8884d8"
            fill="#8884d8"
            isAnimationActive={activeAnimations}
          />
          <Bar
            type="monotone"
            dataKey="uv"
            stroke="#82ca9d"
            fill="#82ca9d"
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
            // onChange={handleBrushChange}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </BarChart>
      </ResponsiveContainer>

      <DateRangePicker
        dateFrom={dateFromValue}
        dateTo={dateToValue}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
      />
    </Scroller>
  );
};

export default Graph;
