"use client";

import LogInterface from "@/components/log-interface";
import { Tutorial } from "@/components/onboarding/tutorial";
import { useSearchParams } from "next/navigation";

export default function Query() {
  const searchParams = useSearchParams();
  const tutorialParam = searchParams.get("tutorial");
  return (
    <>
      <LogInterface nav="query" />
      {tutorialParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
          <div className="relative w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl dark:border dark:border-gray-700 dark:bg-black">
            <Tutorial />
          </div>
        </div>
      )}
    </>
  );
}
