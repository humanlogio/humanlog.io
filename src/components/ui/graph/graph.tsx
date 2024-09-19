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

type WheelEvent = {
  preventDefault: () => void;
  deltaX: number;
  deltaY: number;
  clientX: number;
  currentTarget: EventTarget & { getBoundingClientRect: () => DOMRect };
};

type KeyEvent = {
  key: string;
  preventDefault: () => void;
};

const Graph = (onZoom: (zoom: ZoomType) => void) => {
  const [data, setData] = useState(generateRandomData(50));
  const [zoom, setZoom] = useState<ZoomType | null>(null);
  const [minValue, maxValue] = [0, data.length - 1];
  const { startIndex, endIndex } = {
    startIndex: zoom?.startIndex ?? maxValue - 20,
    endIndex: zoom?.endIndex ?? maxValue,
  } as { startIndex: number; endIndex: number };

  const requeryDataChange = 0.35;
  const graphGrowthRate = 1.5;
  const handleBrushChange = useCallback(
    (updatedZoom: ZoomType, direction?: string) => {
      const { startIndex, endIndex } = updatedZoom;

      if (
        typeof startIndex !== "number" ||
        typeof endIndex !== "number" ||
        !Number.isFinite(endIndex)
      ) {
        return;
      }

      if (
        direction === "out" &&
        maxValue < 400 &&
        Math.abs(startIndex - endIndex) > maxValue * (1 - requeryDataChange)
      ) {
        setData(generateRandomData(maxValue * graphGrowthRate));
      } else if (
        direction === "in" &&
        maxValue > 20 &&
        Math.abs(startIndex - endIndex) < maxValue * requeryDataChange
      ) {
        updatedZoom.startIndex = 0;
        updatedZoom.endIndex = maxValue / graphGrowthRate - 1;
        setData(generateRandomData(maxValue / graphGrowthRate));
      }

      updatedZoom.startIndex = Math.floor(updatedZoom.startIndex as number);
      updatedZoom.endIndex = Math.floor(updatedZoom.endIndex as number);
      if (updatedZoom.endIndex < updatedZoom.startIndex) {
        const temp = updatedZoom.startIndex;
        updatedZoom.startIndex = updatedZoom.endIndex;
        updatedZoom.endIndex = temp;
      }

      setZoom(updatedZoom);
      if (typeof onZoom === "function") onZoom(updatedZoom);
    },
    [data, setZoom, onZoom],
  );

  const [deltaAccumulatorY, setDeltaAccumulatorY] = useState(0);
  const [deltaAccumulatorX, setDeltaAccumulatorX] = useState(0);
  const [activeAnimations, setActiveAnimations] = useState(true);
  const maxAnimationSize = 20;
  const handleWheelScrolling = useCallback(
    (event: WheelEvent | KeyEvent, zoomIn?: boolean) => {
      event.preventDefault();

      if (
        activeAnimations &&
        Math.abs(startIndex - endIndex) > maxAnimationSize
      ) {
        setActiveAnimations(false);
      } else if (
        !activeAnimations &&
        Math.abs(startIndex - endIndex) <= maxAnimationSize
      ) {
        setActiveAnimations(true);
      }

      const zoomThreshold = 5;
      const panThreshold = 5;
      const gap = Math.ceil(0.1 * Math.abs(startIndex - endIndex));

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
        const container = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - container.left;
        const containerWidth = container.width;
        zoomFactor = smoothZoom(mouseX / containerWidth);
      }

      if (accumulatedDeltaX >= panThreshold) {
        handleBrushChange({
          startIndex: Math.min(maxValue, startIndex + gap),
          endIndex: Math.min(maxValue, endIndex + gap),
        });
        accumulatedDeltaX = 0;
      } else if (accumulatedDeltaX <= -panThreshold) {
        handleBrushChange({
          startIndex: Math.max(minValue, startIndex - gap),
          endIndex: Math.max(minValue, endIndex - gap),
        });
        accumulatedDeltaX = 0;
      }

      if (accumulatedDeltaY >= zoomThreshold) {
        handleBrushChange(
          {
            startIndex: Math.max(
              minValue,
              startIndex - processGap(zoomFactor, gap),
            ),
            endIndex: Math.min(
              maxValue,
              endIndex + processGap(1 - zoomFactor, gap),
            ),
          },
          "out",
        );
        accumulatedDeltaY = 0;
      } else if (accumulatedDeltaY <= -zoomThreshold) {
        if (Math.abs(startIndex - endIndex) > gap * 1.5) {
          handleBrushChange(
            {
              startIndex: Math.min(
                maxValue - 1,
                startIndex + processGap(zoomFactor, gap),
              ),
              endIndex: Math.max(1, endIndex - processGap(1 - zoomFactor, gap)),
            },
            "in",
          );
        }
        accumulatedDeltaY = 0;
      }

      setDeltaAccumulatorX(accumulatedDeltaX);
      setDeltaAccumulatorY(accumulatedDeltaY);
    },
    [
      zoom,
      data,
      deltaAccumulatorX,
      deltaAccumulatorY,
      activeAnimations,
      handleBrushChange,
    ],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        handleWheelScrolling(event, true);
      } else if (event.key === "-" || event.key === "_") {
        handleWheelScrolling(event, false);
      }
    },
    [handleWheelScrolling],
  );

  const graphRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const callPassiveWheel = (event: unknown) =>
      handleWheelScrolling(event as WheelEvent | KeyEvent);
    const graphElement = graphRef.current;
    document.addEventListener("keydown", handleKeyPress);
    graphElement?.addEventListener("wheel", callPassiveWheel, {
      passive: false,
    });
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      graphElement?.removeEventListener("wheel", callPassiveWheel);
    };
  }, [handleKeyPress, handleWheelScrolling]);

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
