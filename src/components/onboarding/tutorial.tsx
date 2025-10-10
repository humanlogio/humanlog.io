"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Loader,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Activity,
  Search,
  Check,
  SkipForward,
} from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import { useEnvironmentStore } from "@/stores/environment-store";
import { getOrgEnvUrl } from "@/lib/utils/navigation";
import { useUser } from "@/hooks/useUser";

const tutorialSteps = [
  {
    title: "Welcome to Humanlog",
    subtitle: "Let's get you started with data ingestion",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Humanlog helps you visualize and query your logs and traces in a
          beautiful, human-friendly way.
        </p>
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
            What you&apos;ll learn:
          </h4>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• How to ingest logs from your applications</li>
            <li>• Setting up OpenTelemetry tracing</li>
            <li>• Querying and filtering your data</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Ingesting Logs",
    subtitle: "Connect your application logs to Humanlog",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          There are several ways to get your logs into Humanlog:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border p-3 dark:border-gray-700">
            <h4 className="mb-2 flex items-center text-sm font-semibold">
              <Terminal className="mr-2 h-4 w-4 text-blue-500" />
              Pipe from your application
            </h4>
            <CodeBlock code="my_app | humanlog" />
          </div>

          <div className="rounded-lg border p-3 dark:border-gray-700">
            <h4 className="mb-2 flex items-center text-sm font-semibold">
              <Terminal className="mr-2 h-4 w-4 text-green-500" />
              Feed from a log file
            </h4>
            <CodeBlock code="humanlog < your_log_file" />
          </div>

          <div className="rounded-lg border p-3 dark:border-gray-700">
            <h4 className="mb-2 flex items-center text-sm font-semibold">
              <Terminal className="mr-2 h-4 w-4 text-purple-500" />
              Ingest without printing
            </h4>
            <CodeBlock code="my_app | humanlog ingest" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "OpenTelemetry Tracing",
    subtitle: "Automatic tracing data collection",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Humanlog automatically listens for OpenTelemetry data on ports 4317
          and 4318.
        </p>

        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
          <h4 className="mb-2 flex items-center font-semibold text-green-900 dark:text-green-100">
            <Activity className="mr-2 h-4 w-4" />
            Zero Configuration Required
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200">
            Most applications work out of the box with default OpenTelemetry
            settings.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">
            Common Environment Variables:
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-800">
              <span className="font-mono">OTEL_EXPORTER_OTLP_ENDPOINT</span>
              <span className="text-gray-500">http://localhost:4317</span>
            </div>
            <div className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-800">
              <span className="font-mono">Docker/Kind</span>
              <span className="text-gray-500">
                http://host.docker.internal:4317
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Monitoring Your Data",
    subtitle: "Query and visualize your logs and traces",
    content: (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Once your data is flowing, you can monitor and query it in real-time:
        </p>

        <div className="rounded-lg border p-3 dark:border-gray-700">
          <h4 className="mb-2 flex items-center text-sm font-semibold">
            <Search className="mr-2 h-4 w-4 text-orange-500" />
            Stream traces
          </h4>
          <CodeBlock code="humanlog stream 'spans | filter true'" />
          <p className="mt-2 text-xs text-gray-500">
            Note: Tracing can produce lots of data. Real-time visualization may
            impact browser performance.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    subtitle: "Start exploring your data",
    content: (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          You now know how to ingest logs and traces into Humanlog. Start
          sending your data and explore the powerful querying capabilities!
        </p>
        <button
          onClick={() => window.open("/docs/reference", "_blank")}
          className="underline hover:font-semibold"
        >
          Learn More about Humanlogql
        </button>
      </div>
    ),
  },
];

export const Tutorial = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { activeEnvironment } = useEnvironmentStore();
  const { userData } = useUser();

  const [isCompleting, setIsCompleting] = useState(false);

  const tutorialParam = searchParams.get("tutorial");
  const currentStep =
    tutorialParam && tutorialParam.startsWith("step")
      ? parseInt(tutorialParam.replace("step", "")) - 1
      : 0;

  const redirectUrl = getOrgEnvUrl(userData, activeEnvironment, "query");

  const handleNext = () => {
    setIsCompleting(true);

    const url = getOrgEnvUrl(
      userData,
      activeEnvironment,
      `query?tutorial=step${currentStep + 2}`,
    );
    if (currentStep < tutorialSteps.length - 1) {
      router.replace(url);
    } else {
      handleComplete();
    }

    setIsCompleting(false);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const url = getOrgEnvUrl(
        userData,
        activeEnvironment,
        `query?tutorial=step${currentStep}`,
      );
      router.replace(url);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      toast.success("Welcome to Humanlog! You're ready to start exploring.");
      router.replace(redirectUrl);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    setIsCompleting(true);
    try {
      toast.success("Welcome to Humanlog!");
      router.replace(redirectUrl);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsCompleting(false);
    }
  };

  if (currentStep < 0 || currentStep >= tutorialSteps.length) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div>
      <div className="mb-2 flex w-full justify-end">
        <button
          onClick={handleSkip}
          className="text-muted-foreground flex items-center text-sm hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <SkipForward className="ml-[2px] h-3 w-3" />
          Skip
        </button>
      </div>
      <div className="h-[500px]">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold dark:text-white">
            {currentStepData.title}
          </h1>
          <p className="mt-2 text-gray-400">{currentStepData.subtitle}</p>

          {/* Progress indicators */}
          <div className="mt-4 flex justify-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index <= currentStep
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-8 min-h-[300px]">{currentStepData.content}</div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-gray-500">
          {currentStep + 1} of {tutorialSteps.length}
        </span>

        <Button
          onClick={handleNext}
          disabled={isCompleting}
          className="flex items-center"
        >
          {isCompleting ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : currentStep === tutorialSteps.length - 1 ? (
            "Get Started"
          ) : (
            <>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
