import { useDebouncer } from "@/lib/utils/useDebouncer";
import { useThemeColors } from "@/lib/utils/useThemeColors";
import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { ResizableHandle } from "@/components/ui/resizable";
import { twJoin } from "tailwind-merge";
import { formatTimestamp } from "@/lib/utils";
import { Timestamp } from "@bufbuild/protobuf";

interface PreviewProps {
  themes: FormatConfig_Themes;
  isDark: boolean;
  timeformat: string;
}

export const Preview = ({ themes, isDark, timeformat }: PreviewProps) => {
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

  // 날짜 문자열을 Timestamp로 변환하는 헬퍼 함수
  function stringToTimestamp(dateString: string): Timestamp {
    const date = new Date(dateString);
    return Timestamp.fromDate(date);
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const metaColumnRef = useRef<HTMLDivElement>(null);
  // Preview 컴포넌트에서 사용할 때도 순서 변경
  const { getColor, getLevelColor } = useThemeColors(isDark, themes);

  // state
  const [contentHeight, setContentHeight] = useState<number>(0);

  const updateContentHeight = useDebouncer(
    (height: number) => setContentHeight(height),
    [],
    100,
  );

  useEffect(() => {
    const updateHeight = () => {
      if (metaColumnRef.current) {
        updateContentHeight(metaColumnRef.current.scrollHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (metaColumnRef.current) {
      resizeObserver.observe(metaColumnRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateContentHeight, metaColumnRef.current]);

  return (
    <div className="flex w-full flex-col rounded-base border-2 border-border">
      <div
        ref={containerRef}
        className={twJoin(
          "flex flex-grow overflow-y-auto bg-gradient-to-r from-slate-300 via-slate-200 via-10% to-slate-200 text-sm",
          isDark && "from-slate-900 via-slate-950 to-slate-950",
        )}
      >
        {
          <PanelGroup
            direction="horizontal"
            className="group h-full min-w-0 flex-1 !overflow-y-auto"
          >
            <div className="flex min-w-0 flex-1">
              <div ref={metaColumnRef} className="flex flex-none flex-col">
                {SAMPLE_LOGS.map((log, index) => (
                  <div
                    key={`${log.sessionId}-${log.eventId}-${index}`}
                    className="flex gap-2 px-4 py-1"
                  >
                    <div className="flex-none">
                      <code
                        style={{
                          color: getColor("time"),
                        }}
                      >
                        {formatTimestamp(
                          stringToTimestamp(
                            log.structured?.timestamp ?? log.parsedAt,
                          ),
                          timeformat,
                        )}
                      </code>
                    </div>

                    <div className="flex-none">
                      <code>
                        {log.structured?.lvl ? (
                          <span
                            style={{
                              color: getLevelColor(log.structured.lvl),
                            }}
                          >
                            [{log.structured.lvl}]
                          </span>
                        ) : (
                          <span className="text-slate-400">[empty]</span>
                        )}
                      </code>
                    </div>
                  </div>
                ))}
              </div>

              <Panel defaultSize={40} style={{ height: `${contentHeight}px` }}>
                <div className="flex w-full flex-col overflow-x-auto scrollbar-hide">
                  {SAMPLE_LOGS.map((log, index) => (
                    <div
                      key={`${log.sessionId}-${log.eventId}-${index}`}
                      className="hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
                    >
                      <div
                        className="h-full px-4 py-1"
                        style={{
                          color: getColor("msg"),
                        }}
                      >
                        <div className="h-full scrollbar-hide">
                          <code className="whitespace-nowrap">
                            {`${log.structured.msg}` || (
                              <span className="text-slate-400">no message</span>
                            )}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <ResizableHandle
                className="my-auto w-[0.1px] rounded-full bg-slate-700 opacity-0 group-hover:opacity-50"
                style={{ height: `${contentHeight}px` }}
              />

              <Panel style={{ height: `${contentHeight}px` }}>
                <div className="flex w-full flex-col overflow-x-auto scrollbar-hide">
                  {SAMPLE_LOGS.map((log, index) => (
                    <div
                      key={`${log.sessionId}-${log.eventId}-${index}`}
                      className="hover:bg-slate-400/20 hover:dark:bg-slate-700/20"
                    >
                      <div className="h-full px-4 py-1">
                        {log.structured?.kvs.map((kv, kvIndex) => (
                          <span
                            key={`${log.sessionId}-${log.eventId}-${kvIndex}`}
                            className="flex-none"
                          >
                            <span style={{ color: getColor("key") }}>
                              {kv.key}:
                            </span>
                            <span style={{ color: getColor("value") }}>
                              {kv.value}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </PanelGroup>
        }
      </div>
    </div>
  );
};
