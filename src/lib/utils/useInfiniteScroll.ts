import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Cursor } from "api/js/types/v1/cursor_pb";

type FetchDataCallback<T> = (params: {
  cursor: Cursor | null;
  limit: number;
}) => Promise<{
  items: T[];
  next: Cursor | null;
}>;

interface UseInfiniteScrollOptions {
  limit?: number;
  initialCursor?: Cursor | null;
}

export function useInfiniteScroll<T>(
  fetchData: FetchDataCallback<T>,
  options: UseInfiniteScrollOptions = {},
) {
  const { limit = 100, initialCursor = null } = options;
  const [data, setData] = useState<T[]>([]);
  const [next, setNext] = useState<Cursor | null>(initialCursor);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { ref: targetRef, inView: fetchNext } = useInView();

  const loadMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetchData({ cursor: next, limit });

      setData((prev) => [...prev, ...response.items]);
      setNext(response.next ?? null);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchData, next, limit, loading]);

  // initial data load
  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    if (fetchNext && !loading && next) {
      loadMore();
    }
  }, [fetchNext, loadMore]);

  return {
    data,
    setData,
    loading,
    error,
    targetRef,
    next,
  };
}
