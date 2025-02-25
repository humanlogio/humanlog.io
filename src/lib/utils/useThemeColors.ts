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

export const useThemeColors = (
  isDark: boolean,
  themes?: FormatConfig_Themes,
) => {
  const isValidHexColor = (hex?: string) => {
    if (!hex || typeof hex !== "string") {
      return false;
    }

    const regex = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;
    return regex.test(hex);
  };

  const defaultColors = {
    light: "#000000",
    dark: "#ffffff",
  };

  const getColor = (type: ThemeType, level?: LogLevel) => {
    const currentTheme = isDark ? themes?.dark : themes?.light;

    if (!currentTheme) return "";

    let color;

    if (type === "levels" && level) {
      color = currentTheme.levels?.[level]?.foreground?.htmlHexColor;
    } else {
      if (currentTheme[type] instanceof FormatConfig_Style) {
        color = currentTheme[type]?.foreground?.htmlHexColor;
      }
    }

    return isValidHexColor(color)
      ? color
      : isDark
        ? defaultColors.dark
        : defaultColors.light;
  };

  const getLevelColor = (logLevel?: string) => {
    const normalizedLevel = logLevel?.toLowerCase() as LogLevel;

    return logLevel ? getColor("levels", normalizedLevel) : "auto";
  };

  return {
    getColor,
    getLevelColor,
    isValidHexColor,
  };
};
