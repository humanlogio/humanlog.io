import { Timestamp, Duration } from "@bufbuild/protobuf";
import { IngestedLogEvent } from "api/js/types/v1/logevent_pb";

import { Spans } from "api/js/types/v1/data_pb";
import { toBigInt } from "@/lib/utils/valueFactories";
import { makeSpan } from "@/lib/utils/spanFactories";
import {
  makeDurationKV,
  makeF64KV,
  makeI64KV,
  makeNullKV,
  makeStrKV,
  makeTimestampKV,
} from "@/lib/utils/kvFactories";
import {
  makeIngestedLogEvent,
  makeStructuredLogEvent,
} from "@/lib/utils/logEventFactories";

interface SampleLog {
  query: string;
  data: IngestedLogEvent[];
}

export function sampleLogs(): SampleLog {
  return {
    query: `logs | filter level != "DEBUG"`,
    data: [
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
          [
            makeStrKV("service", "api-gateway"),
            makeStrKV("endpoint", "/gossip"),
          ],
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
      makeIngestedLogEvent(
        toBigInt(0),
        toBigInt("1739262397660164303"),
        toBigInt(303),
        makeStructuredLogEvent(
          new Timestamp({ seconds: toBigInt(1707632660), nanos: 0 }),
          "INFO",
          "will retry later",
          [makeI64KV("attempt", 2), makeStrKV("rate_limited", "true")],
        ),
      ),
      makeIngestedLogEvent(
        toBigInt(0),
        toBigInt("1739262397660164303"),
        toBigInt(303),
        makeStructuredLogEvent(
          new Timestamp({ seconds: toBigInt(1707632660), nanos: 0 }),
          "FATAL",
          "catastrophic failure 💥",
          [makeStrKV("service", "db-proxy"), makeStrKV("user", "carol")],
        ),
      ),
      makeIngestedLogEvent(
        toBigInt(0),
        toBigInt("1739262397660164303"),
        toBigInt(303),
        makeStructuredLogEvent(
          new Timestamp({ seconds: toBigInt(1707632660), nanos: 0 }),
          "PANIC",
          "all hope is lost 🤯",
          [makeStrKV("service", "db-proxy"), makeStrKV("user", "carol")],
        ),
      ),
    ],
  };
}

interface SampleSpan {
  query: string;
  data: Spans;
}

// --- Sample span data ---
export function sampleSpans(): SampleSpan {
  const ago10s = new Timestamp({
    seconds: toBigInt(Date.now() / 1000 - 10),
    nanos: 0,
  });
  const tsAdd = (ts: Timestamp, seconds: number) => {
    return new Timestamp({
      seconds: ts.seconds + BigInt(seconds),
      nanos: Number(ts.nanos),
    });
  };
  return {
    query: `traces | where time > ago(10s) and duration > 50ms`,
    data: new Spans({
      spans: [
        makeSpan(
          "75787b6c-0376-4239-88ab-bb46c9d4e015",
          "8f641c20-f416-45da-b25f-c35f9a116826",
          "",
          "renderHomepage",
          "web-frontend",
          tsAdd(ago10s, 1),
          80,
          [makeStrKV("service", "web-frontend"), makeStrKV("user", "alice")],
        ),
        makeSpan(
          "82da06d1-29dd-4534-893d-6d31f4ce0a27",
          "8f641c20-f416-45da-b25f-c35f9a116826",
          "75787b6c-0376-4239-88ab-bb46c9d4e015",
          "fetchUserProfile",
          "backend-service",
          tsAdd(ago10s, 2),
          320,
          [makeStrKV("service", "web-frontend"), makeStrKV("user", "alice")],
        ),
        makeSpan(
          "99a9896a-f5ce-47b6-bd6f-d5ae99bb6c74",
          "8f641c20-f416-45da-b25f-c35f9a116826",
          "82da06d1-29dd-4534-893d-6d31f4ce0a27",
          "dbQuery",
          "database-tier",
          tsAdd(ago10s, 3),
          120,
          [makeStrKV("service", "db-proxy"), makeStrKV("user", "alice")],
        ),
      ],
    }),
  };
}
