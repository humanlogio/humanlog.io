import { protoInt64, Timestamp } from "@bufbuild/protobuf";
import { IngestedLogEvent, StructuredLogEvent } from "api/js/types/v1/logevent_pb";
import { KV, Val } from "api/js/types/v1/types_pb";

// Plain JS sample logs
const SAMPLE_LOGS = [
  {
    sessionId: "1739262397660164001",
    eventId: "1",
    parsedAt: "2025-02-11T08:26:37.660211Z",
    structured: {
      timestamp: "2025-02-11T05:00:21.086964Z",
      lvl: "DEBUG",
      msg: "System configuration loading",
      kvs: [
        { key: "config_path", value: "/etc/app/config" },
        { key: "env", value: "production" },
      ],
    },
  },
  {
    sessionId: "1739262397660164002",
    eventId: "2",
    parsedAt: "2025-02-11T08:26:37.660755Z",
    structured: {
      timestamp: "2025-02-11T05:01:20.183326Z",
      lvl: "ERROR",
      msg: "Failed to connect to database",
      kvs: [
        { key: "service", value: "db-proxy" },
        { key: "user", value: "alice" },
      ],
    },
  },
  {
    sessionId: "1739262397660164003",
    eventId: "3",
    parsedAt: "2025-02-11T08:26:37.660812Z",
    structured: {
      timestamp: "2025-02-11T05:01:20.483267Z",
      lvl: "INFO",
      msg: "Query succeeded",
      kvs: [
        { key: "rows", value: "42" },
        { key: "duration", value: "1.2s" },
      ],
    },
  },
];

export function sampleProvidedLogData() {
  return SAMPLE_LOGS.map((log) =>
    new IngestedLogEvent({
      machineId: protoInt64.parse("0"),
      sessionId: protoInt64.parse(log.sessionId),
      eventId: protoInt64.parse(log.eventId),
      raw: new Uint8Array(0),
      structured: new StructuredLogEvent({
        timestamp: new Timestamp({
          seconds: BigInt(Math.floor(new Date(log.parsedAt).getTime() / 1000)),
          nanos: (new Date(log.parsedAt).getTime() % 1000) * 1000000,
        }),
        lvl: log.structured.lvl,
        msg: log.structured.msg,
        kvs: log.structured.kvs.map(
          (pair) =>
            new KV({
              key: pair.key,
              value: new Val({
                kind: {
                  case: "str",
                  value: pair.value,
                },
              }),
            })
        ),
      }),
    })
  );
}

// LOG EVENTS SAMPLE (legacy, not used by SessionPanel)
export const sampleLogQueryRes = {
  data: {
    shape: {
      case: "tabular",
      value: {
        shape: {
          case: "logEvents",
          value: [
            {
              id: "log1",
              timestamp: "2025-05-14T10:26:30Z",
              level: "ERROR",
              message: "Failed to connect to database",
              context: { user: "alice", service: "db-proxy" },
            },
            {
              id: "log2",
              timestamp: "2025-05-14T10:27:10Z",
              level: "ERROR",
              message: "Timeout while querying users table",
              context: { user: "bob", service: "api-server" },
            },
          ],
        },
      },
    },
  },
  next: undefined,
};

// TABLE SAMPLE
export const sampleTableQueryRes = {
  data: {
    shape: {
      case: "tabular",
      value: {
        shape: {
          case: "table",
          value: {
            columns: ["id", "name", "status"],
            rows: [
              ["1", "Alice", "active"],
              ["2", "Bob", "inactive"],
            ],
          },
        },
      },
    },
  },
  next: undefined,
};

// SPANS/TRACES SAMPLE
export const sampleSpansQueryRes = {
  data: {
    shape: {
      case: "tabular",
      value: {
        shape: {
          case: "spans",
          value: [
            {
              spanId: "span1",
              traceId: "trace1",
              operation: "GET /api/data",
              startTime: "2025-05-14T10:00:00Z",
              durationMs: 120,
              attributes: { user: "alice", service: "api-server" },
            },
            {
              spanId: "span2",
              traceId: "trace1",
              operation: "SELECT * FROM users",
              startTime: "2025-05-14T10:00:00Z",
              durationMs: 45,
              attributes: { service: "db-proxy" },
            },
          ],
        },
      },
    },
  },
  next: undefined,
};
