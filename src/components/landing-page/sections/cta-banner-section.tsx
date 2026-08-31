"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import InstallCTA from "@/components/landing-page/shared/install-cta";
import CloudBetaSignup from "@/components/landing-page/shared/cloud-beta-signup";

const CTABannerSection: React.FC = () => {
  return (
    <section className="w-full bg-zinc-50 py-8 md:py-12 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Run it on your laptop
        </h2>

        <div className="mb-8 text-center">
          <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
            Try Humanlog on your laptop. Process logs and traces locally with
            zero configuration.
          </p>
          <InstallCTA buttonText="Install Now" />
        </div>

        {/*
          The hosted service is on a break, so this is no longer gated behind
          the `experiment_cloud_waitlist_temp` flag — everyone should see where
          the hosted tool went.
          See https://www.webscale.lol/blog/humanlog-retro
        */}
        <div className="mt-10 text-center">
          <h3 className="mb-4 text-xl font-medium">
            Looking for the hosted version?
          </h3>
          <CloudBetaSignup className="mx-auto max-w-2xl" />
        </div>
      </div>
    </section>
  );
};

export default CTABannerSection;
