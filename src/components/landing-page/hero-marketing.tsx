"use client";

import React, { useState, useEffect } from "react";
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
import { sampleProvidedLogData } from "./sample-protobuf-data";
import { defaultConfig } from "@/services/localhostService";
import { useTheme } from "next-themes";
import { FormatConfig_Themes, FormatConfig_Theme } from "api/js/types/v1/localhost_config_pb";
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
} from "lucide-react";

const AboveFoldHero: React.FC = () => {
  const { theme: colorMode } = useTheme();
  // Add state for logs/traces toggle
  const [selectedTab, setSelectedTab] = useState<'logs' | 'traces'>('logs');

  // Fallback to system if colorMode is undefined
  let mode: "light" | "dark" = "light";
  if (colorMode === "dark") mode = "dark";
  if (colorMode === "system" && typeof window !== "undefined") {
    mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  // Compose the themes object for SessionPanel (FormatConfig_Themes)
  const getThemeJson = (theme: FormatConfig_Theme) => {
  if (theme && typeof theme.toJson === "function") return theme.toJson();
  // fallback: ensure plain object for proto messages
  return JSON.parse(JSON.stringify(theme));
};
const themes: FormatConfig_Themes | undefined = (defaultConfig.formatter?.themes &&
  defaultConfig.formatter.themes.light &&
  defaultConfig.formatter.themes.dark)
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
  const installCommand = 'curl -sSL "https://humanlog.dev/install.sh" | bash';
  const queryCommand = "humanlog query 'logs | where level==\"error\"'";

  return (
    <div className="px-4 pt-[80px] sm:px-8">
      {/* Header content - minimal margin */}
      <div className="mb-4 w-full">
        <h1 className="text-4xl leading-tight font-extrabold md:text-[3.5rem]">
          Observability on Your Laptop and in Your Browser
        </h1>

        <p className="text-muted-foreground mt-2 text-lg">
          Run local logs & traces, query in CLI or UI, then share results with
          teammates—entirely on your machine.
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
              <div className="mb-5">
                <span className="text-emerald-400">$ </span>
                <span>{installCommand}</span>
              </div>
              <div className="mb-6 text-zinc-500">
                Installing Humanlog CLI...
                <br />
                Humanlog installed successfully! 🎉
              </div>

              <div className="mb-5">
                <span className="text-emerald-400">$ </span>
                <span>{queryCommand}</span>
              </div>
              <div className="text-zinc-500">
                Found 12 log entries matching your query
                <br />
                Displaying results with level:error...
              </div>
            </div>
          </Card>
        </div>

        {/* UI Screenshot - use real SessionPanel component with Logs/Traces toggle and share button */}
        <div className="order-2 mt-4 w-full lg:order-2 lg:mt-0 lg:w-1/2">
          <Card className="overflow-hidden rounded-lg border border-zinc-200 shadow-md dark:border-zinc-800">
            {/* Logs | Traces toggle */}
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded font-medium text-sm ${selectedTab === 'logs' ? 'bg-zinc-200 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedTab('logs')}
                  aria-pressed={selectedTab === 'logs'}
                >
                  Logs
                </button>
                <button
                  className={`px-3 py-1 rounded font-medium text-sm ${selectedTab === 'traces' ? 'bg-zinc-200 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedTab('traces')}
                  aria-pressed={selectedTab === 'traces'}
                >
                  Traces
                </button>
              </div>
              {/* Share/Copy button */}
              <button
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                title="Copy link to results"
                aria-label="Copy link to results"
              >
                <Share className="h-4 w-4" /> Copy link
              </button>
            </div>
            <div className="p-4">
              {selectedTab === 'logs' ? (
                <SessionPanel
                  providedData={sampleProvidedLogData()}
                  query={undefined}
                  mode={mode}
                  themes={themes}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {/* Replace with <SessionPanel ... /> for traces if you have sampleSpansQueryRes and SessionPanel supports it */}
                  Traces preview coming soon.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Feature badges - horizontally scrollable on mobile, left-aligned on desktop */}
      <div className="-mx-2 mb-4 overflow-x-auto px-2 pb-2">
        <div className="flex min-w-max gap-3">
          <Badge
            variant="outline"
            className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
          >
            <Activity className="mr-2 h-4 w-4 flex-shrink-0" />
            Real-Time Streaming
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
          >
            <Terminal className="mr-2 h-4 w-4 flex-shrink-0" />
            OTLP Collector
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
          >
            <Laptop className="mr-2 h-4 w-4 flex-shrink-0" />
            Logs & Traces Local-First
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full bg-zinc-100 px-3 py-1 whitespace-nowrap dark:bg-zinc-800"
          >
            <Share className="mr-2 h-4 w-4 flex-shrink-0" />
            Shareable Results
          </Badge>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="mb-4 flex flex-col gap-3 space-y-3 sm:flex-row sm:space-y-0">
        <Button size="lg" className="h-11">
          Install & Sign Up (macOS)
        </Button>
        <a
          href="https://github.com/humanlogio/humanlog"
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
          <span>{githubStars} stars on GitHub</span>
        </div>
        <div className="flex items-center">
          <Building className="mr-2 h-4 w-4" />
          <span>Built by engineers who've shipped observability at scale</span>
        </div>
      </div>

      {/* Beta signup banner */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-6 md:flex-row dark:bg-zinc-800/50">
        <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
          Join our private beta of Humanlog Cloud—reuse everything you learn
          locally, skills transfer 1:1, spots limited to 50 engineers.
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
          <Button className="whitespace-nowrap">Keep Me Posted</Button>
        </div>
      </div>
    </div>
  );
};

export default AboveFoldHero;
