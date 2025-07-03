"use client";

import {
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

// Shared OTEL configuration
export const OTEL_CONFIG = {
  baseUrl: "http://localhost:4318",
  serviceName: "humanlog frontend",
  headers: {},
  concurrencyLimit: 10,
};

export const collectorOptions = {
  headers: OTEL_CONFIG.headers,
  concurrencyLimit: OTEL_CONFIG.concurrencyLimit,
};

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

  const collectorOptionsForTraces = {
    url: `${OTEL_CONFIG.baseUrl}/v1/traces`,
    ...collectorOptions,
  };

  const traceExporter = new OTLPTraceExporter(collectorOptionsForTraces);
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "humanlog frontend",
  });
  const traceProvider = new WebTracerProvider({
    resource: resource,
    spanProcessors: [
      new BatchSpanProcessor(traceExporter, {
        maxQueueSize: 100,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 500,
        exportTimeoutMillis: 30000,
      }),
    ],
  });

  traceProvider.register({
    // Changing default contextManager to use ZoneContextManager - supports asynchronous operations - optional
    contextManager: new ZoneContextManager(),
    propagator: new B3Propagator(),
  });
  registerInstrumentations({
    instrumentations: [
      ...getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-document-load": {},
        // "@opentelemetry/instrumentation-user-interaction": {}, // too noisy
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

  const out = { provider: traceProvider };

  return (
    <OTELClientContext.Provider value={out}>
      {children}
    </OTELClientContext.Provider>
  );
}
