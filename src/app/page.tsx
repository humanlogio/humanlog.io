"use client";

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
import { useAllEnvironments } from "@/context/listEnvironments";
import { useApiClients } from "@/context/api-provider";
import { SummarizeEventsResponse_Bucket } from "api/js/svc/query/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";
import DateRangePicker from "@/components/ui/graph/dateRangePicker";

export default function Home() {
  const signupOnly = process.env.NEXT_PUBLIC_SIGNUP_ONLY === "true";
  const [isPretty, setIsPretty] = useState(true);
  const { isFullWidth } = useFullWidth();
  const { hasLocalhost, listEnvironments } = useAllEnvironments();
  const { apiClients, activeEnvironment } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(10000);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    // new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
    new Date(new Date().valueOf() - 1000 * 60),
  );
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );
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
        year: "2-digit",
      });
    }
    if (diff > 1000 * 60 * 60 * 24 * 7) {
      // days
      return time.toDate().toLocaleDateString("en-US", {
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
    if (diff > 1000 * 60 * 60 * 2) {
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
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const convertToGraphDataPoints = useCallback(
    (buckets: SummarizeEventsResponse_Bucket[]) => {
      const diff = Math.abs(
        startDate.getTime() - (endDate ?? new Date()).getTime(),
      );
      console.log({ diff });
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

  const updateEvents = useCallback(() => {
    (async () => {
      try {
        const timeGap = Math.abs(
          (endDate ?? new Date()).getTime() - startDate.getTime(),
        );
        const events = await apiClients?.query.summarizeEvents({
          environmentId: activeEnvironment,
          from: convertToTimestamp(
            new Date(startDate.getTime() + Math.floor(timeGap / 2)),
          ),
          to:
            (endDate &&
              convertToTimestamp(
                new Date(endDate.getTime() + Math.floor(timeGap / 2)),
              )) ||
            undefined,
          bucketCount,
        });
        if (events) {
          // TODO: set time range to closes bucket with similar time values
          console.log(
            "settings events from",
            events.buckets[0]?.ts?.toDate(),
            "to",
            events.buckets[events.buckets.length - 1]?.ts?.toDate(),
          );
          setEvents(convertToGraphDataPoints(events.buckets));
        }
      } catch (e) {
        console.log("it crahsed", e);
      }
    })();
  }, [
    apiClients?.query,
    activeEnvironment,
    bucketCount,
    startDate,
    endDate,
    convertToGraphDataPoints,
  ]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const updateTimeFrame = useCallback(
    (zoom: ZoomType) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        if (!eventsList) {
          return;
        }

        setZoom(zoom);

        if (zoom.startIndex && eventsList[Math.floor(zoom.startIndex)]?.date) {
          setStartDate(eventsList[Math.floor(zoom.startIndex)].date);
        }

        if (zoom.endIndex && eventsList[Math.floor(zoom.endIndex)]?.date) {
          setEndDate(eventsList[Math.floor(zoom.endIndex)].date);
        }

        console.log("checking should we re-query", zoom);
        if (typeof zoom.startIndex === "number" && zoom.startIndex < 5) {
          // TODO: query when we have reached a min or max scroll value
          console.log(
            "updating events",
            eventsList[Math.floor(zoom.startIndex)]?.date,
            "to",
            typeof zoom.endIndex === "number"
              ? (eventsList[Math.floor(zoom.endIndex)]?.date ?? "undefined")
              : "undefined",
          );
          updateEvents();
        }
      }, 400);
    },
    [eventsList, updateEvents],
  );

  useEffect(() => {
    if (!eventsList) {
      updateEvents();
    }
  }, [eventsList, updateEvents]);

  return (
    <main className="flex h-[calc(100dvh-56px)] flex-col py-8">
      {signupOnly || (!hasLocalhost && !listEnvironments.length) ? (
        <SetupGuide />
      ) : (
        <div className="flex flex-grow flex-col gap-4 overflow-y-hidden">
          <div className="mx-auto grid w-full max-w-screen-xl flex-none grid-cols-2 gap-8 px-4">
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
              <Graph data={eventsList} onZoom={updateTimeFrame} />

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
              "mx-auto flex w-full flex-grow flex-col gap-4 overflow-hidden px-4 transition-all duration-300",
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
        </div>
      )}
    </main>
  );
}
