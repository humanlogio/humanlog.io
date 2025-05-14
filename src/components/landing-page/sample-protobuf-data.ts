import { Timestamp, Duration } from "@bufbuild/protobuf";
import {
  IngestedLogEvent,
  StructuredLogEvent,
} from "api/js/types/v1/logevent_pb";
import { Span, Span_Timing } from "api/js/types/v1/tracing_pb";
import { KV } from "api/js/types/v1/types_pb";
import {
  newNullVal,
  newStrVal,
  newI64Val,
  newF64Val,
  newDurationVal,
  newTimestampVal,
} from "@/lib/utils/queryBuilders";

// --- Helper for BigInt (avoids BigInt literals for ES2019 compatibility) ---
function toBigInt(val: number | string): any {
  // Use BigInt if available, otherwise fallback to string (for proto compatibility)
  // Typescript will accept string for proto fields expecting bigint
  try {
    // @ts-ignore
    return typeof BigInt !== "undefined" ? BigInt(val) : String(val);
  } catch {
    return String(val);
  }
}

// --- Helper functions for log events ---
// Accepts all supported value types and applies the correct helper
function makeStrKV(key: string, value: string): KV {
  return new KV({ key, value: newStrVal(value) });
}
function makeI64KV(key: string, value: number | bigint): KV {
  return new KV({ key, value: newI64Val(value) });
}
function makeF64KV(key: string, value: number): KV {
  return new KV({ key, value: newF64Val(value) });
}
function makeTimestampKV(key: string, value: Timestamp): KV {
  return new KV({ key, value: newTimestampVal(value) });
}
function makeDurationKV(key: string, value: Duration): KV {
  return new KV({ key, value: newDurationVal(value) });
}
function makeNullKV(key: string): KV {
  return new KV({ key, value: newNullVal() });
}


function makeStructuredLogEvent(
  timestamp: Timestamp,
  lvl: string,
  msg: string,
  kvs: KV[],
): StructuredLogEvent {
  return new StructuredLogEvent({ timestamp, lvl, msg, kvs });
}

function makeIngestedLogEvent(
  machineId: bigint,
  sessionId: bigint,
  eventId: bigint,
  structured: StructuredLogEvent,
): IngestedLogEvent {
  return new IngestedLogEvent({
    machineId,
    sessionId,
    eventId,
    raw: new Uint8Array(0),
    structured,
  });
}

// --- Helper functions for spans ---
/**
 * Create a protobuf Duration from milliseconds.
 */
function makeDurationFromMs(ms: number): Duration {
  const seconds = BigInt(Math.floor(ms / 1000));
  const nanos = (ms % 1000) * 1_000_000;
  return new Duration({ seconds, nanos });
}

function makeSpan(
  spanId: string,
  traceId: string,
  parentSpanId: string,
  operation: string,
  startTime: Timestamp,
  durationMs: number,
  attributes: KV[],
): Span {
  return new Span({
    spanId,
    traceId,
    parentSpanId,
    name: operation,
    timing: new Span_Timing({
      start: startTime,
      duration: makeDurationFromMs(durationMs),
    }),
    spanAttributes: attributes,
  });
}

// --- Sample log data ---
export function sampleProvidedLogData(): IngestedLogEvent[] {
  return [
    makeIngestedLogEvent(
      toBigInt(0),
      toBigInt("1739262397660164101"),
      toBigInt(101),
      makeStructuredLogEvent(
        new Timestamp({ seconds: toBigInt(1707632400), nanos: 0 }),
        "INFO",
        "User alice logged in",
        [
          makeStrKV("service", "auth-service"),
          makeStrKV("user", "alice"),
          makeStrKV("ip", "10.0.0.99"),
          makeI64KV("login_attempts", 3),
          makeF64KV("quota_used", 0.75),
          makeTimestampKV(
            "last_login",
            new Timestamp({ seconds: toBigInt(1707630000), nanos: 0 }),
          ),
          makeDurationKV(
            "session_duration",
            new Duration({ seconds: toBigInt(3600), nanos: 0 }),
          ),
          makeNullKV("notes"),
        ],
      ),
    ),
    makeIngestedLogEvent(
      toBigInt(0),
      toBigInt("1739262397660164201"),
      toBigInt(201),
      makeStructuredLogEvent(
        new Timestamp({ seconds: toBigInt(1707632460), nanos: 0 }),
        "WARN",
        "Cache miss for endpoint /gossip",
        [makeStrKV("service", "api-gateway"), makeStrKV("endpoint", "/gossip")],
      ),
    ),
    makeIngestedLogEvent(
      toBigInt(0),
      toBigInt("1739262397660164301"),
      toBigInt(301),
      makeStructuredLogEvent(
        new Timestamp({ seconds: toBigInt(1707632580), nanos: 0 }),
        "ERROR",
        "Failed to connect to database",
        [makeStrKV("service", "db-proxy"), makeStrKV("user", "alice")],
      ),
    ),
    makeIngestedLogEvent(
      toBigInt(0),
      toBigInt("1739262397660164302"),
      toBigInt(302),
      makeStructuredLogEvent(
        new Timestamp({ seconds: toBigInt(1707632640), nanos: 0 }),
        "ERROR",
        "Permission denied",
        [makeStrKV("file", "/var/log/app.log"), makeStrKV("user", "carol")],
      ),
    ),
  ];
}

// --- Sample span data ---
export function sampleSpanData(): Span[] {
  return [
    makeSpan(
      "span1",
      "traceA",
      "",
      "renderHomepage",
      new Timestamp({ seconds: toBigInt(1747200000), nanos: 0 }),
      80,
      [makeStrKV("service", "web-frontend"), makeStrKV("user", "alice")],
    ),
    makeSpan(
      "span2",
      "traceA",
      "span1",
      "fetchUserProfile",
      new Timestamp({ seconds: toBigInt(1747200000), nanos: 0 }),
      320,
      [makeStrKV("service", "web-frontend"), makeStrKV("user", "alice")],
    ),
    makeSpan(
      "span3",
      "traceA",
      "span2",
      "dbQuery",
      new Timestamp({ seconds: toBigInt(1747200000), nanos: 0 }),
      120,
      [makeStrKV("service", "db-proxy"), makeStrKV("user", "bob")],
    ),
  ];
}
