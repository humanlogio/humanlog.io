"use client";

import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  WebTracerProvider,
} from "@opentelemetry/sdk-trace-web";
import config from "@/features/config";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { createContext, ReactNode } from "react";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { B3Propagator } from "@opentelemetry/propagator-b3";

type OTELProviderType = {
  provider: WebTracerProvider;
};

const OTELClientContext = createContext<OTELProviderType | null>(null);

export function OTELProvider({ children }: { children: ReactNode }) {
  const isProd = config.NEXT_PUBLIC_IS_PROD;
  if (isProd) {
    // don't trace in prod
    return (
      <OTELClientContext.Provider value={null}>
        {children}
      </OTELClientContext.Provider>
    );
  }

  const collectorOptions = {
    url: "http://localhost:4318/v1/traces", // url is optional and can be omitted - default is http://localhost:4318/v1/traces
    headers: {}, // an optional object containing custom headers to be sent with each request
    concurrencyLimit: 10, // an optional limit on pending requests
  };
  const exporter = new OTLPTraceExporter(collectorOptions);
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "humanlog frontend",
  });
  const provider = new WebTracerProvider({
    resource: resource,
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
    propagator: new B3Propagator(),
  });
  registerInstrumentations({
    instrumentations: [
      ...getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-document-load": {},
        "@opentelemetry/instrumentation-user-interaction": {},
        "@opentelemetry/instrumentation-fetch": {
          propagateTraceHeaderCorsUrls: [
            /http\:\/\/localhost\:32764.*/,
            /https\:\/\/api\.humanlog\.io.*/,
            /https\:\/\/api\.humanlog\.dev.*/,
          ],
        },
        "@opentelemetry/instrumentation-xml-http-request": {
          propagateTraceHeaderCorsUrls: [
            /http\:\/\/localhost\:32764.*/,
            /https\:\/\/api\.humanlog\.io.*/,
            /https\:\/\/api\.humanlog\.dev.*/,
          ],
        },
      }),
    ],
  });

  const out = { provider: provider };

  return (
    <OTELClientContext.Provider value={out}>
      {children}
    </OTELClientContext.Provider>
  );
}
