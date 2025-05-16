"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Terminal,
  Laptop,
  Share,
  Search,
  BarChart,
} from "lucide-react";

const FeatureGridSection: React.FC = () => {
  const features = [
    {
      icon: <Activity className="h-4 w-4" />,
      title: "Real-Time Streaming",
      description: "See logs and traces flow live as you code.",
    },
    {
      icon: <Terminal className="h-4 w-4" />,
      title: "OTLP Collector",
      description: "Capture OpenTelemetry data with zero configuration.",
    },
    {
      icon: <Laptop className="h-4 w-4" />,
      title: "Local-First",
      description: "Your data stays on your device until you choose to share it.",
    },
    {
      icon: <Share className="h-4 w-4" />,
      title: "Shareable Results",
      description: "Generate links to share insights with your team.",
    },
    {
      icon: <Search className="h-4 w-4" />,
      title: "Powerful Queries",
      description: "Filter, aggregate, and analyze with a SQL-like language.",
    },
    {
      icon: <BarChart className="h-4 w-4" />,
      title: "Visualization",
      description: "Automatically create charts from your query results.",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl py-16 px-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 flex flex-col">
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {feature.icon}
            </div>
            <h3 className="mb-2 font-medium">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureGridSection;
