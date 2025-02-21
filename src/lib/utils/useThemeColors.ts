import {
  FormatConfig_Themes,
  FormatConfig_Style,
} from "api/js/types/v1/localhost_config_pb";

type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "panic"
  | "fatal"
  | "unknown";
type ThemeType = "msg" | "time" | "key" | "value" | "levels";

// useThemeColors hook 수정
export const useThemeColors = (
  isDark: boolean,
  themes?: FormatConfig_Themes,
) => {
  const getColor = (type: ThemeType, level?: LogLevel) => {
    const currentTheme = isDark ? themes?.dark : themes?.light;

    if (!currentTheme) return "";

    if (type === "levels" && level) {
      return currentTheme.levels?.[level]?.foreground?.htmlHexColor ?? "";
    } else {
      if (currentTheme[type] instanceof FormatConfig_Style) {
        return currentTheme[type]?.foreground?.htmlHexColor ?? "";
      }
    }
  };

  const getLevelColor = (logLevel: string) => {
    const normalizedLevel = logLevel.toLowerCase() as LogLevel;
    return getColor("levels", normalizedLevel);
  };

  return {
    getColor,
    getLevelColor,
  };
};
