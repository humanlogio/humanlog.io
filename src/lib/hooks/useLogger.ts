import { useCallback, useMemo } from "react";
import { useApiClients } from "@/context/api-provider";
import pino, { Logger } from "pino";
import { IngestRequest } from "api/js/svc/ingest/v1/service_pb";
import { LogEvent } from "api/js/types/v1/logevent_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { makeStructuredLogEvent } from "@/lib/utils/logEventFactories";
import { makeStrKV, makeF64KV, makeI64KV } from "@/lib/utils/kvFactories";
import { newStrVal } from "@/lib/utils/valueFactories";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
type LogObject = Record<string, any>;
interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  category?:
    | "api_call"
    | "user_interaction"
    | "component_lifecycle"
    | "error"
    | "performance"
    | "system"
    | "manual_test"
    | "level_test";
  duration?: number;
  status?: number;
  endpoint?: string;
  [key: string]: any;
}

const valueToKV = (key: string, value: any): KV => {
  if (value === null || value === undefined) {
    return new KV({ key, value: newStrVal("null") });
  }

  if (typeof value === "string") {
    return makeStrKV(key, value);
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? makeI64KV(key, value)
      : makeF64KV(key, value);
  }

  if (typeof value === "boolean") {
    return new KV({
      key,
      value: new Val({
        kind: { case: "bool", value: value },
      }),
    });
  }

  // For objects, arrays, or other types, stringify them
  return makeStrKV(key, JSON.stringify(value));
};

// Helper function to convert JSON log to protobuf format using factory functions
const objToProtobuf = (logData: LogObject): LogEvent => {
  // Create timestamp using existing approach
  const timestamp = logData.time
    ? Timestamp.fromDate(new Date(logData.time))
    : Timestamp.fromDate(new Date());

  // Convert key-value pairs using factory functions
  const kvs: KV[] = [];
  for (const [key, value] of Object.entries(logData)) {
    if (key === "time" || key === "level" || key === "msg") continue;

    // Use the valueToKV helper function
    kvs.push(valueToKV(key, value));
  }

  // Create structured log event using factory function
  const structured = makeStructuredLogEvent(
    timestamp,
    (logData.level || "").toUpperCase(),
    logData.msg || logData.message || "",
    kvs,
  );

  // Create log event
  return new LogEvent({
    parsedAt: Timestamp.fromDate(new Date()),
    raw: new Uint8Array(),
    structured: structured,
  });
};

