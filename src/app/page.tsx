import PageHeader from "@/components/pageHeader";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <PageHeader />
      <div className="flex-grow px-4 py-8 w-full max-w-screen-xl mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-8 flex-none">
          <div>
            <h1 className="text-2xl font-bold">
              Lorem ipsum dolor sit amet consectetur
            </h1>
            <p className="mt-2 text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex flex-row gap-2 mt-4">
              <AutosizeTextarea minHeight={32} placeholder="Type to search" />
              <Button size="icon" className="h-8">
                <Share size={14} />
              </Button>
            </div>
          </div>
          <div>
            <p>chart goes here</p>
          </div>
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-grow w-full gap-1"
        >
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col rounded-base border-border border-2">
              <span className="font-semibold">Session</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className="" />
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col rounded-base border-border border-2">
              <span className="font-semibold">Session</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
