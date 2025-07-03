import { Timestamp } from "@bufbuild/protobuf";
import { KV } from "api/js/types/v1/types_pb";
import {
  IngestedLogEvent,
  StructuredLogEvent,
} from "api/js/types/v1/logevent_pb";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { Resource } from "api/js/types/v1/otel_resource_pb";
import { Scope } from "api/js/types/v1/otel_scope_pb";

// Export KV helpers from the dedicated file
export * from "@/lib/utils/kvFactories";

// Generate a simple ULID-like string for testing
const generateULID = (): string => {
  const timestamp = Date.now().toString(36).padStart(10, "0");
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 18)
    .padEnd(16, "0");
  return (timestamp + randomPart).toUpperCase().substring(0, 26);
};

// Create a basic Resource
export const makeResource = (attributes: KV[] = []): Resource => {
  return new Resource({
    attributes,
  });
};

// Create a basic Scope
export const makeScope = (
  name: string = "",
  version: string = "",
  attributes: KV[] = [],
): Scope => {
  return new Scope({
    name,
    version,
    attributes,
  });
};

// Create a Log event with OTEL structure
export const makeLog = (
  timestamp: Timestamp,
  severityText: string,
  body: string,
  serviceName: string = "",
  attributes: KV[] = [],
  traceId?: string,
  spanId?: string,
  resource?: Resource,
  scope?: Scope,
): Log => {
  const severityNumber = getSeverityNumber(severityText);

  return new Log({
    ulid: generateULID(),
    observedTimestamp: Timestamp.fromDate(new Date()),
    timestamp,
    traceId,
    spanId,
    traceFlags: 0,
    severityText,
    severityNumber,
    serviceName,
    body,
    resource: resource || makeResource(),
    scope: scope || makeScope(),
    attributes,
  });
};

// Helper function to convert severity text to number
const getSeverityNumber = (severityText: string): number => {
  const severityMap: Record<string, number> = {
    TRACE: 1,
    DEBUG: 5,
    INFO: 9,
    WARN: 13,
    ERROR: 17,
    FATAL: 21,
    PANIC: 25,
  };
  return severityMap[severityText.toUpperCase()] || 0;
};