export const useLogger = () => {
  const { apiClients } = useApiClients();

  const sendToHumanlog = useCallback(
    async (obj: LogObject) => {
      if (!apiClients) return;

      const logEvent = objToProtobuf(obj);

      const machineId = BigInt(1); // Simple machine ID for browser
      const sessionId = BigInt(Date.now()); // Use timestamp as session ID

      // Use ingestStream with async generator pattern
      const request = new IngestRequest({
        machineId: machineId,
        sessionId: sessionId,
        events: [logEvent],
      });

      // // Create async generator for client streaming
      // async function* generateRequests() {
      //   yield request;
      // }

      // Send to humanlog via ingestStream (client streaming)
      await apiClients.ingest.ingest(request);
    },
    [apiClients],
  );

  // Create pino logger with humanlog integration
  const pinoLogger = useMemo((): Logger => {
    return pino({
      level: "trace", // Output all log levels
      browser: {
        // Force JSON string output to console in browser
        serialize: true,
        asObject: false, // Output as JSON string, not object
        write: {
          // Output JSON string to console + auto-send to humanlog
          info: (obj: LogObject) => {
            sendToHumanlog(obj);
          },
          debug: (obj: LogObject) => {
            sendToHumanlog(obj);
          },
          warn: (obj: LogObject) => {
            sendToHumanlog(obj);
          },
          error: (obj: LogObject) => {
            sendToHumanlog(obj);
          },
          fatal: (obj: LogObject) => {
            sendToHumanlog(obj);
          },
          trace: (obj: LogObject) => {
            sendToHumanlog(obj);
          },
        },
        // More explicit formatter settings for browser
        formatters: {
          level: (label, level) => {
            // Output level as string for humanlog recognition
            return { level: label };
          },
          log: (object) => {
            // Ensure clear JSON structure in browser environment
            return {
              ...object,
              url: window.location.href,
              userAgent: navigator.userAgent,
            };
          },
        },
      },
      formatters: {
        level: (label, level) => {
          // Output level as string for humanlog recognition
          return { level: label };
        },
        log: (object) => {
          // Add basic metadata
          return {
            ...object,
            url: window.location.href,
            userAgent: navigator.userAgent,
          };
        },
      },
      // Additional settings for humanlog compatibility
      messageKey: "msg", // Set message field to 'msg'
      timestamp: pino.stdTimeFunctions.isoTime, // ISO format timestamp in 'time' field
      // Additional humanlog compatibility settings
      base: null, // Remove default metadata (pid, hostname, etc.)
    });
  }, [sendToHumanlog]);

  // Logger methods
  const logger = useMemo(
    () => ({
      // Basic logging methods
      trace: (message: string, context?: LogContext) => {
        if (context) {
          pinoLogger.trace(context, message);
        } else {
          pinoLogger.trace(message);
        }
      },

      debug: (message: string, context?: LogContext) => {
        if (context) {
          pinoLogger.debug(context, message);
        } else {
          pinoLogger.debug(message);
        }
      },

      info: (message: string, context?: LogContext) => {
        if (context) {
          pinoLogger.info(context, message);
        } else {
          pinoLogger.info(message);
        }
      },

      warn: (message: string, context?: LogContext) => {
        if (context) {
          pinoLogger.warn(context, message);
        } else {
          pinoLogger.warn(message);
        }
      },

      error: (message: string, context?: LogContext) => {
        if (context) {
          pinoLogger.error(context, message);
        } else {
          pinoLogger.error(message);
        }
      },

      fatal: (message: string, context?: LogContext) => {
        if (context) {
          pinoLogger.fatal(context, message);
        } else {
          pinoLogger.fatal(message);
        }
      },

      // General log method with level
      log: (level: LogLevel, message: string, context?: LogContext) => {
        if (context) {
          pinoLogger[level](context, message);
        } else {
          pinoLogger[level](message);
        }
      },

      // Specific logging methods
      logUserAction: (
        action: string,
        metadata?: Omit<LogContext, "category" | "action">,
        level: LogLevel = "info",
      ) => {
        const logContext = {
          category: "user_interaction" as const,
          action,
          ...metadata,
        };
        if (logContext) {
          pinoLogger[level](logContext, `User action: ${action}`);
        } else {
          pinoLogger[level](`User action: ${action}`);
        }
      },

      logApiCall: (
        endpoint: string,
        duration: number,
        status: number,
        metadata?: Omit<
          LogContext,
          "category" | "endpoint" | "duration" | "status"
        >,
        level?: LogLevel,
      ) => {
        // Default level determined by status code, use explicit level if provided
        const autoLevel: LogLevel =
          status >= 500 ? "error" : status >= 400 ? "warn" : "info";
        const finalLevel = level || autoLevel;

        const logContext = {
          category: "api_call" as const,
          endpoint,
          duration,
          status,
          ...metadata,
        };

        pinoLogger[finalLevel](logContext, `API call to ${endpoint}`);
      },

      logComponentLifecycle: (
        component: string,
        event: "mount" | "unmount" | "render",
        metadata?: Omit<LogContext, "category" | "component">,
        level: LogLevel = "debug",
      ) => {
        const logContext = {
          category: "component_lifecycle" as const,
          component,
          event,
          ...metadata,
        };

        pinoLogger[level](logContext, `Component ${event}: ${component}`);
      },

      logPerformance: (
        operation: string,
        duration: number,
        metadata?: Omit<LogContext, "category" | "duration">,
        level?: LogLevel,
      ) => {
        // Automatic level determination based on performance
        const autoLevel: LogLevel =
          duration > 5000
            ? "error"
            : duration > 2000
              ? "warn"
              : duration > 1000
                ? "info"
                : "debug";

        const finalLevel = level || autoLevel;

        const logContext = {
          category: "performance" as const,
          operation,
          duration,
          ...metadata,
        };

        pinoLogger[finalLevel](logContext, `Performance: ${operation}`);
      },

      logError: (
        error: Error | string,
        context?: LogContext,
        level: LogLevel = "error",
      ) => {
        const errorInfo =
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : { message: error };

        const logContext = {
          category: "error" as const,
          error: errorInfo,
          ...context,
        };

        pinoLogger[level](
          logContext,
          `Error occurred: ${typeof error === "string" ? error : error.message}`,
        );
      },

      logHttpRequest: (
        method: string,
        url: string,
        status: number,
        duration: number,
        level?: LogLevel,
      ) => {
        const autoLevel: LogLevel =
          status >= 500
            ? "error"
            : status >= 400
              ? "warn"
              : duration > 2000
                ? "warn"
                : "info";

        const finalLevel = level || autoLevel;

        const logContext = {
          category: "api_call" as const,
          method,
          url,
          status,
          duration,
          type: "http_request",
        };

        pinoLogger[finalLevel](logContext, `${method} ${url}`);
      },

      // Helper method for debugging
      debugPinoOutput: (
        message: string,
        context?: LogContext,
        level: LogLevel = "info",
      ) => {
        // Directly call pino logger to output for verification
        if (context) {
          pinoLogger[level](context, message);
        } else {
          pinoLogger[level](message);
        }

        console.log(
          JSON.stringify({
            level,
            time: new Date().toISOString(),
            msg: message,
            ...context,
          }),
        );
      },
    }),
    [pinoLogger],
  );

  return logger;
};

export type { LogContext };
