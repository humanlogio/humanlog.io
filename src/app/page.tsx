"use client";

import React, { useEffect, useState } from "react";
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
  const [eventsList, setEvents] = useState<DataPoint[] | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { apiClients, activeAccount } = useApiClients();

  const updateTimeFrame = (zoom: ZoomType) => {
    // this is where we turn the zoom index into start and end date
  };

  const convertTsToDate = (date: Timestamp): Date => {
    return new Date();
  };

  const convertDateToTimestamp = (date: Date): Timestamp => {
    return new Timestamp();
  };

  const convertToGraphDataPoints = (
    buckets: SummarizeEventsResponse_Bucket[],
  ) => {
    return buckets
      .filter((data) => data?.ts)
      .map((data, i) => ({
        dayNumber: i,
        name: convertTsToDate(data.ts!).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }),
        date: convertTsToDate(data.ts!),
        amt: data.eventCount,
      }));
  };

  useEffect(() => {
    (async () => {
      const events = await apiClients?.query.summarizeEvents({
        accountId: activeAccount,
        from: convertDateToTimestamp(startDate),
        to: (endDate && convertDateToTimestamp(endDate)) || undefined,
      });
      if (events) {
        setEvents(convertToGraphDataPoints(events.buckets));
      }
    })();
  }, [apiClients?.query, activeAccount, startDate, endDate]);

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col py-8">
      {false && (signupOnly || (!hasLocalhost && !listAccounts.length)) ? (
        <SetupGuide />
      ) : (
        <div className="flex flex-grow flex-col gap-4 overflow-y-hidden">
          <div className="mx-auto grid w-full max-w-screen-xl flex-none grid-cols-2 gap-8 px-4">
            <div className="col-span-2 md:col-span-1">
              <h1 className="text-2xl font-bold">
                Lorem ipsum dolor sit amet consectetur
              </h1>
              <p className="mt-2 text-slate-500">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
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
              <Graph data={eventsList} onZoom={updateTimeFrame} />
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
