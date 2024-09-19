"use client";

import React, { useState } from "react";
import { Share } from "lucide-react";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import SessionContainer from "@/components/sortable/session-container";
import { useFullWidth } from "@context/full-width-provider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SetupGuide from "@components/setup-guide";
import Graph from "@components/ui/graph/graph";

export default function Home() {
  const [isPretty, setIsPretty] = useState(true);
  const { isFullWidth } = useFullWidth();

  const connected = true;

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col py-8">
      {!connected ? (
        <SetupGuide />
      ) : (
        <div className="flex flex-grow flex-col gap-4 overflow-y-hidden">
          <div className="mx-auto grid w-full max-w-screen-xl flex-none grid-cols-2 gap-8 px-4">
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
              <Graph />
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
