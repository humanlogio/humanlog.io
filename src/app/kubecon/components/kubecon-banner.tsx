"use client";

import { DismissibleBanner } from "@/components/ui/dismissable-banner";
import { usePathname } from "next/navigation";

// KubeCon specific banner
const KUBECON_PERMANENT_KEY = "kubecon-india-banner-permanent-dismissed";
const KUBECON_SESSION_KEY = "kubecon-india-banner-session-dismissed";

export default function KubeconBanner() {
  const pathname = usePathname();
  if (pathname !== "/") {
    return null;
  }
  return (
    <DismissibleBanner
      message="🇮🇳 Humanlog is coming to KubeCon India (Aug 6-7), click here to learn more!"
      href="/kubecon/coffee"
      permanentDismissKey={KUBECON_PERMANENT_KEY}
      sessionDismissKey={KUBECON_SESSION_KEY}
    />
  );
}
