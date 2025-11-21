"use client";

import { useSearchParams } from "next/navigation";
import OnboardingPricing from "@/components/onboarding/pricing";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

      <div className="relative w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl dark:border dark:border-gray-700 dark:bg-black">
        <OnboardingPricing />
      </div>
    </div>
  );
}
