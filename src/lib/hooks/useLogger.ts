// TODO: Refactor this hook to use opentelemetry
import { useCallback, useMemo } from "react";
import { useApiClients } from "@/context/api-provider";
import pino, { Logger } from "pino";
import { IngestRequest } from "api/js/svc/ingest/v1/service_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import { Timestamp } from "@bufbuild/protobuf";
import { makeStrKV, makeF64KV, makeI64KV } from "@/lib/utils/kvFactories";
import { newStrVal } from "@/lib/utils/valueFactories";
import { usePostHog } from "posthog-js/react";
import { Log } from "api/js/types/v1/otel_logging_pb";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

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

export const useLogger = () => {
  const { apiClients } = useApiClients();
  const posthog = usePostHog();

  const isDetailedLoggingEnabled =
    posthog?.isFeatureEnabled("ops_sending_logs_perma") ?? false;
};

export type { LogContext };
