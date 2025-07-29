"use client";

import { DismissibleBanner } from "@/components/ui/dismissable-banner";
import FeatureFlag from "@/components/posthog/feature-flag";

// KubeCon specific banner
const KUBECON_PERMANENT_KEY = "kubecon-india-banner-permanent-dismissed";
const KUBECON_SESSION_KEY = "kubecon-india-banner-session-dismissed";

export default function KubeconBanner() {
  return (
    <FeatureFlag flagKey="release_kubecon_banner_temp" fallback={null}>
      <DismissibleBanner
        message="🇮🇳 Humanlog is coming to KubeCon India (Aug 6-7), click here to learn more!"
        href="/kubecon/coffee"
        permanentDismissKey={KUBECON_PERMANENT_KEY}
        sessionDismissKey={KUBECON_SESSION_KEY}
      />
    </FeatureFlag>
  );
}
