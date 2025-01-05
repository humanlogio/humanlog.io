"use client";

import PreviewCode from "@/components/env/previewCode";
import SetupGuide from "@/components/setup-guide";

export default function Page() {
  return (
    <div className="container-min-h-full flex w-full flex-col gap-48 py-44 lg:gap-72 lg:py-60">
      <SetupGuide />
      <PreviewCode />
    </div>
  );
}
