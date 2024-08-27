import * as React from "react";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";

interface WidthToggleProps {
  isFullWidth: boolean;
  setIsFullWidth: React.Dispatch<React.SetStateAction<boolean>>;
}

export function WidthToggle({ isFullWidth, setIsFullWidth }: WidthToggleProps) {
  return (
    <Button
      size="icon"
      variant="noShadow"
      onClick={() => setIsFullWidth(!isFullWidth)}
    >
      {isFullWidth ? <Minimize2 /> : <Maximize2 />}
    </Button>
  );
}

export default WidthToggle;
