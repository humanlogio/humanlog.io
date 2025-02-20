import { useDebouncer } from "@/lib/utils/useDebouncer";
import { useThemeColors } from "@/lib/utils/useThemeColors";
import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { ResizableHandle } from "../ui/resizable";
import { FormLabel } from "../ui/form";
import { twJoin } from "tailwind-merge";

interface PreviewProps {
  themes: FormatConfig_Themes;
  isDark: boolean;
}

export const Preview = ({ themes, isDark }: PreviewProps) => {
  const SAMPLE_LOGS = [
    {
      sessionId: "1739262397660164001",
      eventId: "1",
      parsedAt: "2025-02-11T08:26:37.660211Z",
      structured: {
        timestamp: "2025-02-11T05:00:21.086964Z",
        lvl: "INFO",
        msg: "Server started successfully",
        kvs: [
          { key: "port", value: "8080" },
          { key: "mode", value: "production" },
        ],
      },
    },
    {
      sessionId: "1739262397660164002",
      eventId: "2",
      parsedAt: "2025-02-11T08:26:37.660755Z",
      structured: {
        timestamp: "2025-02-11T05:01:20.183326Z",
        lvl: "DEBUG",
        msg: "Connection pool initialized",
        kvs: [
          { key: "pool_size", value: "10" },
          { key: "timeout", value: "30s" },
        ],
      },
    },
    {
      sessionId: "1739262397660164003",
      eventId: "3",
      parsedAt: "2025-02-11T08:26:37.660812Z",
      structured: {
        timestamp: "2025-02-11T05:01:20.483267Z",
        lvl: "WARN",
        msg: "High memory usage detected",
        kvs: [
          { key: "memory_used", value: "85%" },
          { key: "threshold", value: "80%" },
        ],
      },
    },
    {
      sessionId: "1739262397660164004",
      eventId: "4",
      parsedAt: "2025-02-11T08:26:37.660847Z",
      structured: {
        timestamp: "2025-02-11T05:02:20.185229Z",
        lvl: "ERROR",
        msg: "Database connection failed",
        kvs: [
          { key: "error_code", value: "ETIMEDOUT" },
          { key: "retries", value: "3" },
        ],
      },
    },
    {
      sessionId: "1739262397660164005",
      eventId: "5",
      parsedAt: "2025-02-11T08:26:37.660877Z",
      structured: {
        timestamp: "2025-02-11T05:02:20.889406Z",
        lvl: "PANIC",
        msg: "Critical system failure",
        kvs: [
          { key: "component", value: "auth_service" },
          { key: "error", value: "SYSTEM_CRASH" },
        ],
      },
    },
    {
      sessionId: "1739262397660164006",
      eventId: "6",
      parsedAt: "2025-02-11T08:26:37.660902Z",
      structured: {
        timestamp: "2025-02-11T05:03:20.181837Z",
        lvl: "FATAL",
        msg: "Unrecoverable error occurred",
        kvs: [
          { key: "process_id", value: "12345" },
          { key: "status", value: "shutting_down" },
        ],
      },
    },
    {
      sessionId: "1739262397660164007",
      eventId: "7",
      parsedAt: "2025-02-11T08:26:37.660926Z",
      structured: {
        timestamp: "2025-02-11T05:03:20.485069Z",
        lvl: "INFO",
        msg: "User authentication successful",
        kvs: [
          { key: "user_id", value: "user_123" },
          { key: "login_method", value: "oauth" },
          { key: "ip_address", value: "192.168.1.1" },
        ],
      },
    },
    {
      sessionId: "1739262397660164008",
      eventId: "8",
      parsedAt: "2025-02-11T08:26:37.660211Z",
      structured: {
        timestamp: "2025-02-11T05:00:21.086964Z",
        lvl: "INFO",
        msg: "Server started successfully",
        kvs: [
          { key: "port", value: "8080" },
          { key: "mode", value: "production" },
        ],
      },
    },
    {
      sessionId: "1739262397660164009",
      eventId: "9",
      parsedAt: "2025-02-11T08:26:37.660755Z",
      structured: {
        timestamp: "2025-02-11T05:01:20.183326Z",
        lvl: "DEBUG",
        msg: "Connection pool initialized",
        kvs: [
          { key: "pool_size", value: "10" },
          { key: "timeout", value: "30s" },
        ],
      },
    },
    {
      sessionId: "1739262397660164010",
      eventId: "10",
      parsedAt: "2025-02-11T08:26:37.660812Z",
      structured: {
        timestamp: "2025-02-11T05:01:20.483267Z",
        lvl: "WARN",
        msg: "High memory usage detected",
        kvs: [
          { key: "memory_used", value: "85%" },
          { key: "threshold", value: "80%" },
        ],
      },
    },
    {
      sessionId: "1739262397660164011",
      eventId: "11",
      parsedAt: "2025-02-11T08:26:37.660847Z",
      structured: {
        timestamp: "2025-02-11T05:02:20.185229Z",
        lvl: "ERROR",
        msg: "Database connection failed",
        kvs: [
          { key: "error_code", value: "ETIMEDOUT" },
          { key: "retries", value: "3" },
        ],
      },
    },
    {
      sessionId: "1739262397660164012",
      eventId: "12",
      parsedAt: "2025-02-11T08:26:37.660877Z",
      structured: {
        timestamp: "2025-02-11T05:02:20.889406Z",
        lvl: "PANIC",
        msg: "Critical system failure",
        kvs: [
          { key: "component", value: "auth_service" },
          { key: "error", value: "SYSTEM_CRASH" },
        ],
      },
    },
    {
      sessionId: "1739262397660164013",
      eventId: "13",
      parsedAt: "2025-02-11T08:26:37.660902Z",
      structured: {
        timestamp: "2025-02-11T05:03:20.181837Z",
        lvl: "FATAL",
        msg: "Unrecoverable error occurred",
        kvs: [
          { key: "process_id", value: "12345" },
          { key: "status", value: "shutting_down" },
        ],
      },
    },
    {
      sessionId: "1739262397660164014",
      eventId: "14",
      parsedAt: "2025-02-11T08:26:37.660926Z",
      structured: {
        timestamp: "2025-02-11T05:03:20.485069Z",
        lvl: "INFO",
        msg: "User authentication successful",
        kvs: [
          { key: "user_id", value: "user_123" },
          { key: "login_method", value: "oauth" },
          { key: "ip_address", value: "192.168.1.1" },
        ],
      },
    },
  ];

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
    <div className="flex h-[500px] w-full flex-col rounded-base border-2 border-border">
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
                    className="flex gap-2 px-4 py-2"
                  >
                    <div className="flex-none">
                      <code
                        style={{
                          color: getColor("time"),
                        }}
                      >
                        {log.structured?.timestamp ?? log.parsedAt}
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
                        className="h-full px-4 py-2"
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
                      <div className="h-full px-4 py-2">
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
