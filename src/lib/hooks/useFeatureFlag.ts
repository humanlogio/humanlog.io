"use client";

import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";

/**
 * Hook that returns the state of a PostHog feature flag
 * @param flagKey - The feature flag key to check
 * @param defaultValue - Default value to return while loading or if PostHog is unavailable
 * @returns boolean indicating if the flag is enabled
 */
export const useFeatureFlag = (
  flagKey: string,
  defaultValue: boolean = false,
): boolean => {
  const posthog = usePostHog();
  const [flagEnabled, setFlagEnabled] = useState<boolean>(defaultValue);

  useEffect(() => {
    if (posthog) {
      const enabled = posthog.isFeatureEnabled(flagKey);
      setFlagEnabled(enabled === true);
    }
  }, [posthog, flagKey]);

  return flagEnabled;
};
