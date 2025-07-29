import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DismissibleBannerProps {
  message: string;
  href: string;
  permanentDismissKey: string;
  sessionDismissKey: string;
  className?: string;
}

export function DismissibleBanner({
  message,
  href,
  permanentDismissKey,
  sessionDismissKey,
  className = "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
}: DismissibleBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was permanently dismissed
    const wasPermanentlyDismissed = localStorage.getItem(permanentDismissKey);

    // Check if banner was dismissed for this session
    const wasSessionDismissed = sessionStorage.getItem(sessionDismissKey);

    if (!wasPermanentlyDismissed && !wasSessionDismissed) {
      setIsVisible(true);
    }
  }, [permanentDismissKey, sessionDismissKey]);

  const handlePermanentDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(permanentDismissKey, "true");
  };

  const handleSessionDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(sessionDismissKey, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="container mx-auto flex items-center justify-between py-3">
        <div className="flex flex-1 items-center justify-center lg:justify-start">
          <Link href={href} className="flex items-center hover:underline">
            <span className="text-sm font-medium sm:text-base">{message}</span>
          </Link>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePermanentDismiss}
            className="text-xs hover:bg-white/20"
          >
            Don&apos;t show again
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSessionDismiss}
            className="hover:bg-white/20"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
