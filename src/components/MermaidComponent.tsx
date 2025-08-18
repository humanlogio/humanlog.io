"use client";

import React, { useEffect, useState, useCallback } from "react";
import mermaid from "mermaid";
import LoadingIndicator from "@/components/loading-indicator";
import { Loader2 } from "lucide-react";
import PageLoader from "next/dist/client/page-loader";

interface MermaidComponentProps {
  chart: string;
}

export default function MermaidComponent({ chart }: MermaidComponentProps) {
  const [svg, setSvg] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderChart = useCallback(async () => {
    if (!isMounted || !chart.trim()) {
      setError("Invalid chart data");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: "inherit",
      });

      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { svg: renderedSvg } = await mermaid.render(id, chart.trim());

      setSvg(renderedSvg);
      setIsLoading(false);
    } catch (e) {
      console.error("Mermaid rendering error:", e);
      setError(e instanceof Error ? e.message : "Failed to render diagram");
      setIsLoading(false);
    }
  }, [chart, isMounted]);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(renderChart, 100);
      return () => clearTimeout(timer);
    }
  }, [renderChart]);

  if (!isMounted) {
    return (
      <div className="my-6 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-pulse rounded bg-gray-300"></div>
          <Loader2 className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-bold">Mermaid Rendering Error:</p>
        <p>{error}</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">
            View chart code
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-sm text-gray-800">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-6 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-8">
        <div className="flex flex-col items-center gap-1">
          <Loader2 className="text-muted-foreground animate-spin" />
          <div className="text-gray-600">Rendering diagram...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-auto">
      <div
        className="flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
