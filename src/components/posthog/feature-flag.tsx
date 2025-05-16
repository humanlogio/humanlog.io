"use client";

import React, { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";

type FeatureFlagProps = {
  flagKey: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Component that conditionally renders content based on a PostHog feature flag.
 * Will render children if the flag is enabled, otherwise will render the fallback.
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flagKey,
  fallback = null,
  children,
}) => {
  const posthog = usePostHog();
  const [flagEnabled, setFlagEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (posthog) {
      const enabled = posthog.isFeatureEnabled(flagKey);
      setFlagEnabled(enabled === true);
    }
  }, [posthog, flagKey]);

  // Still loading or PostHog not available
  if (flagEnabled === null) {
    return <>{fallback}</>;
  }

  return <>{flagEnabled ? children : fallback}</>;
};

export default FeatureFlag;
