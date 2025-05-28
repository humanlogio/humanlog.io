"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import the Mermaid component with dynamic loading (client-side only)
const MermaidComponent = dynamic(
  () => import("@/components/MermaidComponent"),
  { ssr: false },
);

interface MermaidRendererProps {
  code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
  return <MermaidComponent chart={code} />;
}
