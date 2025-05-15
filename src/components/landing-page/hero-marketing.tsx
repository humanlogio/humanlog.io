"use client";

import React, { useState, useEffect } from "react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import { sampleLogs, sampleSpans } from "./sample-protobuf-data";
import { defaultConfig } from "@/services/localhostService";
import { useTheme } from "next-themes";
import {
  FormatConfig_Themes,
  FormatConfig_Theme,
} from "api/js/types/v1/localhost_config_pb";
import {
  Star,
  Users,
  Terminal,
  Activity,
  Search,
  Laptop,
  Github,
  Circle,
  Building,
  Share,
  AlertCircle,
  Clock,
  Ellipsis,
  UnfoldVertical,
  GithubIcon,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getSelfURL } from "@/lib/envs";
import { Copy } from "lucide-react";
import { SpansContainer } from "../log-interface/query-output/traces/spans-container";
import { GithubMark } from "../icons/github-mark";

const AboveFoldHero: React.FC = () => {
  const { theme: colorMode } = useTheme();
  // Add state for logs/traces toggle
  const [selectedTab, setSelectedTab] = useState<"logs" | "traces">("logs");

  // Fallback to system if colorMode is undefined
  let mode: "light" | "dark" = "light";
  if (colorMode === "dark") mode = "dark";
  if (colorMode === "system" && typeof window !== "undefined") {
    mode = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Compose the themes object for SessionPanel (FormatConfig_Themes)
  const getThemeJson = (theme: FormatConfig_Theme) => {
    if (theme && typeof theme.toJson === "function") return theme.toJson();
    // fallback: ensure plain object for proto messages
    return JSON.parse(JSON.stringify(theme));
  };
  const themes: FormatConfig_Themes | undefined =
    defaultConfig.formatter?.themes &&
    defaultConfig.formatter.themes.light &&
    defaultConfig.formatter.themes.dark
      ? FormatConfig_Themes.fromJson({
          light: getThemeJson(defaultConfig.formatter.themes.light),
          dark: getThemeJson(defaultConfig.formatter.themes.dark),
        })
      : undefined;

  const [email, setEmail] = useState("");
  const [githubStars, setGithubStars] = useState("∞");
  const earlyAccessEngineers = "35"; // Replace with actual count

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
  const exampleQuery = `summarize histogram(duration, 10) by bin(time, 1m)`;
  const queryCommand = `humanlog query '${exampleQuery}'`;
  const exampleStream = `traces | filter name == "db_query"`;
  const streamCommand = `humanlog stream '${exampleStream}'`;

  return (
    <div className="px-4 pt-[80px] sm:px-8">
      {/* Header content - minimal margin */}
      <div className="mb-4 w-full">
        <h1 className="text-4xl leading-tight font-extrabold md:text-[3.5rem]">
          Observability on Your Laptop and in Your Browser
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          Run local logs & traces, query them in CLI or UI, entirely on your
          machine. Then share results with teammates.
        </p>
      </div>

      {/* Main hero section - vertical on mobile, horizontal on desktop */}
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Terminal mockup - priority on mobile, left on desktop */}
        <div className="order-1 w-full lg:order-1 lg:w-1/2">
          <Card className="h-auto overflow-auto bg-zinc-900 p-6 font-mono text-base leading-relaxed shadow-md">
            {/* Terminal window controls */}
            <div className="mb-4 flex gap-2">
              <Circle className="h-3 w-3 fill-red-500 text-red-500" />
              <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            </div>

            {/* Terminal content */}
            <div className="text-zinc-300">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <div className="mb-5">
                        <span className="text-emerald-400">$ </span>
                        <span className="overflow-x-auto whitespace-nowrap">
                          {installCommand}
                        </span>
                      </div>
                      <div className="mb-6 text-zinc-500">
                        <span className="text-green-600">
                          humanlog.io/install.sh
                        </span>
                        : looking up latest release
                        <br />
                        <span className="text-green-600">
                          humanlog.io/install.sh
                        </span>
                        : installing latest release
                        <br />
                        ########################################################################
                        100.0%
                        <br />
                        <span className="text-green-600">
                          humanlog.io/install.sh
                        </span>
                        : humanlog was successfully installed
                        <br />
                        <span className="text-green-600">
                          humanlog.io/install.sh
                        </span>
                        : Run 'humanlog --help' to get started
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Install, sign up and get started in one command</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="mb-5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="text-emerald-400">$ </span>
                        <span>{queryCommand}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Run queries against historical data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="mb-5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="text-emerald-400">$ </span>
                        <span>{streamCommand}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stream and query real-time data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        </div>

        {/* UI Screenshot - use real SessionPanel component with Logs/Traces toggle and share button */}
        <div className="order-2 mt-2 w-full lg:order-2 lg:mt-0 lg:w-1/2">
          <Card className="overflow-hidden rounded-lg border border-zinc-200 shadow-md dark:border-zinc-800">
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
                <div className="p-3">
                  <SessionPanel
                    providedData={sampleLogs().data}
                    query={undefined}
                    mode={mode}
                    themes={themes}
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
                <div className="p-3">
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

      {/* Feature badges - horizontally scrollable on mobile, left-aligned on desktop */}
      <div className="-mx-2 mb-4 overflow-x-auto px-2 pb-2">
        <div className="flex min-w-max gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
                >
                  <Activity className="mr-2 h-4 w-4 flex-shrink-0" />
                  Real-Time Streaming
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Monitor your logs and traces as they happen in real-time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
                >
                  <Terminal className="mr-2 h-4 w-4 flex-shrink-0" />
                  OTLP Collector
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <b>
                  <code>OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317</code>
                </b>
                <p>
                  Finally see what your app is doing. Right away. Not after days
                  of setup.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
                >
                  <Laptop className="mr-2 h-4 w-4 flex-shrink-0" />
                  Logs & Traces Local-First
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <b>Privacy and speed</b>
                <p>
                  Keep your data locally. Leverage local processing for snappy
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
                  className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
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
      <div className="mb-4 flex flex-col gap-3 space-y-3 sm:flex-row sm:space-y-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-11"
              onClick={() =>
                copyToClipboard(installCommand, "Installation command")
              }
            >
              Install & Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent className="w-auto max-w-[80vw] min-w-[500px]">
            <DialogHeader>
              <DialogTitle>Install Humanlog 💻</DialogTitle>
              <DialogDescription>
                Open a terminal and paste. The command has been copied to your
                clipboard!
              </DialogDescription>
            </DialogHeader>

            <div
              onClick={() => copyToClipboard(installCommand)}
              tabIndex={1}
              className="bg-muted flex w-full max-w-2xl cursor-pointer flex-row items-center justify-between gap-4 rounded-md px-4 py-3 hover:bg-gray-200 focus:ring-4 focus:ring-slate-100 dark:hover:bg-gray-800"
            >
              <code className="truncate">{installCommand}</code>
              <Copy size={14} className="flex-none" />
            </div>

            {/* OS-specific instructions */}
            <div className="text-muted-foreground space-y-2 text-xs">
              {(() => {
                if (typeof window !== "undefined") {
                  const ua = window.navigator.userAgent;
                  if (/Macintosh|Mac OS X/.test(ua)) {
                    // macOS: show nothing
                    return null;
                  } else if (/Linux/.test(ua)) {
                    return (
                      <div>
                        <b>Linux:</b> The query engine works, but isn't as
                        polished and needs to be run manually. See{" "}
                        <a
                          href="/docs/get-started/installation"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          installation instructions
                        </a>
                        .
                      </div>
                    );
                  } else if (/Windows/.test(ua)) {
                    return (
                      <div>
                        <b>Windows:</b> Not supported yet. Please{" "}
                        <a href="/support" className="underline">
                          contact us
                        </a>{" "}
                        to express your interest!
                      </div>
                    );
                  }
                }
                // Fallback: show all
                return (
                  <>
                    <div>
                      <b>macOS:</b> Paste into your terminal. No sudo required.
                    </div>
                    <div>
                      <b>Linux:</b> The query engine works, but isn't as
                      polished and needs to be run manually. See{" "}
                      <a
                        href="/docs/get-started/installation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        installation instructions
                      </a>
                      .
                    </div>
                    <div>
                      <b>Windows:</b> Not supported yet. Please{" "}
                      <a href="/support" className="underline">
                        contact us
                      </a>{" "}
                      to express your interest!
                    </div>
                  </>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
        <a
          href="/link/github"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="lg" className="h-11 px-6">
            <Github className="mr-2 h-4 w-4" />
            View on GitHub
          </Button>
        </a>
      </div>

      {/* Trust signals */}
      <div className="mb-6 flex flex-wrap gap-6 text-sm text-gray-500">
        <div className="flex items-center">
          <Star className="mr-2 h-4 w-4" />
          <a
            href="https://github.com/humanlogio/humanlog/stargazers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            <span>{githubStars} stars on GitHub</span>
          </a>
        </div>
        <div className="flex items-center">
          <Building className="mr-2 h-4 w-4" />
          <span>
            Built and used by engineers at GitHub, CloudFlare, PlanetScale,
            DigitalOcean, and more
          </span>
        </div>
      </div>

      {/* Beta signup banner */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-6 md:flex-row dark:bg-zinc-800/50">
        <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
          Signup for our private beta of Humanlog Cloud. Reuse everything you
          learn locally, skills transfer 1:1, spots limited to 50 engineers.
        </h3>

        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row md:mt-0 md:w-auto">
          <Input
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
            className="w-full sm:w-[24rem]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex w-full flex-col sm:w-auto">
            <Button className="whitespace-nowrap">Keep Me Posted</Button>
            <p className="mt-2 text-center text-sm text-gray-500 md:text-right">
              Handwritten 📨 from me, no spam!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboveFoldHero;
