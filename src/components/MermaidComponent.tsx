"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidComponentProps {
  chart: string;
}

export default function MermaidComponent({ chart }: MermaidComponentProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });

    const renderChart = async () => {
      if (!mermaidRef.current) return;

      try {
        const { svg } = await mermaid.render("mermaid-svg", chart);
        setSvg(svg);
        setError(null);
      } catch (e) {
        console.error("Mermaid rendering error:", e);
        setError("Failed to render diagram. Please check your Mermaid syntax.");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-sm">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-auto">
      <div ref={mermaidRef} className="hidden" />
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
