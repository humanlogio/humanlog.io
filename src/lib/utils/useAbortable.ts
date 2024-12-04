import { useRef, useCallback } from "react";

export const useAbortable = <
  T extends (signal: AbortSignal) => (...args: any[]) => Promise<void>,
>(
  asyncFunction: T,
  deps: React.DependencyList,
): ((...args: Parameters<T>) => void) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  return useCallback(async (...args: Parameters<T>) => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await asyncFunction(controller.signal)(...args);
    } catch (error) {
      if (controller.signal.aborted) {
        console.log("Request aborted");
      } else {
        console.error("Error in request:", error);
      }
    }

    return () => {
      controller.abort();
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};
