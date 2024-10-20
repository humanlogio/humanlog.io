"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Share } from "lucide-react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import SessionContainer from "@/components/sortable/session-container";
import { useFullWidth } from "@/context/full-width-provider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SetupGuide from "@/components/setup-guide";
import Graph, { DataPoint, ZoomType } from "@/components/ui/graph/graph";
import { useAllAccounts } from "@/context/listAccounts";
import { useApiClients } from "@/context/api-provider";
import { SummarizeEventsResponse_Bucket } from "api/js/svc/query/v1/service_pb";
import { Timestamp } from "@bufbuild/protobuf";

export default function Home() {
  const signupOnly = process.env.NEXT_PUBLIC_SIGNUP_ONLY === "true";
  const [isPretty, setIsPretty] = useState(true);
  const { isFullWidth } = useFullWidth();
  const { hasLocalhost, listAccounts } = useAllAccounts();
  const { apiClients, activeAccount } = useApiClients();
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [bucketCount, setBucketCount] = useState<number>(100);
  const [startDate, setStartDate] = useState<Date>(
    // starting from one week ago
    new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7),
  );
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [zoom, setZoom] = useState<{ startIndex?: number; endIndex?: number }>(
    {},
  );

  const updateTimeFrame = useCallback((zoom: ZoomType) => {
    // this is where we turn the zoom index into start and end date
    // setStartDate()
    // setEndDate()
    setZoom(zoom);
  }, []);

  const formatToDateString = useCallback(
    (time: Timestamp) => {
      const diff = Math.abs(
        startDate.getTime() - (endDate ?? new Date()).getTime(),
      );
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
    },
    [startDate, endDate],
  );

  const convertToGraphDataPoints = (
    buckets: SummarizeEventsResponse_Bucket[],
  ) => {
    return buckets
      .filter((data) => data?.ts)
      .map((data, i) => ({
        dayNumber: i,
        name: formatToDateString(data?.ts ?? Timestamp.fromDate(new Date())),
        date: data.ts!.toDate(),
        amt: Number(data.eventCount),
      }));
  };

  useEffect(() => {
    (async () => {
      try {
        const events = await apiClients?.query.summarizeEvents({
          accountId: activeAccount,
          from: Timestamp.fromDate(startDate),
          to: (endDate && Timestamp.fromDate(endDate)) || undefined,
          bucketCount,
        });
        if (events) {
          setEvents(convertToGraphDataPoints(events.buckets));
        }
      } catch (e) {
        console.log("it crahsed", e);
      }
    })();
  }, [apiClients?.query, activeAccount, bucketCount, startDate, endDate]);

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col py-8">
      {signupOnly || (!hasLocalhost && !listAccounts.length) ? (
        <SetupGuide />
      ) : (
        <div className="flex flex-grow flex-col gap-4 overflow-y-hidden">
          <div className="mx-auto grid w-full max-w-screen-xl flex-none grid-cols-2 gap-8 px-4">
            <div className="col-span-2 md:col-span-1">
              <h1 className="text-2xl font-bold">
                Lorem ipsum dolor sit amet consectetur
              </h1>
              <p className="mt-2 text-slate-500">
                start: {startDate.toLocaleDateString()}
              </p>
              <p className="mt-2 text-slate-500">
                end: {endDate?.toLocaleDateString() ?? "stream"}
              </p>
              <p className="mt-2 text-slate-500">
                zoom: {zoom.startIndex ?? "x"},{zoom.endIndex ?? "x"}
              </p>
              <input
                type="number"
                onChange={(event) =>
                  setBucketCount(parseInt(event.target.value))
                }
                value={bucketCount}
              />
              <div className="ml-[4px] mt-4 flex flex-row gap-2">
                <AutosizeTextarea
                  maxHeight={160}
                  placeholder="Type to search"
                />
                <Button size="icon" className="h-8">
                  <Share size={14} />
                </Button>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <Graph
                data={eventsList}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                onZoom={updateTimeFrame}
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
            <SessionContainer />
          </div>
        </div>
      )}
    </div>
  );
}
