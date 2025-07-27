import { Spans } from "api/js/types/v1/data_pb";
import { Timestamp, Duration } from "@bufbuild/protobuf";
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
    query: `spans | where _time > ago(10s) and duration > 50ms`,
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
