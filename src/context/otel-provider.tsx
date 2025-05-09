"use client";

import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { createContext, ReactNode } from "react";

type OTELProviderType = {
  provider: WebTracerProvider;
};

const OTELClientContext = createContext<OTELProviderType | null>(null);

export function OTELProvider({ children }: { children: ReactNode }) {
  const collectorOptions = {
    url: "http://localhost:4318/v1/traces", // url is optional and can be omitted - default is http://localhost:4318/v1/traces
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 10, // an optional limit on pending requests
  };
  const exporter = new OTLPTraceExporter(collectorOptions);
  const provider = new WebTracerProvider({
    spanProcessors: [
      new SimpleSpanProcessor(new ConsoleSpanExporter()),
      new BatchSpanProcessor(exporter, {
        // The maximum queue size. After the size is reached spans are dropped.
        maxQueueSize: 100,
        // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
        maxExportBatchSize: 10,
        // The interval between two consecutive exports
        scheduledDelayMillis: 500,
        // How long the export can run before it is cancelled
        exportTimeoutMillis: 30000,
      }),
    ],
  });

  provider.register({
    // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
    contextManager: new ZoneContextManager(),
  });
  const out = { provider: provider };

  return (
    <OTELClientContext.Provider value={out}>
      {children}
    </OTELClientContext.Provider>
  );
}
