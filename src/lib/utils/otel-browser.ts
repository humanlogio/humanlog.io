// Simple browser-side OpenTelemetry client
import { trace, context, SpanStatusCode, SpanKind } from "@opentelemetry/api";

// Simple trace ID generator
const generateTraceId = (): string => {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
};

// Simple span ID generator
const generateSpanId = (): string => {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
};

class SimpleBrowserTracer {
  private tracer = trace.getTracer("humanlog-frontend", "1.0.0");

  startSpan(
    name: string,
    options?: {
      kind?: SpanKind;
      attributes?: Record<string, string | number | boolean>;
    },
  ) {
    const span = this.tracer.startSpan(name, {
      kind: options?.kind || SpanKind.INTERNAL,
      attributes: options?.attributes,
    });

    return span;
  }

  withSpan<T>(span: any, fn: () => T): T {
    return context.with(trace.setSpan(context.active(), span), fn);
  }

  getCurrentSpan() {
    return trace.getActiveSpan();
  }

  getCurrentTraceContext() {
    const span = this.getCurrentSpan();
    if (span) {
      const spanContext = span.spanContext();
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        traceFlags: spanContext.traceFlags,
      };
    }
    return null;
  }
}

// Export singleton instance
export const browserTracer = new SimpleBrowserTracer();

// Helper functions for common operations
export const withSpan = <T>(
  name: string,
  fn: () => T,
  options?: { attributes?: Record<string, any> },
): T => {
  const span = browserTracer.startSpan(name, options);
  try {
    return browserTracer.withSpan(span, fn);
  } finally {
    span.end();
  }
};

export const withAsyncSpan = async <T>(
  name: string,
  fn: () => Promise<T>,
  options?: { attributes?: Record<string, any> },
): Promise<T> => {
  const span = browserTracer.startSpan(name, options);
  try {
    return await browserTracer.withSpan(span, fn);
  } catch (error) {
    span.recordException(error as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    throw error;
  } finally {
    span.end();
  }
};

export const getCurrentTraceContext = () =>
  browserTracer.getCurrentTraceContext();
