"use client";

import { Tutorial } from "@/components/onboarding/tutorial";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { lazy, Suspense } from "react";

const LogInterface = lazy(() => import("@/components/log-interface"));

export default function Query() {
  const searchParams = useSearchParams();
  const tutorialParam = searchParams.get("tutorial");

  return (
    <>
      {!tutorialParam && (
        <Suspense
          fallback={
            <div className="flex h-[calc(100vh-260px)] w-full items-center justify-center">
              <Loader2 className="animate-spin" size={30} />
            </div>
          }
        >
          <LogInterface nav="query" />
        </Suspense>
      )}

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
