import {
  Duration,
  DurationSchema,
  Timestamp,
  timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import { KV } from "api/js/types/v1/types_pb";
import { Span, SpanSchema } from "api/js/types/v1/otel_tracing_pb";
import { makeULID, makeTraceID, makeSpanID } from "@/lib/utils/id-factories";
import { create } from "@bufbuild/protobuf";

/**
 * Create a protobuf Duration from milliseconds.
 */
export const makeDurationFromMs = (ms: number): Duration => {
  const seconds = BigInt(Math.floor(ms / 1000));
  const nanos = (ms % 1000) * 1_000_000;
  return create(DurationSchema, { seconds, nanos });
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
  return create(SpanSchema, {
    ulid: makeULID(),
    indextime: timestampFromDate(new Date()),
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
