"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import { useTheme } from "next-themes";
import {
  Star,
  Terminal as TerminalIcon,
  Activity,
  Laptop,
  Building,
  Share,
  Github,
} from "lucide-react";
import { getSelfURL } from "@/lib/envs";
import InstallCTA from "@/components/landing-page/shared/install-cta";
import { SpansContainer } from "@/components/log-interface/query-output/traces/spans-container";
import Terminal from "@/components/landing-page/shared/ui/terminal";
import { sampleLogs } from "@/lib/mocks/sampleLogs";
import { sampleSpans } from "@/lib/mocks/sampleSpans";

const AboveFoldHero: React.FC = () => {
  const { theme: colorMode } = useTheme();
  // Add state for logs/traces toggle
  const [selectedTab, setSelectedTab] = useState<"logs" | "traces">("logs");

  const [githubStars, setGithubStars] = useState("∞");

  // Fetch GitHub stars count from local API route (cached)
  useEffect(() => {
    const fetchGitHubStars = async () => {
      try {
        const response = await fetch("/api/github-stars");
        const data = await response.json();
        if (data.stars && data.stars !== "0") {
          setGithubStars(data.stars);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error);
      }
    };
    fetchGitHubStars();
  }, []);

  // Sample commands for the terminal mockup
  const origin = getSelfURL();
  const installCommand = `curl -sSL "${origin}/install.sh" | bash`;
  const ingestCommand = `your_app | humanlog`;
  const exampleQuery = `summarize histogram(duration, 10) by bin(time, 1m)`;
  const queryCommand = `humanlog query '${exampleQuery}'`;
  const exampleStream = `traces | filter name == "db_query"`;
  const streamCommand = `humanlog stream '${exampleStream}'`;

  return (
    <div className="w-full pt-[80px]">
      <div className="mx-auto w-full max-w-full px-4 sm:max-w-3xl lg:max-w-screen-lg xl:max-w-screen-xl">
        {/* Header content - minimal margin */}
        <div className="mb-4 w-full text-center">
          <h1 className="text-center text-4xl leading-tight font-extrabold md:text-[3.5rem]">
            Observability on Your Laptop and in Your Browser
          </h1>

          <p className="text-muted-foreground mx-auto mt-2 max-w-3xl text-center text-lg">
            Run local logs & traces, query them in CLI or UI, entirely on your
            machine.
            <br />
            Then share results with teammates.
          </p>
        </div>

        {/* Main hero section - vertical on mobile, horizontal on desktop */}
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8 xl:px-0">
          {/* Terminal mockup - priority on mobile, left on desktop */}
          <div className="order-1 flex w-full lg:order-1 lg:w-1/2">
            <Terminal
              commands={[
                {
                  text: installCommand,
                  tooltip: "Install, sign up and get started in one command",
                  output: (
                    <div className="text-zinc-500">
                      <span className="text-emerald-600">
                        humanlog.io/install.sh
                      </span>
                      : installing latest release
                      <br />
                      ############################################## 100.0%
                      <br />
                      <span className="text-emerald-600">
                        humanlog.io/install.sh
                      </span>
                      : humanlog was successfully installed
                      <br />
                      <span className="text-emerald-600">
                        humanlog.io/install.sh
                      </span>
                      : send your OTEL data here:
                      <br />
                      <br />
                      <span className="text-teal-600">
                        <code>
                          {
                            "\texport OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317"
                          }
                        </code>
                      </span>
                    </div>
                  ),
                },
                {
                  text: ingestCommand,
                  tooltip: "Ingest logs from stdin",
                  // No output for this command in the original mockup
                },
                {
                  text: queryCommand,
                  tooltip: "Run queries against historical data",
                  // No output for this command in the original mockup
                },
                {
                  text: streamCommand,
                  tooltip: "Stream and query real-time data",
                  // No output for this command in the original mockup
                },
              ]}
            />
          </div>

          {/* UI Screenshot - use real SessionPanel component with Logs/Traces toggle and share button */}
          <div className="order-2 mt-2 flex w-full lg:order-2 lg:mt-0 lg:max-h-[450px] lg:w-1/2">
            <Card className="flex flex-1 flex-col overflow-hidden rounded-lg border border-zinc-200 shadow-md dark:border-zinc-800">
              {/* Logs | Traces toggle */}
              <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex gap-2">
                  <button
                    className={`rounded px-3 py-1 text-sm font-medium ${selectedTab === "logs" ? "text-foreground bg-zinc-200 dark:bg-zinc-800" : "text-muted-foreground"}`}
                    onClick={() => setSelectedTab("logs")}
                    aria-pressed={selectedTab === "logs"}
                  >
                    Logs
                  </button>
                  <button
                    className={`rounded px-3 py-1 text-sm font-medium ${selectedTab === "traces" ? "text-foreground bg-zinc-200 dark:bg-zinc-800" : "text-muted-foreground"}`}
                    onClick={() => setSelectedTab("traces")}
                    aria-pressed={selectedTab === "traces"}
                  >
                    Traces
                  </button>
                </div>
                {/* Share/Copy button */}
                <button
                  className="text-muted-foreground flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => {
                    window.open(
                      "https://humanlog.io/share/public/01JV983APJE4ADXARFW57FRCZY",
                      "_blank",
                    );
                  }}
                  title="Share results publicly or privately"
                  aria-label="Share results publicly or privately"
                >
                  <Share className="h-4 w-4" /> Share results
                </button>
              </div>
              {/* Query string above results pane */}

              {selectedTab === "logs" ? (
                <>
                  <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 bg-zinc-100 px-3 py-2 font-mono text-xs whitespace-nowrap text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                    <span role="img" aria-label="sparkles">
                      ✨
                    </span>
                    <span className="truncate">{sampleLogs().query}</span>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
                    <SessionPanel
                      providedData={sampleLogs().data}
                      query={undefined}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 bg-zinc-100 px-3 py-2 font-mono text-xs whitespace-nowrap text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                    <span role="img" aria-label="sparkles">
                      ✨
                    </span>
                    <span className="truncate">{sampleSpans().query}</span>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
                    <SpansContainer
                      providedData={sampleSpans().data}
                      query={undefined}
                    />
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Feature badges - flex wrap layout */}
        <div className="mb-4 px-2 py-2">
          <div className="flex flex-wrap justify-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="inline-flex flex-shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs whitespace-nowrap md:text-sm dark:bg-zinc-800"
                  >
                    <Activity className="mr-2 h-4 w-4 flex-shrink-0" />
                    Real-Time Streaming
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Monitor your logs and traces as they happen in real-time
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="inline-flex flex-shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs whitespace-nowrap md:text-sm dark:bg-zinc-800"
                  >
                    <TerminalIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    OTLP Collector
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Finally see what your app is doing. Right away. Not after
                    days of setup.
                  </p>
                  <b>
                    <code>
                      OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
                    </code>
                  </b>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="inline-flex flex-shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs whitespace-nowrap md:text-sm dark:bg-zinc-800"
                  >
                    <Laptop className="mr-2 h-4 w-4 flex-shrink-0" />
                    Logs & Traces Local-First
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Keep your data private. Leverage local processing for snappy
                    results.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="inline-flex flex-shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs whitespace-nowrap md:text-sm dark:bg-zinc-800"
                  >
                    <Share className="mr-2 h-4 w-4 flex-shrink-0" />
                    Shareable Results
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Export and share your findings with your team and friends.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mx-auto mb-4 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          <InstallCTA buttonText="Install & Sign Up" className="w-full" />
          <a
            href="/link/github"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" size="lg" className="h-11 w-full px-6">
              <Github className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </a>
        </div>

        {/* Trust signals */}
        <div className="mt-2 mb-6 text-center text-sm text-gray-500">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <div className="flex items-center">
              <Star className="mr-2 h-4 w-4" />
              <a
                href="/link/github/stargazers"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <span>{githubStars} stars on GitHub</span>
              </a>
            </div>
            <div className="hidden sm:block">·</div>
            <div className="flex items-center">
              <Building className="mr-2 h-4 w-4" />
              <span>
                Built and used by engineers at GitHub, CloudFlare, PlanetScale,
                DigitalOcean, and more
              </span>
            </div>
          </div>
        </div>

        {/* Beta signup banner removed to focus on main CTA */}
      </div>
    </div>
  );
};

export default AboveFoldHero;
