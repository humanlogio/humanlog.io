"use client";

import React from "react";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";

type FeatureFlagProps = {
  flagKey: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  defaultValue?: boolean;
};

/**
 * Component that conditionally renders content based on a PostHog feature flag.
 * Will render children if the flag is enabled, otherwise will render the fallback.
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flagKey,
  fallback = null,
  children,
  defaultValue = false,
}) => {
  const flagEnabled = useFeatureFlag(flagKey, defaultValue);

  return <>{flagEnabled ? children : fallback}</>;
};

export default FeatureFlag;
