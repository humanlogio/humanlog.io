// src/lib/hooks/useFeatureFlag.ts
"use client";

import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";

interface UseFeatureFlagResult {
  flagEnabled: boolean;
  isLoading: boolean;
}

/**
 * Hook that returns the state of a PostHog feature flag
 * @param flagKey - The feature flag key to check
 * @param defaultValue - Default value to return while loading or if PostHog is unavailable
 * @returns boolean indicating if the flag is enabled
 */
export const useFeatureFlag = (
  flagKey: string,
  defaultValue: boolean = false,
): UseFeatureFlagResult => {
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(true);
  const [flagEnabled, setFlagEnabled] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (!posthog) return;

    const checkFlag = () => {
      const enabled = posthog.isFeatureEnabled(flagKey);
      setFlagEnabled(enabled === true);
      setIsLoading(false);
    };

    if (posthog.onFeatureFlags) {
      posthog.onFeatureFlags(checkFlag);
    }
  }, [posthog, flagKey]);

  return { flagEnabled, isLoading };
};
