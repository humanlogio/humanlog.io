"use client";

import { Tutorial } from "@/components/onboarding/tutorial";
import { usePage } from "@/stores/page-store";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { lazy, Suspense, useEffect } from "react";

const LogInterface = lazy(() => import("@/components/log-interface"));

export default function Query() {
  const searchParams = useSearchParams();
  const tutorialParam = searchParams.get("tutorial");
  const { activePage, setActivePage } = usePage();

  useEffect(() => {
    setActivePage("query");
  }, [activePage]);

  return (
    <div className="h-full w-full">
      {!tutorialParam && (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
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
    </div>
  );
}
