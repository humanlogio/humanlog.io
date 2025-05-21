import { Timestamp } from "@bufbuild/protobuf";
import { KV } from "api/js/types/v1/types_pb";
import {
  IngestedLogEvent,
  StructuredLogEvent,
} from "api/js/types/v1/logevent_pb";

// Export KV helpers from the dedicated file
export * from "@/lib/utils/kvFactories";

export const makeStructuredLogEvent = (
  timestamp: Timestamp,
  lvl: string,
  msg: string,
  kvs: KV[],
): StructuredLogEvent => {
  return new StructuredLogEvent({ timestamp, lvl, msg, kvs });
};

export const makeIngestedLogEvent = (
  machineId: bigint,
  sessionId: bigint,
  eventId: bigint,
  structured: StructuredLogEvent,
): IngestedLogEvent => {
  return new IngestedLogEvent({
    machineId,
    sessionId,
    eventId,
    raw: new Uint8Array(0),
    structured,
  });
};
