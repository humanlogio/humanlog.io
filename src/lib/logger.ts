import pino, { Logger } from "pino";

// Browser environment detection
const isBrowser = typeof window !== "undefined";

// Log level type definition
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

// Logger configuration - humanlog compatibility settings
const logger: Logger = pino({
  level: "trace", // Output all log levels
  browser: {
    // Force JSON string output to console in browser
    serialize: true,
    asObject: false, // Output as JSON string, not object
    write: {
      // Output JSON string to console + auto-send to humanlog
      info: (obj: any) => {
        const jsonString = JSON.stringify(obj);
        console.info(jsonString);
        sendToHumanlog(jsonString);
      },
      debug: (obj: any) => {
        const jsonString = JSON.stringify(obj);
        console.debug(jsonString);
        sendToHumanlog(jsonString);
      },
      warn: (obj: any) => {
        const jsonString = JSON.stringify(obj);
        console.warn(jsonString);
        sendToHumanlog(jsonString);
      },
      error: (obj: any) => {
        const jsonString = JSON.stringify(obj);
        console.error(jsonString);
        sendToHumanlog(jsonString);
      },
      fatal: (obj: any) => {
        const jsonString = JSON.stringify(obj);
        console.error(jsonString);
        sendToHumanlog(jsonString);
      },
      trace: (obj: any) => {
        const jsonString = JSON.stringify(obj);
        console.debug(jsonString);
        sendToHumanlog(jsonString);
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
          // Add browser metadata selectively
          ...(typeof window !== "undefined" && {
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: getSessionId(),
          }),
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
        ...(isBrowser && {
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: getSessionId(),
        }),
      };
    },
  },
  // Additional settings for humanlog compatibility
  messageKey: "msg", // Set message field to 'msg'
  timestamp: pino.stdTimeFunctions.isoTime, // ISO format timestamp in 'time' field
  // Additional humanlog compatibility settings
  base: null, // Remove default metadata (pid, hostname, etc.)
});

// Session ID generation and management
function getSessionId(): string {
  if (!isBrowser) return "server";

  let sessionId = sessionStorage.getItem("humanlog-session-id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("humanlog-session-id", sessionId);
  }
  return sessionId;
}

// Type definitions
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

// Logger wrapper class
class StructuredLogger {
  private pino: Logger;

  constructor(pinoInstance: Logger) {
    this.pino = pinoInstance;
  }

  // Basic logging methods - level can be specified directly
  trace(message: string, context?: LogContext) {
    if (context) {
      this.pino.trace(context, message);
    } else {
      this.pino.trace(message);
    }
  }

  debug(message: string, context?: LogContext) {
    if (context) {
      this.pino.debug(context, message);
    } else {
      this.pino.debug(message);
    }
  }

  info(message: string, context?: LogContext) {
    if (context) {
      this.pino.info(context, message);
    } else {
      this.pino.info(message);
    }
  }

  warn(message: string, context?: LogContext) {
    if (context) {
      this.pino.warn(context, message);
    } else {
      this.pino.warn(message);
    }
  }

  error(message: string, context?: LogContext) {
    if (context) {
      this.pino.error(context, message);
    } else {
      this.pino.error(message);
    }
  }

  fatal(message: string, context?: LogContext) {
    if (context) {
      this.pino.fatal(context, message);
    } else {
      this.pino.fatal(message);
    }
  }

  // Level can be specified directly for general logging method
  log(level: LogLevel, message: string, context?: LogContext) {
    if (context) {
      this.pino[level](context, message);
    } else {
      this.pino[level](message);
    }
  }

  // Specific logging methods - level can be specified optionally
  logUserAction(
    action: string,
    metadata?: Omit<LogContext, "category" | "action">,
    level: LogLevel = "info",
  ) {
    this.log(level, `User action: ${action}`, {
      category: "user_interaction",
      action,
      ...metadata,
    });
  }

