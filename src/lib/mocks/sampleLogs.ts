import { Timestamp, Duration } from "@bufbuild/protobuf";
import { toBigInt } from "@/lib/utils/valueFactories";
import {
  makeDurationKV,
  makeF64KV,
  makeI64KV,
  makeNullKV,
  makeStrKV,
  makeTimestampKV,
} from "@/lib/utils/kvFactories";
import { Log } from "api/js/types/v1/otel_logging_pb";
import { makeLog } from "@/lib/utils/logEventFactories";

interface SampleLog {
  query: string;
  data: Log[];
}

export function sampleLogs(): SampleLog {
  return {
    query: `logs | filter severity_text != "DEBUG"`,
    data: [
      makeLog(
        new Timestamp({ seconds: toBigInt(1707632400), nanos: 0 }),
        "INFO",
        "User alice logged in successfully",
        "auth-service",
        [
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
        "trace-123",
        "span-456",
      ),

      makeLog(
        new Timestamp({ seconds: toBigInt(1707632460), nanos: 0 }),
        "WARN",
        "Cache miss for endpoint /gossip",
        "api-gateway",
        [
          makeStrKV("endpoint", "/gossip"),
          makeStrKV("cache_key", "gossip_data_123"),
          makeI64KV("cache_ttl", 300),
          makeF64KV("hit_ratio", 0.85),
        ],
      ),

      makeLog(
        new Timestamp({ seconds: toBigInt(1707632580), nanos: 0 }),
        "ERROR",
        "Failed to connect to database",
        "db-proxy",
        [
          makeStrKV("user", "alice"),
          makeStrKV("database", "postgres-main"),
          makeStrKV("error_code", "CONNECTION_TIMEOUT"),
          makeI64KV("retry_count", 3),
          makeDurationKV(
            "timeout",
            new Duration({ seconds: toBigInt(30), nanos: 0 }),
          ),
        ],
        "trace-789",
        "span-012",
      ),

      makeLog(
        new Timestamp({ seconds: toBigInt(1707632640), nanos: 0 }),
        "ERROR",
        "Permission denied for file access",
        "file-service",
        [
          makeStrKV("file", "/var/log/app.log"),
          makeStrKV("user", "carol"),
          makeStrKV("permission", "read"),
          makeI64KV("file_size", 1048576),
          makeStrKV("mime_type", "text/plain"),
        ],
      ),
      makeLog(
        new Timestamp({ seconds: toBigInt(1707632700), nanos: 0 }),
        "INFO",
        "Payment transaction completed",
        "payment-service",
        [
          makeStrKV("transaction_id", "TXN-98765"),
          makeStrKV("user", "bob"),
          makeF64KV("amount", 299.99),
          makeStrKV("currency", "USD"),
          makeStrKV("payment_method", "credit_card"),
          makeDurationKV(
            "processing_time",
            new Duration({ seconds: toBigInt(2), nanos: 500000000 }),
          ),
        ],
        "trace-abc",
        "span-def",
      ),

      makeLog(
        new Timestamp({ seconds: toBigInt(1707632760), nanos: 0 }),
        "WARN",
        "High memory usage detected",
        "monitoring-service",
        [
          makeStrKV("service", "api-gateway"),
          makeF64KV("memory_usage_percent", 87.5),
          makeI64KV("memory_mb", 4096),
          makeI64KV("threshold_mb", 3584),
          makeStrKV("action", "alert_sent"),
        ],
      ),

      makeLog(
        new Timestamp({ seconds: toBigInt(1707632820), nanos: 0 }),
        "FATAL",
        "Critical system failure - service shutting down",
        "core-service",
        [
          makeStrKV("error", "SEGMENTATION_FAULT"),
          makeStrKV("module", "request_handler"),
          makeI64KV("pid", 12345),
          makeStrKV("stack_trace", "core.c:429 -> handler.c:123"),
          makeTimestampKV(
            "crash_time",
            new Timestamp({ seconds: toBigInt(1707632820), nanos: 0 }),
          ),
        ],
        "trace-critical",
        "span-fatal",
      ),

      makeLog(
        new Timestamp({ seconds: toBigInt(1707632880), nanos: 0 }),
        "INFO",
        "Scheduled backup completed successfully",
        "backup-service",
        [
          makeStrKV("backup_id", "BKP-20240211-001"),
          makeI64KV("files_backed_up", 15420),
          makeF64KV("backup_size_gb", 23.7),
          makeDurationKV(
            "backup_duration",
            new Duration({ seconds: toBigInt(1800), nanos: 0 }),
          ),
          makeStrKV("destination", "s3://backup-bucket/daily/"),
          makeStrKV("status", "success"),
        ],
      ),
    ],
  };
}
