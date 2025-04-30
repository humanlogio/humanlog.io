import { Arr, Table } from "api/js/types/v1/types_pb";
import { Query } from "api/js/types/v1/query_pb";
import { QueryHistoryEntry } from "api/js/types/v1/query_history_entry_pb";
import { useInfiniteQuery } from "@/lib/utils/useInfiniteQuery";
import { useEffect, useState, useMemo, useCallback } from "react";
import { formatTimestamp } from "@/lib/utils/formatTimeStamp";
import { Loader } from "lucide-react";
import { ConnectError } from "@connectrpc/connect";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistogramProps {
  query: Query | undefined;
  providedData?: Table;
  queryHistoryEntry?: QueryHistoryEntry;
}

interface HistogramDataPoint {
  timestamp: string;
  formattedTime: string;
  bucket: number;
  count: number;
}

interface ProcessedData {
  timePoints: string[];
  bucketValues: number[];
  heatmapData: HistogramDataPoint[];
  maxCount: number;
}

export default function Histogram({
  query,
  providedData,
  queryHistoryEntry,
}: HistogramProps) {
  const [data, setData] = useState<Table | undefined>(providedData);
  const [timeColumns, setTimeColumns] = useState<string[]>([]);
  const [items, setItems] = useState<Arr[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredBucket, setHoveredBucket] = useState<number | null>();
  const [hoveredTime, setHoveredTime] = useState<string | null>();

  const { targetRef, fetchData, next } = useInfiniteQuery(query);

  useEffect(() => {
    if (!query && !providedData) return;

    setLoading(true);

    if (providedData) {
      processProvidedData(providedData);
      setLoading(false);
    } else {
      fetchData(({ value: shapeValue }) => {
        try {
          if (shapeValue?.rows) {
            const loadedItems: Arr[] = shapeValue.rows;

            const timeColumns: string[] = [];
            loadedItems.forEach((item) => {
              item.items.forEach((val) => {
                if (val.kind.case === "ts") {
                  timeColumns.push(
                    formatTimestamp(val.kind.value, "MMM D HH:mm:ss.SSS"),
                  );
                }
              });
            });

            setTimeColumns(timeColumns);
            setItems(loadedItems);
            setData(shapeValue);
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
        }
      });
    }
  }, [query, providedData]);

  const processProvidedData = (data: Table) => {
    try {
      if (data?.rows) {
        const loadedItems: Arr[] = data.rows;

        const timeColumns: string[] = [];
        loadedItems.forEach((item) => {
          item.items.forEach((val) => {
            if (val.kind.case === "ts") {
              timeColumns.push(
                formatTimestamp(val.kind.value, "MMM D HH:mm:ss.SSS"),
              );
            }
          });
        });

        setTimeColumns(timeColumns);
        setItems(loadedItems);
      }
    } catch (error) {}
  };

  const processedData = useMemo<ProcessedData>(() => {
    if (!items || items.length === 0) {
      return { timePoints: [], bucketValues: [], heatmapData: [], maxCount: 0 };
    }

    try {
      const histogramPoints: HistogramDataPoint[] = [];

      items.forEach((item, i) => {
        let timestamp = "";
        let formattedTime = timeColumns[i] || "";

        if (item.items[0]?.kind.case === "ts") {
          const tsValue = item.items[0]?.kind.value;
          timestamp = tsValue.toDate().toISOString();
        }

        if (item.items[1]?.kind.case === "map") {
          const entries = item.items[1].kind.value.entries;

          entries.forEach((entry) => {
            let bucket = 0;
            let count = 0;

            if (entry.key?.kind.case === "i64") {
              bucket = Number(entry.key.kind.value);
            }

            if (entry.value?.kind.case === "i64") {
              count = Number(entry.value.kind.value);
            }

            histogramPoints.push({
              timestamp,
              formattedTime,
              bucket,
              count,
            });
          });
        }
      });

      const timePoints = [
        ...new Set(histogramPoints.map((point) => point.formattedTime)),
      ];

      const bucketValues = [
        ...new Set(histogramPoints.map((point) => point.bucket)),
      ].reverse();

      const maxCount = Math.max(
        ...histogramPoints.map((point) => point.count),
        0,
      );

      return {
        timePoints,
        bucketValues,
        heatmapData: histogramPoints,
        maxCount,
      };
    } catch (error) {
      return { timePoints: [], bucketValues: [], heatmapData: [], maxCount: 0 };
    }
  }, [items, timeColumns]);

  const getColor = (count: number): string => {
    if (count === 0) return "rgba(59, 130, 246, 0)";

    const ratio = Math.min(1, count / processedData.maxCount);
    return `rgba(59, 130, 246, ${ratio})`;
  };

  const getCellSize = useCallback(() => {
    const size = 300 / processedData.bucketValues.length;
    return `${size}px`;
  }, [items]);

  if (loading) {
    return (
      <div className="mt-28 flex justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (processedData.heatmapData.length === 0) {
    return (
      <div className="p-4 text-center">
        No histogram data was found given that query.
      </div>
    );
  }

  return (
    <div className="overflow-auto p-4">
      <div className="flex items-end justify-between">
        <div>
          {data?.type?.columns.map((col, i) => {
            return (
              <h2 className="text-xl font-semibold" key={i}>
                {col.name}
              </h2>
            );
          })}
        </div>

        <div className="text-xs">
          <p>Time points: {processedData.timePoints.length}</p>
          <p>Bucket count: {processedData.bucketValues.length}</p>
          <p>Max count: {processedData.maxCount}</p>
        </div>
      </div>

      <div className="overflow-x-auto text-xs">
        <div className="flex">
          {/* Y - bucket value */}
          <div className="flex-shrink-0 pr-2">
            <div className="h-8"></div>
            {processedData.bucketValues.map((bucket, i) => (
              <div
                key={i}
                className={`flex items-center justify-end`}
                style={{ height: getCellSize() }}
              >
                {i % (processedData.bucketValues.length / 10) === 0
                  ? bucket
                  : ""}
              </div>
            ))}
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex-1">
                  <div className="flex">
                    {processedData.timePoints.map((time, i) => (
                      <div
                        key={i}
                        className="mt-6 flex-1 origin-bottom-left -rotate-45 transform text-center text-xs"
                      >
                        {/* {time} */}
                      </div>
                    ))}
                  </div>

                  {/* data cell */}
                  {processedData.bucketValues.map((bucket, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {processedData.timePoints.map((time, colIndex) => {
                        const dataPoint = processedData.heatmapData.find(
                          (d) =>
                            d.formattedTime === time && d.bucket === bucket,
                        );

                        return (
                          <div key={colIndex}>
                            <div
                              className={`$ relative flex w-4 flex-1 items-center justify-center`}
                              title={`time: ${time}, bucket: ${bucket}, count: ${dataPoint?.count}`}
                              style={{
                                height: getCellSize(),
                                background: getColor(dataPoint?.count ?? 0),
                              }}
                              onMouseEnter={() => {
                                setHoveredBucket(bucket);
                                setHoveredTime(time);
                              }}
                              onMouseLeave={() => {
                                setHoveredBucket(null);
                                setHoveredTime(null);
                              }}
                            >
                              {hoveredBucket === bucket && (
                                <div className="bg-muted absolute top-1/2 left-1/2 z-1 h-[1px] w-full" />
                              )}
                              {hoveredTime === time && (
                                <div className="bg-muted absolute top-1/2 left-1/2 z-1 h-full w-[1px]" />
                              )}
                              {/* {dataPoint?.count} */}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  {processedData.bucketValues.map((bucket, i) => {
                    const dataPoint = processedData.heatmapData.find(
                      (d) =>
                        d.bucket === bucket && d.formattedTime === hoveredTime,
                    );
                    return (
                      <div
                        key={`${i}-${bucket}`}
                        className={`flex w-32 items-center justify-between text-xs ${bucket === hoveredBucket && "bg-muted"}`}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2"
                            style={{
                              background: getColor(dataPoint?.count ?? 0),
                            }}
                          />
                          <div>{bucket}</div>
                        </div>
                        <div>{dataPoint?.count}</div>
                      </div>
                    );
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* {next && <div ref={targetRef} className="mt-4 h-4" />} */}
    </div>
  );
}
