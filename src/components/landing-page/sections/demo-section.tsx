"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Copy } from "lucide-react";

const DemoSection: React.FC = () => {
  const demoCommand = "humanlog demo --source=example.json";

  return (
    <section className="mx-auto max-w-3xl py-16 px-4">
      <h2 className="mb-4 text-center text-2xl font-bold">
        Try Humanlog on Your Data—No Setup Required
      </h2>
      
      <div 
        className="relative mb-6 cursor-pointer" 
        onClick={() => copyToClipboard(demoCommand, "Demo command")}
      >
        <Card className="overflow-auto bg-zinc-100 p-4 font-mono text-sm whitespace-nowrap dark:bg-zinc-800">
          <span className="text-emerald-600">$ </span>
          <span>{demoCommand}</span>
        </Card>
        <div className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <Copy size={16} />
        </div>
      </div>
      
      <p className="text-center text-muted-foreground">
        Replace <code>example.json</code> with your own files or Docker logs for instant queries.
      </p>
    </section>
  );
};

export default DemoSection;
