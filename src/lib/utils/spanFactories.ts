import { Duration, Timestamp } from "@bufbuild/protobuf";
import { Span_Timing } from "api/js/types/v1/tracing_pb";
import { KV } from "api/js/types/v1/types_pb";
// Import KV helpers
import { makeStrKV, makeI64KV, makeF64KV } from "@/lib/utils/kvFactories";
import { Span } from "api/js/types/v1/otel_tracing_pb";

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
    spanId,
    traceId,
    parentSpanId,
    name: operation,
    serviceName: serviceName,
    time: time,
    duration: makeDurationFromMs(durationMs),
    attributes: attributes,
  });
};
