import { Duration, Timestamp } from "@bufbuild/protobuf";
import { KV } from "api/js/types/v1/types_pb";
import { Span } from "api/js/types/v1/otel_tracing_pb";
import { makeULID, makeTraceID, makeSpanID } from "@/lib/utils/id-factories";

/**
 * Create a protobuf Duration from milliseconds.
 */
export const makeDurationFromMs = (ms: number): Duration => {
  const seconds = BigInt(Math.floor(ms / 1000));
  const nanos = (ms % 1000) * 1_000_000;
  return new Duration({ seconds, nanos });
};

export const makeSpan = (
  spanId: string,
  traceId: string,
  parentSpanId: string,
  operation: string,
  serviceName: string,
  time: Timestamp,
  durationMs: number,
  attributes: KV[],
): Span => {
  return new Span({
    ulid: makeULID(),
    indextime: Timestamp.fromDate(new Date()),
    spanId: makeSpanID(spanId),
    traceId: makeTraceID(traceId),
    parentSpanId: parentSpanId ? makeSpanID(parentSpanId) : undefined,
    name: operation,
    serviceName: serviceName,
    time: time,
    duration: makeDurationFromMs(durationMs),
    attributes: attributes,
  });
};
