"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CloudBetaSignupProps {
  heading?: string;
  className?: string;
  variant?: "default" | "banner";
}

const CloudBetaSignup: React.FC<CloudBetaSignupProps> = ({
  heading = "Signup for our private beta of Humanlog Cloud. Reuse everything you learn locally, skills transfer 1:1, spots limited to 50 engineers.",
  className = "",
  variant = "default",
}) => {
  return (
    <div
      className={`${variant === "banner" ? "flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-6 md:flex-row dark:bg-zinc-800/50" : ""} ${className}`}
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-6 text-base font-medium text-gray-800 dark:text-gray-200">
          {heading}
        </p>

        <form
          className="launchlist-form"
          action="https://getlaunchlist.com/s/MJv5ZO"
          method="POST"
        >
          <div className="mx-auto flex max-w-lg flex-col justify-center gap-3 sm:flex-row">
            <Input
              type="email"
              name="email"
              placeholder="Your email address"
              aria-label="Email address"
              className="flex-1"
              required
            />
            <Button
              variant="outline"
              size="default"
              className="whitespace-nowrap"
              type="submit"
            >
              Keep Me Posted
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Handwritten 💌 from us!</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>no spam!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
        </form>
      </div>
      <HelmetProvider>
        <Helmet>
          <script
            src="https://getlaunchlist.com/js/widget-diy.js"
            defer
          ></script>
        </Helmet>
      </HelmetProvider>
    </div>
  );
};

export default CloudBetaSignup;
