"use client";

import React from "react";
import { useState } from "react";
import { Share } from "lucide-react";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryZoomContainer,
} from "victory";

import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import SessionContainer from "@/components/sortable/session-container";
import { useFullWidth } from "@context/full-width-provider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SetupGuide from "@components/setup-guide";

export default function Home() {
  const [isPretty, setIsPretty] = useState(true);
  const { isFullWidth } = useFullWidth();

  const connected = true;

  // Simulated localhost session logs data
  const sessionLogs = [
    { x: new Date(2023, 8, 1, 0, 0), y: 2 }, // 12:00 AM, 2 sessions
    { x: new Date(2023, 8, 1, 0, 15), y: 5 }, // 12:15 AM, 5 sessions
    { x: new Date(2023, 8, 1, 0, 30), y: 3 }, // 12:30 AM, 3 sessions
    { x: new Date(2023, 8, 1, 0, 45), y: 4 }, // 12:45 AM, 4 sessions
    { x: new Date(2023, 8, 1, 1, 0), y: 7 }, // 1:00 AM, 7 sessions
    { x: new Date(2023, 8, 1, 1, 15), y: 6 }, // 1:15 AM, 6 sessions
    { x: new Date(2023, 8, 1, 1, 30), y: 8 }, // 1:30 AM, 8 sessions
    { x: new Date(2023, 8, 1, 1, 45), y: 10 }, // 1:45 AM, 10 sessions
    { x: new Date(2023, 8, 1, 2, 0), y: 12 }, // 2:00 AM, 12 sessions
    { x: new Date(2023, 8, 1, 2, 15), y: 11 }, // 2:15 AM, 11 sessions
    { x: new Date(2023, 8, 1, 2, 30), y: 9 }, // 2:30 AM, 9 sessions
    { x: new Date(2023, 8, 1, 2, 45), y: 13 }, // 2:45 AM, 13 sessions
    { x: new Date(2023, 8, 1, 3, 0), y: 10 }, // 3:00 AM, 10 sessions
    { x: new Date(2023, 8, 1, 3, 15), y: 8 }, // 3:15 AM, 8 sessions
    { x: new Date(2023, 8, 1, 3, 30), y: 6 }, // 3:30 AM, 6 sessions
    { x: new Date(2023, 8, 1, 3, 45), y: 5 }, // 3:45 AM, 5 sessions
    { x: new Date(2023, 8, 1, 4, 0), y: 4 }, // 4:00 AM, 4 sessions
    { x: new Date(2023, 8, 1, 4, 15), y: 3 }, // 4:15 AM, 3 sessions
    { x: new Date(2023, 8, 1, 4, 30), y: 2 }, // 4:30 AM, 2 sessions
    { x: new Date(2023, 8, 1, 5, 0), y: 1 }, // 5:00 AM, 1 session
    { x: new Date(2023, 8, 1, 6, 0), y: 10 }, // 6:00 AM, 10 sessions
    { x: new Date(2023, 8, 1, 6, 30), y: 15 }, // 6:30 AM, 15 sessions
    { x: new Date(2023, 8, 1, 7, 0), y: 20 }, // 7:00 AM, 20 sessions
    { x: new Date(2023, 8, 1, 7, 30), y: 18 }, // 7:30 AM, 18 sessions
    { x: new Date(2023, 8, 1, 8, 0), y: 25 }, // 8:00 AM, 25 sessions
    { x: new Date(2023, 8, 1, 8, 30), y: 22 }, // 8:30 AM, 22 sessions
    { x: new Date(2023, 8, 1, 9, 0), y: 30 }, // 9:00 AM, 30 sessions
    { x: new Date(2023, 8, 1, 9, 30), y: 28 }, // 9:30 AM, 28 sessions
    { x: new Date(2023, 8, 1, 10, 0), y: 35 }, // 10:00 AM, 35 sessions
    { x: new Date(2023, 8, 1, 10, 30), y: 32 }, // 10:30 AM, 32 sessions
    { x: new Date(2023, 8, 1, 11, 0), y: 40 }, // 11:00 AM, 40 sessions
    { x: new Date(2023, 8, 1, 11, 30), y: 37 }, // 11:30 AM, 37 sessions
    { x: new Date(2023, 8, 1, 12, 0), y: 45 }, // 12:00 PM, 45 sessions
    { x: new Date(2023, 8, 1, 12, 30), y: 42 }, // 12:30 PM, 42 sessions
    { x: new Date(2023, 8, 1, 13, 0), y: 38 }, // 1:00 PM, 38 sessions
    { x: new Date(2023, 8, 1, 13, 30), y: 35 }, // 1:30 PM, 35 sessions
    { x: new Date(2023, 8, 1, 14, 0), y: 40 }, // 2:00 PM, 40 sessions
    { x: new Date(2023, 8, 1, 14, 30), y: 38 }, // 2:30 PM, 38 sessions
    { x: new Date(2023, 8, 1, 15, 0), y: 45 }, // 3:00 PM, 45 sessions
    { x: new Date(2023, 8, 1, 15, 30), y: 50 }, // 3:30 PM, 50 sessions
    { x: new Date(2023, 8, 1, 16, 0), y: 55 }, // 4:00 PM, 55 sessions
    { x: new Date(2023, 8, 1, 16, 30), y: 52 }, // 4:30 PM, 52 sessions
    { x: new Date(2023, 8, 1, 17, 0), y: 48 }, // 5:00 PM, 48 sessions
    { x: new Date(2023, 8, 1, 17, 30), y: 45 }, // 5:30 PM, 45 sessions
    { x: new Date(2023, 8, 1, 18, 0), y: 40 }, // 6:00 PM, 40 sessions
    { x: new Date(2023, 8, 1, 18, 30), y: 38 }, // 6:30 PM, 38 sessions
    { x: new Date(2023, 8, 1, 19, 0), y: 35 }, // 7:00 PM, 35 sessions
    { x: new Date(2023, 8, 1, 19, 30), y: 30 }, // 7:30 PM, 30 sessions
    { x: new Date(2023, 8, 1, 20, 0), y: 28 }, // 8:00 PM, 28 sessions
    { x: new Date(2023, 8, 1, 20, 30), y: 25 }, // 8:30 PM, 25 sessions
    { x: new Date(2023, 8, 1, 21, 0), y: 20 }, // 9:00 PM, 20 sessions
    { x: new Date(2023, 8, 1, 21, 30), y: 15 }, // 9:30 PM, 15 sessions
  ];

  return (
    <div
      className={cn(
        "mx-auto flex h-[calc(100dvh-56px)] w-full flex-col px-4 py-8 transition-all duration-300",
        isFullWidth ? "max-w-full" : "max-w-screen-xl",
      )}
    >
      {!connected ? (
        <SetupGuide />
      ) : (
        <div className="flex flex-grow flex-col gap-4 overflow-y-hidden">
          <div className="grid flex-none grid-cols-2 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h1 className="text-2xl font-bold">
                Lorem ipsum dolor sit amet consectetur
              </h1>
              {/* <p className="mt-2 text-slate-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p> */}
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
              <div>
                <VictoryChart
                  height={88}
                  padding={{ top: 4, left: 24, right: 4, bottom: 16 }}
                  scale={{ x: "time", y: "linear" }}
                  containerComponent={
                    <VictoryZoomContainer zoomDomain={{ x: [0, 100] }} />
                  }
                >
                  <VictoryAxis
                    dependentAxis
                    fixLabelOverlap={true}
                    style={{
                      axis: { stroke: "black" },
                      tickLabels: { fontSize: 10, padding: 4, fill: "black" },
                    }}
                  />
                  <VictoryAxis
                    fixLabelOverlap={true}
                    style={{
                      axis: { stroke: "black" },
                      tickLabels: { fontSize: 10, padding: 4, fill: "black" },
                    }}
                  />
                  <VictoryBar
                    style={{
                      data: {
                        fill: "rgba(136, 170, 238, 1)",
                        stroke: "black",
                        strokeWidth: "1",
                      },
                    }}
                    data={sessionLogs}
                  />
                </VictoryChart>
              </div>
            </div>
          </div>
          <div className="flex flex-grow flex-col gap-4 overflow-hidden">
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
