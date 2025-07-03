import { collectorOptions, OTEL_CONFIG } from "@/context/otel-provider";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { getCurrentTraceContext } from "@/lib/otel-browser";
import config from "@/features/config";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

const isProd = config.NEXT_PUBLIC_IS_PROD;

interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

// Severity mapping according to OpenTelemetry spec
const SEVERITY_MAP: Record<LogLevel, { number: number; text: string }> = {
  trace: { number: 1, text: "TRACE" },
  debug: { number: 5, text: "DEBUG" },
  info: { number: 9, text: "INFO" },
  warn: { number: 13, text: "WARN" },
  error: { number: 17, text: "ERROR" },
  fatal: { number: 21, text: "FATAL" },
};

// Create a singleton logger provider
class TelemetryLogger {
  private loggerProvider: LoggerProvider;
  private logger: any;

  constructor() {
    const collectorOptionsForLogs = {
      url: `${OTEL_CONFIG.baseUrl}/v1/logs`,
      ...collectorOptions,
    };
    const logExporter = new OTLPLogExporter(collectorOptionsForLogs);
    this.loggerProvider = new LoggerProvider();
    this.loggerProvider.addLogRecordProcessor(
      new BatchLogRecordProcessor(logExporter),
    );
    this.logger = this.loggerProvider.getLogger(
      OTEL_CONFIG.serviceName,
      "1.0.0",
    );
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    // Only log in non-production environments
    if (isProd) {
      return;
    }

    const severity = SEVERITY_MAP[level];
    const traceContext = getCurrentTraceContext();

    const attributes: Record<string, string> = {
      component: "frontend-logger",
      level: level,
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Add trace context if available
    if (traceContext) {
      attributes.trace_id = traceContext.traceId;
      attributes.span_id = traceContext.spanId;
      attributes.trace_flags = String(traceContext.traceFlags);
    }

    // Convert all values to strings for OpenTelemetry compatibility
    const stringAttributes: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      stringAttributes[key] = String(value);
    }

    this.logger.emit({
      severityNumber: severity.number,
      severityText: severity.text,
      body: message,
      attributes: stringAttributes,
    });
  }

  trace(message: string, context?: LogContext) {
    this.log("trace", message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  }

  fatal(message: string, context?: LogContext) {
    this.log("fatal", message, context);
  }
}

export const logger = new TelemetryLogger();

export const { trace, debug, info, warn, error, fatal } = logger;
