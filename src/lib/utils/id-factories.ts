import { TraceID, SpanID } from "api/js/types/v1/types_pb";
import { ULID } from "api/js/types/v1/ulid_pb";
import { unit8ArrayBufferToBase16 } from "@/lib/utils/decode";

const generateULIDString = (): string => {
  const timestamp = Date.now().toString(36).padStart(10, "0");
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 18)
    .padEnd(16, "0");
  return (timestamp + randomPart).toUpperCase().substring(0, 26);
};

// Generate a proper OpenTelemetry trace ID (32-char hex)
export const generateTraceId = (): string => {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
};

// Generate a proper OpenTelemetry span ID (16-char hex)
export const generateSpanId = (): string => {
  return Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
};

// Convert hex string to Uint8Array
const hexToUint8Array = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  const result: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(parseInt(hex.substr(i, 2), 16));
  }
  return new Uint8Array(result);
};

// Create a ULID from string
export const makeULID = (ulidString?: string): ULID => {
  if (!ulidString) {
    ulidString = generateULIDString();
  }

  // Convert ULID string to High/Low uint64 values
  // For simplicity, we'll use a basic conversion
  const timestamp = Date.now();
  const high = BigInt(Math.floor(timestamp / 1000));
  const low =
    BigInt(timestamp % 1000) * BigInt(1000000) +
    BigInt(Math.floor(Math.random() * 1000000));

  return new ULID({
    High: high,
    Low: low,
  });
};

// Convert ULID object to string
export const ulidToString = (ulid?: ULID): string => {
  if (!ulid) {
    return "";
  }

  // Convert High/Low back to a ULID-like string
  // This is a simplified conversion for display purposes
  const high = ulid.High || BigInt(0);
  const low = ulid.Low || BigInt(0);

  // Create a readable string from the bigint values
  const timestamp = high.toString(36).padStart(8, "0");
  const random = low.toString(36).padStart(12, "0");

  return (timestamp + random).toUpperCase().substring(0, 26);
};

// Create a TraceID from string
export const makeTraceID = (traceIdString: string): TraceID => {
  // Validate and normalize trace ID format
  const normalizedTraceId = traceIdString.replace(/[^0-9a-fA-F]/g, "");
  if (normalizedTraceId.length === 0) {
    throw new Error("Invalid trace ID: must contain hex characters");
  }

  // Convert hex string to bytes (pad to 32 chars = 16 bytes for trace ID)
  const raw = hexToUint8Array(normalizedTraceId.padEnd(32, "0")) as Uint8Array;
  return new TraceID({ raw: raw as Uint8Array<ArrayBuffer> });
};

// Convert TraceID object to string
export const traceIdToString = (traceId?: TraceID): string => {
  if (!traceId || !traceId.raw) {
    return "";
  }
  return unit8ArrayBufferToBase16(traceId.raw);
};

// Create a SpanID from string
export const makeSpanID = (spanIdString: string): SpanID => {
  // Validate and normalize span ID format
  const normalizedSpanId = spanIdString.replace(/[^0-9a-fA-F]/g, "");
  if (normalizedSpanId.length === 0) {
    throw new Error("Invalid span ID: must contain hex characters");
  }

  // Convert hex string to bytes (pad to 16 chars = 8 bytes for span ID)
  const raw = hexToUint8Array(normalizedSpanId.padEnd(16, "0")) as Uint8Array;
  return new SpanID({ raw: raw as Uint8Array<ArrayBuffer> });
};

// Convert SpanID object to string
export const spanIdToString = (spanId?: SpanID): string => {
  if (!spanId || !spanId.raw) {
    return "";
  }
  return unit8ArrayBufferToBase16(spanId.raw);
};
