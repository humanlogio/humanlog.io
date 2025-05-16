"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const CommunitySection: React.FC = () => {
  return (
    <section className="mx-auto max-w-3xl py-16 px-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">Get Help Instantly</h2>
      <p className="mb-6 text-muted-foreground">
        Join our Discord community—direct access to the dev team and fellow engineers.
      </p>
      <a 
        href="/link/discord" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <Button className="min-w-[180px]">
          Join Discord
        </Button>
      </a>
    </section>
  );
};

export default CommunitySection;
