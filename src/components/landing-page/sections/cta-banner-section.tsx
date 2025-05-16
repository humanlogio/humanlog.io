"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import InstallCTA from "@/components/landing-page/shared/install-cta";
import CloudBetaSignup from "@/components/landing-page/shared/cloud-beta-signup";

const CTABannerSection: React.FC = () => {
  return (
    <section className="w-full bg-zinc-50 py-12 md:py-16 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-center text-2xl font-bold">
          Ready to Get Started?
        </h2>
        
        <div className="text-center mb-8">
          <p className="mx-auto max-w-2xl mb-6 text-muted-foreground">
            Try Humanlog on your laptop—no signup required. Process logs and traces locally with zero configuration.
          </p>
          <InstallCTA buttonText="Install Now" />
        </div>
        
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <h3 className="text-xl font-medium mb-4">
            Need a hosted solution for your team?
          </h3>
          <CloudBetaSignup 
            heading="Join the Humanlog Cloud waitlist for our managed service with the same queries and UI."
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default CTABannerSection;
