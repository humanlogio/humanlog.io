"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/utils/telemetry/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Page failed to load", {
      msg: error.message,
    });
    toast.error("Page failed to load", {
      description: "Please refresh the page or try again later.",
    });
  }, [error]);

  console.log("error", error);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <AlertTriangle className="text-destructive mx-auto h-10 w-10" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Page failed to load</h2>
          <p className="text-muted-foreground text-sm">
            Something went wrong while loading this page.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
