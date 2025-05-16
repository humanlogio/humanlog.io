"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TerminalBlock from "@/components/landing-page/shared/ui/terminal-block";
import Terminal from "@/components/landing-page/shared/ui/terminal";
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
            Experience Humanlog with sample data and guided example queries.
          </p>
          
          <Terminal 
            commands={[{ 
              text: demoCommand, 
              tooltip: "Run the demo wizard",
              output: (
                <>
                  <div className="mb-2">
                    <span className="text-emerald-600">humanlog:</span> Starting demo mode...
                  </div>
                  <div className="mb-2">
                    <span className="text-emerald-600">humanlog:</span> Loading sample data...
                  </div>
                  <div>
                    <span className="text-emerald-600">humanlog:</span> Opening browser to <span className="text-blue-400 underline">http://localhost:4000</span>
                  </div>
                </>
              )
            }]}
            className="shadow-md rounded-lg overflow-hidden"
          />
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
            <Terminal
              commands={[{ 
                text: stdinCommand, 
                tooltip: "Pipe logs directly to Humanlog",
                output: (
                  <>
                    <span className="text-emerald-600">humanlog:</span> Processing input from stdin...
                    <br />
                    <span className="text-emerald-600">humanlog:</span> Found 42 log entries
                  </>
                )
              }]}
              className="shadow-md rounded-lg overflow-hidden mb-4"
            />
            
            <h4 className="text-md font-medium mb-2">2. From OpenTelemetry</h4>
            <p className="mb-2 text-muted-foreground">
              Point any OTEL-compatible app to Humanlog's collector endpoint:
            </p>
            <Terminal
              commands={[
                { 
                  text: otelCommand, 
                  tooltip: "Configure your OTEL endpoint"
                },
                { 
                  text: "humanlog service start", 
                  tooltip: "Start the Humanlog OTLP collector service",
                  output: <span className="text-emerald-600">Humanlog OTLP collector is now running on port 4317</span>
                }
              ]}
              className="shadow-md rounded-lg overflow-hidden mb-4"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
