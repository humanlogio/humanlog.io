import { Spans, SpansSchema } from "api/js/types/v1/data_pb";
import { Timestamp, Duration, TimestampSchema } from "@bufbuild/protobuf/wkt";
import { toBigInt } from "@/lib/utils/value-factories";
import { makeSpan } from "@/lib/utils/span-factories";
import { makeStrKV } from "@/lib/utils/kv-factories";
import { create } from "@bufbuild/protobuf";

interface SampleSpan {
  query: string;
  data: Spans;
}

// --- Sample span data ---
export function sampleSpans(): SampleSpan {
  const ago10s = create(TimestampSchema, {
    seconds: toBigInt(Date.now() / 1000 - 10),
    nanos: 0,
  });
  const tsAdd = (ts: Timestamp, seconds: number) => {
    return create(TimestampSchema, {
      seconds: ts.seconds + BigInt(seconds),
      nanos: Number(ts.nanos),
    });
  };
  return {
    query: `spans | where _time > ago(10s) and duration > 50ms`,
    data: create(SpansSchema, {
      spans: [
        makeSpan(
          "75787b6c037642398",
          "8f641c20f41645dab25fc35f9a116826a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
          "",
          "renderHomepage",
          "web-frontend",
          tsAdd(ago10s, 1),
          80,
          [makeStrKV("service", "web-frontend"), makeStrKV("user", "alice")],
        ),
        makeSpan(
          "82da06d129dd4534",
          "8f641c20f41645dab25fc35f9a116826a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
          "75787b6c037642398",
          "fetchUserProfile",
          "backend-service",
          tsAdd(ago10s, 2),
          320,
          [makeStrKV("service", "web-frontend"), makeStrKV("user", "alice")],
        ),
        makeSpan(
          "99a9896af5ce47b6",
          "8f641c20f41645dab25fc35f9a116826a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
          "82da06d129dd4534",
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
