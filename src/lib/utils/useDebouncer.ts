import { useRef, useCallback } from "react";

export const useDebouncer = <T extends (...args: any[]) => void>(
  callback: T,
  deps: React.DependencyList,
  delay: number = 400,
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, deps) as T;
};
