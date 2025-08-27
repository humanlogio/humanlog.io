import { Timestamp } from "@bufbuild/protobuf";
import { KV } from "api/js/types/v1/types_pb";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { Resource } from "api/js/types/v1/otel_resource_pb";
import { Scope } from "api/js/types/v1/otel_scope_pb";
import { makeSpanID, makeTraceID, makeULID } from "@/lib/utils/id-factories";

// Export KV helpers from the dedicated file
export * from "@/lib/utils/kvFactories";

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
    ulid: makeULID(),
    observedTimestamp: Timestamp.fromDate(new Date()),
    timestamp,
    traceId: traceId ? makeTraceID(traceId) : undefined,
    spanId: spanId ? makeSpanID(spanId) : undefined,
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
