import { QueryTiming } from "@/components/log-interface/index";

interface QueryTimingProps {
  queryTiming: QueryTiming;
  isFetchingNextPage: boolean;
}

export const QueryTimer = ({
  queryTiming,
  isFetchingNextPage,
}: QueryTimingProps) => {
  const { isActive, isCompleted, currentDuration } = queryTiming;
  const displayDuration = currentDuration.toFixed(0);

  return (
    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center gap-2">
        {isActive && (
          <>
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span>Executing query... {displayDuration}ms</span>
          </>
        )}
        {isCompleted && (
          <>
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Completed ({displayDuration}ms)</span>
          </>
        )}
      </div>
      {isFetchingNextPage && (
        <span className="text-blue-500">Fetching next page...</span>
      )}
    </div>
  );
};
