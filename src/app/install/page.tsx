"use client";

import PreviewCode from "@/components/env/previewCode";
import SetupGuide from "@/components/setup-guide";

export default function Page() {
  return (
    <div className="container-min-h-full flex flex-col gap-4 py-8">
      <div className="grid w-full grid-cols-1 gap-48 py-44 lg:gap-72 lg:py-60">
        <SetupGuide />
        <PreviewCode />
      </div>
    </div>
  );
}
