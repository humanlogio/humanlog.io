"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const CommunitySection: React.FC = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 text-center">
      <h2 className="mb-4 text-2xl font-bold">Need some help?</h2>
      <p className="text-muted-foreground mb-6">
        Join our Discord community—direct access to the dev team and fellow
        engineers.
      </p>
      <a
        href="/link/discord"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
      >
        Join Discord →
      </a>
    </section>
  );
};

export default CommunitySection;
