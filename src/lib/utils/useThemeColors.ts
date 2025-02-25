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
  const defaultColors = {
    light: "#000000",
    dark: "#ffffff",
  };

  const hexToRgb = (hex?: string) => {
    if (!hex) return;

    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    // 16진수를 10진수로 변환
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return undefined;
    }

    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));

    const hexR = r.toString(16).padStart(2, "0");
    const hexG = g.toString(16).padStart(2, "0");
    const hexB = b.toString(16).padStart(2, "0");

    return `#${hexR}${hexG}${hexB}`;
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

    const parsedRGB = hexToRgb(color);
    if (parsedRGB) {
      const { r, g, b } = parsedRGB;
      return parsedRGB
        ? `rgb(${r},${g},${b})`
        : isDark
          ? defaultColors.dark
          : defaultColors.light;
    }
  };

  const getLevelColor = (logLevel?: string) => {
    const normalizedLevel = logLevel?.toLowerCase() as LogLevel;

    return logLevel ? getColor("levels", normalizedLevel) : "auto";
  };

  return {
    defaultColors,
    hexToRgb,
    rgbToHex,
    getColor,
    getLevelColor,
  };
};
