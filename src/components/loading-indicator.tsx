"use client";

import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({
  message = "loading...",
}: LoadingIndicatorProps) {
  return (
    <div className="absolute top-0 left-0 flex h-screen w-full flex-col items-center justify-center">
      <Loader2 className="mb-2 animate-spin dark:text-white" />
      {message}
    </div>
  );
}
