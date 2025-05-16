"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import TerminalBlock from "@/components/landing-page/shared/ui/terminal-block";
import { InlineCode } from "@/components/landing-page/shared/ui/code-block";
import { Button } from "@/components/ui/button";

const DemoSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const demoCommand = "humanlog demo";
  const stdinCommand = "cat app.log | humanlog";
  const otelCommand = "export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317";

  return (
    <section className="mx-auto max-w-5xl py-8 px-4">
      <h2 className="mb-4 text-center text-2xl font-bold">
        Try Humanlog Instantly
      </h2>

      <div className="max-w-3xl mx-auto">
        {/* Always visible content */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Run the Demo Wizard</h3>
          <p className="mb-4 text-muted-foreground">
            Experience Humanlog with sample data and guided example queries without any setup.
          </p>
          
          <div className="relative cursor-pointer" onClick={() => copyToClipboard(demoCommand, "Demo command")}>
            <Card className="overflow-auto bg-zinc-100 p-4 font-mono text-sm whitespace-nowrap dark:bg-zinc-800">
              <span className="text-emerald-600">$ </span>
              <span>{demoCommand}</span>
            </Card>
            <div className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <Copy size={16} />
            </div>
          </div>
        </div>
        
        {/* Toggle button */}
        <div className="flex justify-center my-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>Learn more ways to use Humanlog</span>
                <ChevronDown size={16} />
              </>
            )}
          </Button>
        </div>
        
        {/* Expandable content */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Use Your Own Data</h3>
            <p className="mb-4 text-muted-foreground">
              Humanlog makes it easy to load your own data in multiple ways:
            </p>
            
            <h4 className="text-md font-medium mb-2">1. Direct from stdin</h4>
            <TerminalBlock
              commands={{
                bash: stdinCommand,
                fish: stdinCommand
              }}
              className="mb-4"
            />
            
            <h4 className="text-md font-medium mb-2">2. From OpenTelemetry</h4>
            <p className="mb-2 text-muted-foreground">
              Point any OTEL-compatible app to Humanlog's collector endpoint:
            </p>
            <TerminalBlock
              commands={{
                bash: otelCommand,
                fish: "set -x OTEL_EXPORTER_OTLP_ENDPOINT http://localhost:4317"
              }}
              className="mb-4"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
