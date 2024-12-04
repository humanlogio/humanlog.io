import { useRef, useCallback } from "react";

export const useAbortable = <
  T extends (...args: Parameters<any>[]) => Promise<void>,
>(
  asyncFunction: (signal: AbortSignal) => T,
  deps: React.DependencyList,
): ((...args: Parameters<T>) => Promise<void>) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  return useCallback(async (...args) => {
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
    } finally {
      controller.abort();
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};
