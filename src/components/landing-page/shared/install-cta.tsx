"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { getSelfURL } from "@/lib/envs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy } from "lucide-react";

interface InstallCTAProps {
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

const InstallCTA: React.FC<InstallCTAProps> = ({
  buttonText = "Install & Sign Up",
  buttonSize = "lg",
  buttonVariant = "default",
  className = "h-11",
}) => {
  const origin = getSelfURL();
  const installCommand = `curl -sSL "${origin}/install.sh" | bash`;
  const [isOpen, setIsOpen] = useState(false);
  
  // Copy to clipboard when dialog opens
  useEffect(() => {
    if (isOpen) {
      copyToClipboard(installCommand, "Installation command");
    }
  }, [isOpen, installCommand]);
  
  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={buttonSize}
              variant={buttonVariant}
              className={className}
              onClick={handleOpenDialog}
            >
              {buttonText}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Free for personal use!</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="w-auto max-w-[80vw] min-w-[500px]">
        <DialogHeader>
          <DialogTitle>Install Humanlog 💻</DialogTitle>
          <DialogDescription>
            Open a terminal and paste. The command has been copied to your
            clipboard!
          </DialogDescription>
        </DialogHeader>

        <div
          onClick={() => copyToClipboard(installCommand)}
          tabIndex={1}
          className="bg-muted flex w-full max-w-2xl cursor-pointer flex-row items-center justify-between gap-4 rounded-md px-4 py-3 hover:bg-gray-200 focus:ring-4 focus:ring-slate-100 dark:hover:bg-gray-800"
        >
          <code className="truncate">{installCommand}</code>
          <Copy size={14} className="flex-none" />
        </div>

        {/* OS-specific instructions */}
        <div className="text-muted-foreground space-y-2 text-xs">
          {(() => {
            if (typeof window !== "undefined") {
              const ua = window.navigator.userAgent;
              if (/Macintosh|Mac OS X/.test(ua)) {
                // macOS: show nothing
                return null;
              } else if (/Linux/.test(ua)) {
                return (
                  <div>
                    <b>Linux:</b> The query engine works, but is not as polished
                    and needs to be run manually with{" "}
                    <code>humanlog service run</code>. See{" "}
                    <a
                      href="/docs/get-started/installation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      installation instructions
                    </a>
                    .
                  </div>
                );
              } else if (/Windows/.test(ua)) {
                return (
                  <div>
                    <b>Windows:</b> Not supported yet. Please{" "}
                    <a href="/support" className="underline">
                      contact us
                    </a>{" "}
                    to express your interest!
                  </div>
                );
              }
            }
            // Fallback: show all
            return (
              <>
                <div>
                  <b>macOS:</b> Paste into your terminal.
                </div>
                <div>
                  <b>Linux:</b> The query engine works, but is not as polished
                  and needs to be run manually with{" "}
                  <code>humanlog service run</code>. See{" "}
                  <a
                    href="/docs/get-started/installation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    installation instructions
                  </a>
                  .
                </div>
                <div>
                  <b>Windows:</b> Not supported yet. Please{" "}
                  <a href="/support" className="underline">
                    contact us
                  </a>{" "}
                  to express your interest!
                </div>
              </>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallCTA;
