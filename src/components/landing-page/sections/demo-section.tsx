"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TerminalBlock from "@/components/landing-page/shared/ui/terminal-block";
import Terminal from "@/components/landing-page/shared/ui/terminal";
import { InlineCode } from "@/components/landing-page/shared/ui/code-block";
import { Button } from "@/components/ui/button";

const DemoSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [origin, setOrigin] = useState("");
  const demoCommand = "humanlog demo";
  const stdinCommand = "cat app.log | humanlog";
  const otelCommand =
    "export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317";

  // Set the origin after component mount to avoid SSR issues
  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <section className="mx-auto w-full px-4 py-8">
      <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
        Try Humanlog Instantly
      </h2>

      <div className="mx-auto w-full sm:w-11/12 md:w-3/4 lg:w-2/3">
        {/* Always visible content */}

        {/* YouTube embed */}
        <div className="mb-4 flex justify-center">
          <div className="aspect-video w-full max-w-2xl">
            <iframe
              className="h-full w-full rounded-lg shadow-md"
              src="https://www.youtube.com/embed/WtoA4VGWgCk"
              title="Humanlog Demo"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Toggle button */}
        <div className="my-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
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
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="mb-8">
            <h3 className="mb-2 text-center text-lg font-medium">
              Use Your Own Data
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              Humanlog makes it easy to load your own data in multiple ways:
            </p>

            <h4 className="text-md mb-2 font-medium">1. Direct from stdin</h4>
            <Terminal
              commands={[
                {
                  text: stdinCommand,
                  tooltip: "Pipe logs directly to Humanlog",
                  // CLI doesn't print output for this command
                },
              ]}
              className="mb-4 overflow-hidden rounded-lg shadow-md"
            />

            <h4 className="text-md mb-2 font-medium">
              2. Pull down logs for a quick debug session
            </h4>
            <p className="text-muted-foreground mb-2">
              Stream logs from hosted services for quick debugging of production
              data. Since all data stays on your machine, you can safely use it
              at work without data sovereignty concerns:
            </p>
            <Terminal
              commands={[
                {
                  text: "kubectl logs -l app=apisvc -f | humanlog",
                  tooltip:
                    "Stream logs from Kubernetes pods directly to Humanlog",
                  // CLI doesn't print output for this command
                },
              ]}
              className="mb-4 overflow-hidden rounded-lg shadow-md"
            />

            <h4 className="text-md mb-2 font-medium">
              3. Debug tracing integration locally with OpenTelemetry
            </h4>
            <p className="text-muted-foreground mb-2">
              Instantly verify your tracing instrumentation works locally before
              pushing to production. See and debug your spans, trace context,
              and relationships immediately without deploying or waiting for
              production validation:
            </p>
            <Terminal
              commands={[
                {
                  text: otelCommand,
                  tooltip: "Configure your OTEL endpoint",
                },
              ]}
              className="mb-4 overflow-hidden rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
