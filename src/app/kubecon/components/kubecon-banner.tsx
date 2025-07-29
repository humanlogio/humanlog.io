"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BANNER_PERMANENT_DISMISS_KEY = "kubecon-india-banner-permanent-dismissed";
const BANNER_SESSION_DISMISS_KEY = "kubecon-india-banner-session-dismissed";

export default function KubeconBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was permanently dismissed
    const wasPermanentlyDismissed = localStorage.getItem(
      BANNER_PERMANENT_DISMISS_KEY,
    );

    // Check if banner was dismissed for this session
    const wasSessionDismissed = sessionStorage.getItem(
      BANNER_SESSION_DISMISS_KEY,
    );

    if (!wasPermanentlyDismissed && !wasSessionDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handlePermanentDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(BANNER_PERMANENT_DISMISS_KEY, "true");
  };

  const handleSessionDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(BANNER_SESSION_DISMISS_KEY, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto flex items-center justify-between py-3">
        <div className="flex flex-1 items-center justify-center lg:justify-start">
          <Link
            href="/kubecon/coffee"
            className="flex items-center hover:underline"
          >
            <span className="text-sm font-medium sm:text-base">
              🎯 Humanlog is coming to KubeCon India (Aug 6-7), click here to
              learn more!
            </span>
          </Link>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePermanentDismiss}
            className="text-xs text-white hover:bg-white/20 hover:text-white"
          >
            Don't show again
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSessionDismiss}
            className="text-white hover:bg-white/20 hover:text-white"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
