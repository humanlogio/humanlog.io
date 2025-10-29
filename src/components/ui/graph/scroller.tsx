import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { ZoomType } from "@/components/ui/graph/graph";
import { useDebouncer } from "@/hooks/useDebouncer";

export const GRAPH_RANGE_MIN_WIDTH = 10;
const PAN_THRESHOLD = 10;
const ZOOM_THRESHOLD = 15;
const MAX_ANIMATION_SIZE = 20;

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
  minValue: number;
  maxValue: number;
  startIndex: number;
  endIndex: number;
  lockScroll: boolean;
  children: ReactElement | ReactElement[];
  onProcessed: (zoom: ZoomType, animate: boolean) => void;
}) => {
  const {
    minValue,
    maxValue,
    startIndex,
    endIndex,
    lockScroll,
    children,
    onProcessed,
  } = props;
  const [deltaAccumulatorY, setDeltaAccumulatorY] = useState(0);
  const [deltaAccumulatorX, setDeltaAccumulatorX] = useState(0);
  const [scrollingDirection, setDirection] = useState("");
  const graphRef = useRef<HTMLDivElement>(null);

  const gap = Math.min(
    Math.ceil(0.05 * Math.abs(startIndex - endIndex)),
    GRAPH_RANGE_MIN_WIDTH,
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

      if (animate && Math.abs(startIndex - endIndex) > MAX_ANIMATION_SIZE) {
        animate = false;
      } else if (
        !animate &&
        Math.abs(startIndex - endIndex) <= MAX_ANIMATION_SIZE
      ) {
        animate = true;
      }

      onProcessed(updatedZoom, animate);
    },
    [onProcessed],
  );

  const resetDirectionLock = useDebouncer(() => setDirection(""), []);

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
            ? ZOOM_THRESHOLD
            : -ZOOM_THRESHOLD);

      if ("deltaY" in event) {
        const container = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - container.left;
        const containerWidth = container.width;
        zoomFactor = smoothZoom(mouseX / containerWidth);
      }

      if (!lockScroll || scrollingDirection !== "y") {
        if (accumulatedDeltaX >= PAN_THRESHOLD) {
          handleBrushChange({
            startIndex: Math.min(
              startIndex + gap,
              maxValue - GRAPH_RANGE_MIN_WIDTH,
            ),
            endIndex: Math.min(endIndex + gap, maxValue),
          });
          setDirection("x");
          accumulatedDeltaX = 0;
        } else if (accumulatedDeltaX <= -PAN_THRESHOLD) {
          handleBrushChange({
            startIndex: Math.max(startIndex - gap, minValue),
            endIndex: Math.max(
              endIndex - gap,
              minValue + GRAPH_RANGE_MIN_WIDTH,
            ),
          });
          setDirection("x");
          accumulatedDeltaX = 0;
        }
      }

      if (!lockScroll || scrollingDirection !== "x") {
        if (accumulatedDeltaY >= ZOOM_THRESHOLD) {
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
          setDirection("y");
          accumulatedDeltaY = 0;
        } else if (accumulatedDeltaY <= -ZOOM_THRESHOLD) {
          if (Math.abs(startIndex - endIndex) > GRAPH_RANGE_MIN_WIDTH) {
            handleBrushChange(
              {
                startIndex: startIndex + processGap(zoomFactor, gap),
                endIndex: endIndex - processGap(1 - zoomFactor, gap),
              },
              "in",
            );
          }
          setDirection("y");
          accumulatedDeltaY = 0;
        }
      }

      setDeltaAccumulatorX(accumulatedDeltaX);
      setDeltaAccumulatorY(accumulatedDeltaY);
      resetDirectionLock();
    },
    [
      gap,
      deltaAccumulatorX,
      deltaAccumulatorY,
      lockScroll,
      scrollingDirection,
      startIndex,
      endIndex,
      minValue,
      maxValue,
      handleBrushChange,
      resetDirectionLock,
    ],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore keyboard events when textarea or input is focused
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      ) {
        return;
      }
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
    <div ref={graphRef} className="h-48 w-full">
      {children}
    </div>
  );
};

export default Scroller;
