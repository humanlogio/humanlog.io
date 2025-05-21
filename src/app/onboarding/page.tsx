"use client";

import { useSearchParams } from "next/navigation";

import { OnboardingUsername } from "@/components/onboarding/username";
import OnboardingPricing from "@/components/onboarding/pricing";

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");

  if (step === "username" || !step) {
    return <OnboardingUsername />;
  }

  if (step === "pricing") {
    return <OnboardingPricing />;
  }
}
