"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const CommunitySection: React.FC = () => {
  return (
    <section className="mx-auto max-w-5xl py-8 px-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">Need some help?</h2>
      <p className="mb-6 text-muted-foreground">
        Join our Discord community—direct access to the dev team and fellow engineers.
      </p>
      <a 
        href="/link/discord" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-2 font-medium"
      >
        Join Discord →
      </a>
    </section>
  );
};

export default CommunitySection;
