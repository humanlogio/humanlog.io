"use client";

import { DismissibleBanner } from "@/components/ui/dismissable-banner";
import { RETRO_URL } from "@/components/taking-a-break";

/**
 * Site-wide notice that humanlog.io is paused.
 *
 * See https://www.webscale.lol/blog/humanlog-retro
 */
export function BreakBanner() {
  return (
    <DismissibleBanner
      message="humanlog.io is taking a break — here's what happened and what's next"
      href={RETRO_URL}
      permanentDismissKey="humanlog-break-banner-dismissed"
      sessionDismissKey="humanlog-break-banner-session-dismissed"
      className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
    />
  );
}

export default BreakBanner;
