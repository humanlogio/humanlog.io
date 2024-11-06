import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { DataPoint, ZoomType } from "./graph";

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

const Scroller = (props: {
  data: DataPoint[];
  minValue: number;
  maxValue: number;
  startIndex: number;
  endIndex: number;
  children: ReactElement[];
  onProcessed: (zoom: ZoomType, animate: boolean) => void;
}) => {
  const {
    data,
    minValue,
    maxValue,
    startIndex,
    endIndex,
    children,
    onProcessed,
  } = props;
  const [deltaAccumulatorY, setDeltaAccumulatorY] = useState(0);
  const [deltaAccumulatorX, setDeltaAccumulatorX] = useState(0);
  const graphRef = useRef<HTMLDivElement>(null);

  const requeryDataChange = 0.35;
  const graphGrowthRate = 1.5;
  const maxAnimationSize = 20;

  const handleBrushChange = useCallback(
    (updatedZoom: ZoomType, direction?: string) => {
      const { startIndex, endIndex } = updatedZoom;
      let newData = data;
      let animate = false;

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
        // newData = generateRandomData(maxValue * graphGrowthRate);
      } else if (
        direction === "in" &&
        maxValue > 20 &&
        Math.abs(startIndex - endIndex) < maxValue * requeryDataChange
      ) {
        updatedZoom.startIndex = 0;
        updatedZoom.endIndex = maxValue / graphGrowthRate - 1;
        // newData = generateRandomData(maxValue / graphGrowthRate);
      }

      updatedZoom.startIndex = Math.floor(updatedZoom.startIndex as number);
      updatedZoom.endIndex = Math.floor(updatedZoom.endIndex as number);
      if (updatedZoom.endIndex < updatedZoom.startIndex) {
        const temp = updatedZoom.startIndex;
        updatedZoom.startIndex = updatedZoom.endIndex;
        updatedZoom.endIndex = temp;
      }

      if (animate && Math.abs(startIndex - endIndex) > maxAnimationSize) {
        animate = false;
      } else if (
        !animate &&
        Math.abs(startIndex - endIndex) <= maxAnimationSize
      ) {
        animate = true;
      }

      onProcessed(updatedZoom, animate);
    },
    [data, maxValue, onProcessed],
  );

  const handleWheelScrolling = useCallback(
    (event: WheelEvent | KeyEvent, zoomIn?: boolean) => {
      event.preventDefault();

      const zoomThreshold = 145;
      const panThreshold = 100;
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
          startIndex: Math.min(maxValue - gap, startIndex + gap),
          endIndex: Math.min(maxValue, endIndex + gap),
        });
        accumulatedDeltaX = 0;
      } else if (accumulatedDeltaX <= -panThreshold) {
        handleBrushChange({
          startIndex: Math.max(minValue, startIndex - gap),
          endIndex: Math.max(minValue + gap, endIndex - gap),
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
      deltaAccumulatorX,
      deltaAccumulatorY,
      startIndex,
      endIndex,
      minValue,
      maxValue,
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
    <div ref={graphRef} className="h-64 w-full">
      {children}
    </div>
  );
};

export default Scroller;
