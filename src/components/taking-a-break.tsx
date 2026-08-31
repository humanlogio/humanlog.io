"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CloudBetaSignup from "@/components/landing-page/shared/cloud-beta-signup";
import { cn } from "@/lib/utils";

export const RETRO_URL = "https://www.webscale.lol/blog/humanlog-retro";
export const CONTACT_EMAIL = "antoine@webscale.lol";

interface TakingABreakProps {
  className?: string;
  /** Shown under the heading. Defaults to the general "we're on a break" copy. */
  description?: React.ReactNode;
}

/**
 * The site-wide "humanlog.io is taking a break" notice.
 *
 * Rendered in place of anything that used to sign someone up, log them in, or
 * take their money. See https://www.webscale.lol/blog/humanlog-retro
 */
export function TakingABreak({ className, description }: TakingABreakProps) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center px-4 py-16",
        className,
      )}
    >
      <div className="w-full max-w-xl space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">
            humanlog.io is taking a break
          </h1>
          <p className="text-muted-foreground text-sm">
            {description ?? (
              <>
                The hosted app is closed for now — no new accounts, no sign-ins,
                and nothing to pay for. The log parser is being open-sourced,
                and the observability tool is moving to a new project called
                minitape.
              </>
            )}
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild variant="outline">
            <a href={RETRO_URL} target="_blank" rel="noreferrer">
              Read the retro
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <CloudBetaSignup heading="Want to hear when minitape launches? Leave your email and we'll only write when there's something to say." />

        <p className="text-muted-foreground text-xs">
          Had an account here? Any subscription created for you was free and is
          being cancelled — there is nothing owed and nothing to do. Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}

export default TakingABreak;
