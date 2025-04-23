import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import { protoInt64, Timestamp } from "@bufbuild/protobuf";
import {
  IngestedLogEvent,
  StructuredLogEvent,
} from "api/js/types/v1/logevent_pb";
import { KV, Val } from "api/js/types/v1/types_pb";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";

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
      lvl: "UNKNOWN",
      msg: "Unrecognized service state transition",
      kvs: [
        { key: "service_id", value: "SVC_001" },
        { key: "state", value: "undefined_state" },
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
      msg: "Cache optimization complete",
      kvs: [
        { key: "items_processed", value: "1500" },
        { key: "time_taken", value: "2.5s" },
      ],
    },
  },
  {
    sessionId: "1739262397660164004",
    eventId: "4",
    parsedAt: "2025-02-11T08:26:37.660847Z",
    structured: {
      timestamp: "2025-02-11T05:02:20.185229Z",
      lvl: "PANIC",
      msg: "Security breach detected",
      kvs: [
        { key: "alert_id", value: "SEC_123" },
        { key: "severity", value: "critical" },
      ],
    },
  },
  {
    sessionId: "1739262397660164005",
    eventId: "5",
    parsedAt: "2025-02-11T08:26:37.660877Z",
    structured: {
      timestamp: "2025-02-11T05:02:20.889406Z",
      lvl: "WARN",
      msg: "API rate limit approaching",
      kvs: [
        { key: "current_rate", value: "950/1000" },
        { key: "client_id", value: "client_789" },
      ],
    },
  },
  {
    sessionId: "1739262397660164006",
    eventId: "6",
    parsedAt: "2025-02-11T08:26:37.660902Z",
    structured: {
      timestamp: "2025-02-11T05:03:20.181837Z",
      lvl: "UNKNOWN",
      msg: "Unexpected data format in stream",
      kvs: [
        { key: "stream_id", value: "STREAM_456" },
        { key: "format", value: "undefined_format" },
      ],
    },
  },
  {
    sessionId: "1739262397660164007",
    eventId: "7",
    parsedAt: "2025-02-11T08:26:37.660926Z",
    structured: {
      timestamp: "2025-02-11T05:03:20.485069Z",
      lvl: "ERROR",
      msg: "Payment processing failed",
      kvs: [
        { key: "transaction_id", value: "TXN_123" },
        { key: "error_type", value: "gateway_timeout" },
        { key: "amount", value: "1299.99" },
      ],
    },
  },
  {
    sessionId: "1739262397660164008",
    eventId: "8",
    parsedAt: "2025-02-11T08:26:37.660211Z",
    structured: {
      timestamp: "2025-02-11T05:00:21.086964Z",
      lvl: "DEBUG",
      msg: "Query optimization analysis",
      kvs: [
        { key: "query_id", value: "Q_789" },
        { key: "execution_time", value: "1.2s" },
      ],
    },
  },
  {
    sessionId: "1739262397660164009",
    eventId: "9",
    parsedAt: "2025-02-11T08:26:37.660755Z",
    structured: {
      timestamp: "2025-02-11T05:01:20.183326Z",
      lvl: "FATAL",
      msg: "Core service crash",
      kvs: [
        { key: "service", value: "authentication" },
        { key: "error_code", value: "SEGFAULT" },
      ],
    },
  },
  {
    sessionId: "1739262397660164010",
    eventId: "10",
    parsedAt: "2025-02-11T08:26:37.660812Z",
    structured: {
      timestamp: "2025-02-11T05:01:20.483267Z",
      lvl: "INFO",
      msg: "Scheduled maintenance started",
      kvs: [
        { key: "maintenance_id", value: "MTN_001" },
        { key: "estimated_duration", value: "30m" },
      ],
    },
  },
  {
    sessionId: "1739262397660164011",
    eventId: "11",
    parsedAt: "2025-02-11T08:26:37.660847Z",
    structured: {
      timestamp: "2025-02-11T05:02:20.185229Z",
      lvl: "UNKNOWN",
      msg: "Unidentified network traffic pattern",
      kvs: [
        { key: "pattern_id", value: "PTN_XYZ" },
        { key: "source", value: "unknown_source" },
      ],
    },
  },
  {
    sessionId: "1739262397660164012",
    eventId: "12",
    parsedAt: "2025-02-11T08:26:37.660877Z",
    structured: {
      timestamp: "2025-02-11T05:02:20.889406Z",
      lvl: "WARN",
      msg: "Database replication lag detected",
      kvs: [
        { key: "replica_id", value: "DB_REPLICA_2" },
        { key: "lag_seconds", value: "45" },
      ],
    },
  },
  {
    sessionId: "1739262397660164013",
    eventId: "13",
    parsedAt: "2025-02-11T08:26:37.660902Z",
    structured: {
      timestamp: "2025-02-11T05:03:20.181837Z",
      lvl: "ERROR",
      msg: "File system quota exceeded",
      kvs: [
        { key: "path", value: "/var/log" },
        { key: "usage_percent", value: "98" },
      ],
    },
  },
  {
    sessionId: "1739262397660164014",
    eventId: "14",
    parsedAt: "2025-02-11T08:26:37.660926Z",
    structured: {
      timestamp: "2025-02-11T05:03:20.485069Z",
      lvl: "PANIC",
      msg: "Kernel panic detected",
      kvs: [
        { key: "kernel_version", value: "5.15.0" },
        { key: "panic_code", value: "KERNEL_PANIC_001" },
      ],
    },
  },
  {
    sessionId: "1739262397660164015",
    eventId: "15",
    parsedAt: "2025-02-11T08:26:37.660950Z",
    structured: {
      timestamp: "2025-02-11T05:03:21.485069Z",
      lvl: "DEBUG",
      msg: "Cache invalidation triggered",
      kvs: [
        { key: "cache_region", value: "user_preferences" },
        { key: "items_affected", value: "2500" },
      ],
    },
  },
];

interface PreviewProps {
  themes: FormatConfig_Themes;
  isDark: boolean;
  timeformat: string;
}

export const Preview = ({ themes, isDark, timeformat }: PreviewProps) => {
  const convertSampleLogs = () => {
    const convertedLogs = [];

    for (const log of SAMPLE_LOGS) {
      const ingestedLog = new IngestedLogEvent({
        machineId: protoInt64.parse("0"),
        sessionId: protoInt64.parse(log.sessionId),
        eventId: protoInt64.parse(log.eventId),

        raw: new Uint8Array(0),
        structured: new StructuredLogEvent({
          timestamp: new Timestamp({
            seconds: BigInt(
              Math.floor(new Date(log.parsedAt).getTime() / 1000),
            ),
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
              }),
          ),
        }),
      });

      convertedLogs.push(ingestedLog);
    }

    return convertedLogs;
  };

  const providedData = convertSampleLogs();

  return (
    <SessionPanel
      onClickFilterBy={() => {}}
      providedData={providedData}
      query={undefined}
      darkMode={isDark}
      themes={themes}
    />
  );
};
