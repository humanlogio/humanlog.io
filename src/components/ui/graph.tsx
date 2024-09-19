import { generateRandomData } from "@lib/faker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  BarChart,
  Bar,
} from "recharts";

type ZoomType = {
  startIndex?: number;
  endIndex?: number;
};

type ZoomDataCallback = ({ startIndex, endIndex }: ZoomType) => void;

type WheelEvent = {
  preventDefault: () => void;
  deltaX: number;
  deltaY: number;
  clientX: number;
  target: EventTarget & { getBoundingClientRect: () => DOMRect };
};

type KeyEvent = {
  key: string;
  preventDefault: () => void;
};

const onZoom = (zoom: ZoomType) => {
  // do
};

const Graph = () => {
  const [data, setData] = useState(generateRandomData(20));
  const [zoom, setZoom] = useState<ZoomType | null>(null);
  const [deltaAccumulatorY, setDeltaAccumulatorY] = useState(0);
  const [deltaAccumulatorX, setDeltaAccumulatorX] = useState(0);
  const graphRef = useRef<HTMLElement>(null);
  const [activeAnimations, setActiveAnimations] = useState(true);

  const [minValue, maxValue] = [0, data.length - 1];
  const { startIndex, endIndex } = (zoom ?? {
    startIndex: minValue,
    endIndex: maxValue,
  }) as { startIndex: number; endIndex: number };

  const handleWheelScrolling = useCallback(
    (event: WheelEvent | KeyEvent, zoomIn?: boolean) => {
      event.preventDefault();

      if (activeAnimations) {
        // setActiveAnimations(false)
      }

      const zoomThreshold = Math.floor(0.15 * data.length);
      const panThreshold = Math.floor(0.1 * data.length);
      const gap = Math.floor(0.05 * data.length);
      const graphGrowthRate = 1.5;

      const processGap = (percentage: number, gap: number): number =>
        Math.round(percentage * gap);
      const smoothZoom = (value: number): number =>
        value < 0.5
          ? Math.pow(value * 2, 2) / 2
          : 1 - Math.pow((1 - value) * 2, 2) / 2;

      let zoomFactor = 0.5;

      let accumulatedDeltaX =
        deltaAccumulatorX + ("deltaX" in event ? event.deltaX : 0);
      let accumulatedDeltaY =
        deltaAccumulatorY +
        ("deltaY" in event
          ? event.deltaY
          : zoomIn
            ? zoomThreshold
            : -zoomThreshold);

      if ("deltaY" in event) {
        const container = event.target.getBoundingClientRect();
        const mouseX = event.clientX - container.left;
        const containerWidth = container.width;
        zoomFactor = smoothZoom(mouseX / containerWidth);
      }

      if (accumulatedDeltaX > panThreshold) {
        setZoom({
          ...zoom,
          startIndex: Math.min(maxValue, startIndex + 1),
          endIndex: Math.min(maxValue, endIndex + 1),
        });
        accumulatedDeltaX = 0;
      } else if (accumulatedDeltaX < -panThreshold) {
        setZoom({
          ...zoom,
          startIndex: Math.max(minValue, startIndex - 1),
          endIndex: Math.max(minValue, endIndex - 1),
        });
        accumulatedDeltaX = 0;
      }

      if (accumulatedDeltaY >= zoomThreshold) {
        const updatedZoom = {
          startIndex: Math.max(
            minValue,
            startIndex - processGap(zoomFactor, gap),
          ),
          endIndex: Math.min(
            maxValue,
            endIndex + processGap(1 - zoomFactor, gap),
          ),
        };
        if (
          data.length < 1000 &&
          Math.abs(updatedZoom.startIndex - updatedZoom.endIndex) >
            data.length * 0.8
        ) {
          setData(generateRandomData(data.length * graphGrowthRate));
        }
        setZoom({
          ...zoom,
          ...updatedZoom,
        });
        accumulatedDeltaY = 0;
      } else if (accumulatedDeltaY <= -zoomThreshold) {
        if (Math.abs(startIndex - endIndex) > gap * 1.5) {
          const updatedZoom = {
            startIndex: Math.min(
              data.length - 2,
              startIndex + processGap(zoomFactor, gap),
            ),
            endIndex: Math.max(1, endIndex - processGap(1 - zoomFactor, gap)),
          };
          if (
            data.length > 100 &&
            Math.abs(updatedZoom.startIndex - updatedZoom.endIndex) <
              data.length * 0.2
          ) {
            setData(
              generateRandomData(Math.floor(data.length / graphGrowthRate)),
            );
            setZoom({
              startIndex: 0,
              endIndex: Math.floor(data.length / graphGrowthRate) - 1,
            });
          } else {
            setZoom({
              ...zoom,
              ...updatedZoom,
            });
          }
        }
        accumulatedDeltaY = 0;
      }

      setDeltaAccumulatorX(accumulatedDeltaX);
      setDeltaAccumulatorY(accumulatedDeltaY);
    },
    [
      data,
      zoom,
      deltaAccumulatorX,
      deltaAccumulatorY,
      activeAnimations,
      endIndex,
      maxValue,
      minValue,
      startIndex,
    ],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        handleWheelScrolling(event, true);
      } else if (event.key === "-") {
        handleWheelScrolling(event, false);
      }
    },
    [handleWheelScrolling],
  );

  useEffect(() => {
    const graphElement = graphRef.current;
    document.addEventListener("keydown", handleKeyPress);
    graphElement?.addEventListener(
      "wheel",
      (event) =>
        handleWheelScrolling(event as unknown as WheelEvent | KeyEvent),
      {
        passive: false,
      },
    );
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      graphElement?.removeEventListener("wheel", (event) =>
        handleWheelScrolling(event as unknown as WheelEvent | KeyEvent),
      );
    };
  }, [handleKeyPress, handleWheelScrolling]);

  const handleBrushChange = useCallback<ZoomDataCallback>(
    (updatedZoom: ZoomType) => {
      setZoom(updatedZoom);
      if (onZoom) onZoom(updatedZoom);
    },
    [setZoom],
  );

  return (
    <div ref={graphRef}>
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
          height={30}
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
          onChange={handleBrushChange}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </BarChart>
    </div>
  );
};

export default Graph;