  logApiCall(
    endpoint: string,
    duration: number,
    status: number,
    metadata?: Omit<
      LogContext,
      "category" | "endpoint" | "duration" | "status"
    >,
    level?: LogLevel,
  ) {
    // Default level determined by status code, use explicit level if provided
    const autoLevel: LogLevel =
      status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    const finalLevel = level || autoLevel;

    this.log(finalLevel, `API call to ${endpoint}`, {
      category: "api_call",
      endpoint,
      duration,
      status,
      ...metadata,
    });
  }

  logComponentLifecycle(
    component: string,
    event: "mount" | "unmount" | "render",
    metadata?: Omit<LogContext, "category" | "component">,
    level: LogLevel = "debug",
  ) {
    this.log(level, `Component ${event}: ${component}`, {
      category: "component_lifecycle",
      component,
      event,
      ...metadata,
    });
  }

  logPerformance(
    operation: string,
    duration: number,
    metadata?: Omit<LogContext, "category" | "duration">,
    level?: LogLevel,
  ) {
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

    this.log(finalLevel, `Performance: ${operation}`, {
      category: "performance",
      operation,
      duration,
      ...metadata,
    });
  }

  // Error logging - level can be specified directly (warn, error, fatal, etc.)
  logError(
    error: Error | string,
    context?: LogContext,
    level: LogLevel = "error",
  ) {
    const errorInfo =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : { message: error };

    this.log(
      level,
      `Error occurred: ${typeof error === "string" ? error : error.message}`,
      {
        category: "error",
        error: errorInfo,
        ...context,
      },
    );
  }

  // Method for logging HTTP requests (for Next.js request intercept)
  logHttpRequest(
    method: string,
    url: string,
    status: number,
    duration: number,
    level?: LogLevel,
  ) {
    const autoLevel: LogLevel =
      status >= 500
        ? "error"
        : status >= 400
          ? "warn"
          : duration > 2000
            ? "warn"
            : "info";

    const finalLevel = level || autoLevel;

    this.log(finalLevel, `${method} ${url}`, {
      category: "api_call",
      method,
      url,
      status,
      duration,
      type: "http_request",
    });
  }

  // Helper method for easily copying logs to humanlog in browser
  copyForHumanlog(
    message: string,
    context?: LogContext,
    level: LogLevel = "info",
  ) {
    const logEntry = {
      level,
      time: new Date().toISOString(),
      msg: message,
      ...context,
      ...(isBrowser && {
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
      }),
    };

    const jsonString = JSON.stringify(logEntry);

    if (isBrowser) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonString);
        console.log(
          `📋 Log copied to clipboard! Run in terminal: pbpaste | humanlog`,
        );
        console.log(`Raw log:`, logEntry);
      } else {
        console.log(`📋 Copy this log for humanlog:`, jsonString);
        console.log(`Raw log:`, logEntry);
      }
    }

    // Perform general logging as well
    this.log(level, message, context);
  }

  // Debugging actual pino output in browser
  debugPinoOutput(
    message: string,
    context?: LogContext,
    level: LogLevel = "info",
  ) {
    if (!isBrowser) return;

    console.log(`🔍 Debugging pino output for level: ${level}`);

    // Directly call pino logger to output for verification
    if (context) {
      this.pino[level](context, message);
    } else {
      this.pino[level](message);
    }

    console.log(`🔍 Expected humanlog compatible format:`);
    console.log(
      JSON.stringify({
        level,
        time: new Date().toISOString(),
        msg: message,
        ...context,
      }),
    );
  }
}

// Single instance creation
const structuredLogger = new StructuredLogger(logger);

// Function to send logs automatically to humanlog
async function sendToHumanlog(jsonLog: string) {
  if (!isBrowser) return;

  try {
    // Directly send to humanlog HTTP API (more stable)
    await fetch("http://localhost:8080/api/v1/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-ndjson",
      },
      body: jsonLog + "\n",
    });
  } catch (error) {
    // Use Next.js API endpoint if failed
    try {
      await fetch("/api/humanlog/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonLog,
      });
    } catch (fallbackError) {
      // Ignore if failed (app should not stop due to logging)
      console.debug("Failed to send log to humanlog:", error, fallbackError);
    }
  }
}

export default structuredLogger;
export type { LogContext };
