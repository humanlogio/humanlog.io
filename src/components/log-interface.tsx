import React, { useCallback, useEffect, useRef, useState } from "react";
import { Share } from "lucide-react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import SessionContainer, {
  LogEventGroup,
} from "@/components/sortable/session-container";
import { useFullWidth } from "@/context/full-width-provider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SetupGuide from "@/components/setup-guide";
import Graph, { DataPoint, ZoomType } from "@/components/ui/graph/graph";
import { useAllEnvironments } from "@/context/list-environments";
import { useApiClients } from "@/context/api-provider";
import { SummarizeEventsResponse_Bucket } from "api/js/svc/query/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";
import DateRangePicker from "@/components/ui/graph/dateRangePicker";
import { useDebouncer } from "@/lib/utils/useDebouncer";
import { GRAPH_RANGE_MIN_WIDTH } from "@/components/ui/graph/scroller";

const LogInterface = ({ env }: { env?: string }) => {
  const signupOnly = process.env.NEXT_PUBLIC_SIGNUP_ONLY === "true";
  const [isPretty, setIsPretty] = useState(true);
  const { isFullWidth } = useFullWidth();
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const { apiClients, activeEnvironment, setActiveEnvironment } =
    useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    // new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
    new Date(new Date().valueOf() - 1000 * 60 * 10),
  );
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );
  const [graphRange, setGraphRange] = useState<{
    startDate: Date;
    endDate: Date;
  }>({ startDate, endDate: new Date() });
  const [sessions, setSessions] = useState<LogEventGroup[] | null>(null);
  const [queryString, setQueryString] = useState<string>("");

  const formatToDateString = (time: Timestamp, diff: number) => {
    if (diff > 1000 * 60 * 60 * 24 * 30 * 12 * 2) {
      // years
      return time.toDate().toLocaleDateString("en-US", {
        year: "numeric",
      });
    }
    if (diff > 1000 * 60 * 60 * 24 * 30 * 2) {
      // months
      return time.toDate().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
    if (diff > 1000 * 60 * 60 * 24 * 7) {
      // days
      return time.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
    }
    if (diff > 1000 * 60 * 60 * 24 * 2) {
      // weekday
      return time.toDate().toLocaleDateString("en-US", {
        weekday: "short",
        dayPeriod: "short",
      });
    }
    if (diff > 1000 * 60 * 10) {
      // hours
      return time.toDate().toLocaleTimeString("en-US", {
        hourCycle: "h24",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // minutes
    return time.toDate().toLocaleTimeString("en-US", {
      hourCycle: "h24",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const closestIndex = (
    buckets: SummarizeEventsResponse_Bucket[],
    targetDate: Date,
  ) =>
    buckets.reduce((closest, bucket, index) => {
      const currentTs = bucket.ts?.toDate();
      if (!currentTs) return closest;

      const currentDiff = Math.abs(currentTs.getTime() - targetDate.getTime());
      const closestTime = buckets[closest]?.ts?.toDate()?.getTime();
      if (!closestTime) {
        return index;
      }

      const closestDiff = Math.abs(closestTime - targetDate.getTime());

      return currentDiff < closestDiff ? index : closest;
    }, 0);

  const convertToGraphDataPoints = useCallback(
    (buckets: SummarizeEventsResponse_Bucket[]) => {
      const diff = Math.abs(
        startDate.getTime() - (endDate ?? new Date()).getTime(),
      );
      return buckets
        .filter((data) => data?.ts)
        .map((data, i) => ({
          dayNumber: i,
          name: formatToDateString(
            data?.ts ?? convertToTimestamp(new Date()),
            diff,
          ),
          date: data.ts!.toDate(),
          amt: Number(data.eventCount),
        }));
    },
    [startDate, endDate],
  );

  const convertToTimestamp = (date: Date) =>
    new Timestamp({
      seconds: BigInt(Math.floor(date.getTime() / 1000)),
      nanos: (date.getTime() % 1000) * 1e6,
    });

  const abortControllerRef = useRef<AbortController>();
  const createNewSession = useCallback(() => {
    queryString &&
      (async () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const { signal } = controller;

        try {
          const stream = apiClients?.query.watchQuery({
            environmentId: activeEnvironment,
            query: {
              from: convertToTimestamp(startDate),
              to: (endDate && convertToTimestamp(endDate)) || undefined,
            },
          });
          if (!stream) {
            return;
          }
          for await (const response of stream) {
            if (signal.aborted) {
              break;
            }
            if (!response.events.length) {
              continue;
            }
            setSessions(
              response.events.map((event) => {
                return {
                  ...event,
                  isStreaming: !endDate,
                };
              }),
            );
          }

          return () => {
            controller.abort();
          };
        } catch (e) {
          if (signal.aborted) {
            console.log("Stream aborted");
          } else {
            console.error("Fetch error:", e);
          }
        }
      })();
  }, [activeEnvironment, apiClients?.query, endDate, startDate, queryString]);

  const updateGraphRange = useCallback(
    (
      zoomStartDate: Date,
      zoomEndDate: Date | null,
      targetStart?: Date,
      targetEnd?: Date,
    ) => {
      (async () => {
        try {
          const events = await apiClients?.query.summarizeEvents({
            environmentId: activeEnvironment,
            from: convertToTimestamp(targetStart ?? graphRange.startDate),
            to: convertToTimestamp(targetEnd ?? graphRange.endDate),
            bucketCount,
          });
          if (events) {
            setEvents(convertToGraphDataPoints(events.buckets));
            setGraphRange({
              startDate: targetStart ?? graphRange.startDate,
              endDate: targetEnd ?? graphRange.endDate,
            });
            setZoom({
              startIndex: closestIndex(events.buckets, zoomStartDate),
              endIndex:
                (zoomEndDate && closestIndex(events.buckets, zoomEndDate)) ??
                events.buckets.length - 1,
            });
          }
        } catch (e) {
          console.log("it crashed", e);
        }
      })();
    },
    [
      apiClients?.query,
      activeEnvironment,
      bucketCount,
      graphRange.startDate,
      graphRange.endDate,
      convertToGraphDataPoints,
    ],
  );

  const updateTimeFrame = useDebouncer(
    (zoom: ZoomType) => {
      if (!eventsList) {
        return;
      }

      setZoom(zoom);

      const { startIndex, endIndex } = zoom;
      const listSize = eventsList.length;
      const borderRange = 0.05;
      const graphGapRate = 0.3;

      let zoomStart: Date = startDate;
      let zoomEnd: Date | null = endDate;
      let targetGraphStart: Date | undefined;
      let targetGraphEnd: Date | undefined;

      if (
        typeof startIndex === "number" &&
        eventsList[Math.floor(startIndex)]?.date
      ) {
        zoomStart = eventsList[Math.floor(startIndex)].date;
        setStartDate(zoomStart);

        if (startIndex / listSize <= borderRange) {
          targetGraphStart = new Date(
            graphRange.startDate.getTime() -
              Math.floor(
                Math.abs(
                  graphRange.endDate.getTime() - graphRange.startDate.getTime(),
                ) * graphGapRate,
              ),
          );
        }
      }

      if (
        typeof endIndex === "number" &&
        eventsList[Math.floor(endIndex)]?.date
      ) {
        zoomEnd = eventsList[Math.floor(endIndex)].date;
        setEndDate(zoomEnd);

        if (endIndex / listSize >= 1 - borderRange) {
          targetGraphEnd = new Date(
            graphRange.endDate.getTime() +
              Math.floor(
                Math.abs(
                  graphRange.endDate.getTime() - graphRange.startDate.getTime(),
                ) * graphGapRate,
              ),
          );
        }
      }

      if (
        typeof startIndex === "number" &&
        typeof endIndex === "number" &&
        (Math.abs(endIndex - startIndex) <= eventsList.length * borderRange ||
          Math.abs(endIndex - startIndex) <= GRAPH_RANGE_MIN_WIDTH)
      ) {
        zoomStart = eventsList[Math.floor(startIndex)].date;
        zoomEnd = eventsList[Math.floor(endIndex)].date;

        const diff = Math.floor(
          Math.abs(zoomEnd.getTime() - zoomStart.getTime()) / 2,
        );

        targetGraphStart = new Date(zoomStart.getTime() - diff);
        targetGraphEnd = new Date(zoomEnd.getTime() + diff);
      }

      if (targetGraphStart || targetGraphEnd) {
        updateGraphRange(zoomStart, zoomEnd, targetGraphStart, targetGraphEnd);
      }
    },
    [
      eventsList,
      startDate,
      endDate,
      graphRange.startDate,
      graphRange.endDate,
      updateGraphRange,
    ],
  );

  useEffect(() => {
    if (!eventsList) {
      updateGraphRange(startDate, endDate);
    }
  }, [eventsList, startDate, endDate, updateGraphRange]);

  useEffect(() => {
    if (env) {
      setActiveEnvironment(env);
    }
  }, [env]);

  return (
    <section className="container-h-full flex flex-col gap-4 overflow-y-hidden py-8">
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <SetupGuide />
      ) : (
        <>
          <div className="container grid flex-none grid-cols-2 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h1 className="text-2xl font-bold">
                Lorem ipsum dolor sit amet consectetur
              </h1>
              <p className="mt-2 text-slate-500">subtitle</p>
              <div className="ml-[4px] mt-4 flex flex-row gap-2">
                <AutosizeTextarea
                  maxHeight={160}
                  placeholder="Type to search"
                  value={queryString}
                  onChange={(event) => setQueryString(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      createNewSession();
                    }
                  }}
                />
                <Button size="icon" className="h-8" onClick={createNewSession}>
                  <Share size={14} />
                </Button>
              </div>
            </div>
            <div className="col-span-2 space-y-8 md:col-span-1">
              <Graph data={eventsList} zoom={zoom} onZoom={updateTimeFrame} />

              <DateRangePicker
                dateFrom={startDate}
                dateTo={endDate}
                setDateFrom={setStartDate}
                setDateTo={setEndDate}
              />
            </div>
          </div>
          <div
            className={cn(
              "mx-auto flex w-full flex-grow flex-col gap-4 overflow-y-auto px-4 transition-all duration-300",
              isFullWidth ? "max-w-full" : "max-w-screen-xl",
            )}
          >
            <div className="flex flex-none flex-row items-center gap-2">
              <Label
                htmlFor="pretty"
                className={cn("transition-colors duration-200", {
                  "text-slate-500": isPretty,
                })}
              >
                Raw
              </Label>
              <Switch
                id="pretty"
                checked={isPretty}
                onCheckedChange={setIsPretty}
              />
              <Label
                htmlFor="pretty"
                className={cn("transition-colors duration-200", {
                  "text-slate-500": !isPretty,
                })}
              >
                Pretty
              </Label>
            </div>
            <SessionContainer sessions={sessions} />
          </div>
        </>
      )}
    </section>
  );
};

export default LogInterface;
