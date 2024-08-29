"use client";

import { useState } from "react";
import { GripHorizontal, Search, Share } from "lucide-react";
import PageHeader from "@/components/page-header";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import SessionContainer from "@/components/sortable/session-container";

export default function Home() {
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isPretty, setIsPretty] = useState(true);

  return (
    <main className="flex h-screen flex-col">
      <PageHeader isFullWidth={isFullWidth} setIsFullWidth={setIsFullWidth} />
      <div
        className={cn(
          "mx-auto flex w-full flex-grow flex-col gap-8 px-4 py-8 transition-all duration-300",
          isFullWidth ? "max-w-full" : "max-w-screen-xl",
        )}
      >
        <div className="grid flex-none grid-cols-2 gap-8">
          <div>
            <h1 className="text-2xl font-bold">
              Lorem ipsum dolor sit amet consectetur
            </h1>
            {/* <p className="mt-2 text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p> */}
            <div className="mt-4 flex flex-row gap-2">
              <AutosizeTextarea maxHeight={160} placeholder="Type to search" />
              <Button size="icon" className="h-8">
                <Share size={14} />
              </Button>
            </div>
          </div>
          <div>
            <p>chart goes here</p>
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-4">
          <div className="flex flex-none flex-row items-center gap-2">
            <Label
              htmlFor="pretty"
              className={cn("transition-colors duration-200", {
                "text-gray-500": isPretty,
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
                "text-gray-500": !isPretty,
              })}
            >
              Pretty
            </Label>
          </div>
          <SessionContainer />
          {/* <ResizablePanelGroup
            direction="horizontal"
            className="w-full flex-grow gap-1"
          >
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full flex-col overflow-hidden rounded-base border-2 border-border bg-secondary-900">
                <div className="flex flex-none flex-row items-center justify-between bg-secondary-100 px-4 py-2">
                  <div className="flex w-1/3 justify-start">
                    <h4 className="font-bold text-white">Session</h4>
                  </div>
                  <div className="flex w-1/3 justify-center">
                    <GripHorizontal />
                  </div>
                  <div className="flex w-1/3 justify-end">
                    <Button size="icon" className="mb-1 h-8">
                      <Search size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-grow flex-col text-sm">
                  <div className="flex flex-row items-center">
                    <div className="text-gray-500">1</div>
                    <div className="text-white">
                      [INFO] 2024-08-21 14:32:05 - User john_doe logged in from
                      IP 192.168.1.10
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-full flex-col rounded-base border-2 border-border">
                <span className="font-semibold">Session</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup> */}
        </div>
      </div>
    </main>
  );
}
