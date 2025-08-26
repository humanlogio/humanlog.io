import { FormatConfig_Themes } from "api/js/types/v1/localhost_config_pb";
import SessionPanel from "@/components/log-interface/query-output/session/session-panel";
import { sampleLogs } from "@/lib/mocks/sampleLogs";

interface PreviewProps {
  themes: FormatConfig_Themes;
  mode: "dark" | "light";
  timeformat: string;
}

export const Preview = ({ themes, mode, timeformat }: PreviewProps) => {
  return <SessionPanel logs={sampleLogs().data} mode={mode} themes={themes} />;
};
