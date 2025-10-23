"use client";

import FeatureFlag from "@/components/posthog/feature-flag";
import { Badge } from "@/components/ui/badge";

interface BetaBadgeProps {
  className?: string;
}

export function BetaBadge({ className }: BetaBadgeProps) {
  return (
    <FeatureFlag flagKey="release_beta_badge_temp" fallback={null}>
      <Badge className="ml-2 h-5 w-9 items-center justify-center rounded-lg bg-gradient-to-bl from-blue-600 to-purple-700 text-[10px] font-medium text-white">
        Beta
      </Badge>
    </FeatureFlag>
  );
}
