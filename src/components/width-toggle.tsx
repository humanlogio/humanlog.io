"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";

interface WidthToggleProps {
  isFullWidth: boolean;
  setIsFullWidth: (value: boolean | ((prevState: boolean) => boolean)) => void;
}

export function WidthToggle({ isFullWidth, setIsFullWidth }: WidthToggleProps) {
  return (
    <Button
      size="icon"
      variant="noShadow"
      onClick={() => setIsFullWidth((prev) => !prev)}
    >
      {isFullWidth ? (
        <Minimize2
          size={16}
          className="rotate-45 transition-all hover:scale-90"
        />
      ) : (
        <Maximize2
          className="rotate-45 transition-all hover:scale-110"
          size={16}
        />
      )}
      <span className="sr-only">Toggle full width</span>
    </Button>
  );
}

export default WidthToggle;
