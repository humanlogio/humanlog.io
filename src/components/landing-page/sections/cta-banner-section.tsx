"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import InstallCTA from "@/components/landing-page/shared/install-cta";
import CloudBetaSignup from "@/components/landing-page/shared/cloud-beta-signup";
import FeatureFlag from "@/components/posthog/feature-flag";

const CTABannerSection: React.FC = () => {
  return (
    <section className="w-full bg-zinc-50 py-8 md:py-12 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Ready to Get Started?
        </h2>

        <div className="mb-8 text-center">
          <p className="text-muted-foreground mx-auto mb-6 max-w-2xl">
            Try Humanlog on your laptop. Process logs and traces locally with
            zero configuration.
          </p>
          <InstallCTA buttonText="Install Now" />
        </div>

        <FeatureFlag flagKey="experiment_cloud_waitlist_temp" fallback={null}>
          <div className="mt-10 text-center">
            <h3 className="mb-4 text-xl font-medium">
              Need a hosted solution for your team?
            </h3>
            <CloudBetaSignup
              heading="Join the Humanlog Cloud waitlist for our managed service with the same queries and UI."
              className="mx-auto max-w-2xl"
            />
          </div>
        </FeatureFlag>
      </div>
    </section>
  );
};

export default CTABannerSection;
