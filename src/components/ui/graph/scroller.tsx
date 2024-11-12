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
  children: ReactElement | ReactElement[];
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

  const maxAnimationSize = 20;
  const zoomThreshold = 15;
  const panThreshold = 10;
  const rangeMinWidth = 10;
  const gap = Math.min(
    Math.ceil(0.05 * Math.abs(startIndex - endIndex)),
    rangeMinWidth,
  );

  const handleBrushChange = useCallback(
    (updatedZoom: ZoomType, direction?: string) => {
      const { startIndex, endIndex } = updatedZoom;
      let animate = false;

      if (
        typeof startIndex !== "number" ||
        typeof endIndex !== "number" ||
        !Number.isFinite(endIndex)
      ) {
        return;
      }

      if (endIndex < startIndex) {
        return;
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
    [onProcessed],
  );

  const handleWheelScrolling = useCallback(
    (event: WheelEvent | KeyEvent, zoomIn?: boolean) => {
      event.preventDefault();

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
          startIndex: Math.min(startIndex + gap, maxValue - rangeMinWidth),
          endIndex: Math.min(endIndex + gap, maxValue),
        });
        accumulatedDeltaX = 0;
      } else if (accumulatedDeltaX <= -panThreshold) {
        handleBrushChange({
          startIndex: Math.max(startIndex - gap, minValue),
          endIndex: Math.max(endIndex - gap, minValue + rangeMinWidth),
        });
        accumulatedDeltaX = 0;
      }

      if (accumulatedDeltaY >= zoomThreshold) {
        handleBrushChange(
          {
            startIndex: Math.max(
              startIndex - processGap(zoomFactor, gap),
              minValue,
            ),
            endIndex: Math.min(
              endIndex + processGap(1 - zoomFactor, gap),
              maxValue,
            ),
          },
          "out",
        );
        accumulatedDeltaY = 0;
      } else if (accumulatedDeltaY <= -zoomThreshold) {
        if (Math.abs(startIndex - endIndex) > rangeMinWidth) {
          handleBrushChange(
            {
              startIndex: startIndex + processGap(zoomFactor, gap),
              endIndex: endIndex - processGap(1 - zoomFactor, gap),
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
      gap,
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
