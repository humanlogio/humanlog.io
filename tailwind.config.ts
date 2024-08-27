import type { Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme");

const colors = {
  primary: {
    DEFAULT: "rgba(136, 170, 238, <alpha-value>)",
    100: "rgba(208, 215, 249, <alpha-value>)",
    200: "rgba(182, 192, 247, <alpha-value>)",
    300: "rgba(157, 170, 244, <alpha-value>)",
    400: "rgba(132, 148, 242, <alpha-value>)",
    500: "rgba(136, 170, 238, <alpha-value>)",
    600: "rgba(117, 151, 215, <alpha-value>)",
    700: "rgba(98, 127, 191, <alpha-value>)",
    800: "rgba(78, 104, 167, <alpha-value>)",
    900: "rgba(46, 67, 133, <alpha-value>)",
  },
  secondary: {
    DEFAULT: "rgba(15, 23, 42, <alpha-value>)",
    100: "rgba(58, 61, 77, <alpha-value>)",
    200: "rgba(45, 49, 66, <alpha-value>)",
    300: "rgba(36, 39, 52, <alpha-value>)",
    400: "rgba(27, 31, 39, <alpha-value>)",
    500: "rgba(15, 23, 42, <alpha-value>)",
    600: "rgba(13, 17, 32, <alpha-value>)",
    700: "rgba(9, 11, 24, <alpha-value>)",
    800: "rgba(5, 6, 18, <alpha-value>)",
    900: "rgba(2, 6, 23, <alpha-value>)",
  },
};

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        main: colors.primary,
        primary: colors.primary,
        secondary: colors.secondary,
        mainAccent: "#4d80e6", // not needed for shadcn components
        overlay: "rgba(0,0,0,0.8)", // background color overlay for alert dialogs, modals, etc.
        danger: "rgba(238, 75, 85, <alpha-value>)",
        warning: "rgba(245, 215, 110, <alpha-value>)",
        success: "rgba(85, 194, 136, <alpha-value>)",

        // light mode
        bg: "#fff",
        text: "rgba(0, 0, 0, <alpha-value>)",
        border: "#000",

        // dark mode
        darkBg: "#0F172A",
        darkText: "rgba(255, 255, 255, <alpha-value>)",
        darkBorder: "#000",
        secondaryBlack: "#1b1b1b", // opposite of plain white, not used pitch black because borders and box-shadows are that color
      },
      borderRadius: {
        base: "5px",
      },
      boxShadow: {
        light: "4px 4px 0px 0px #000",
        dark: "4px 4px 0px 0px #000",
      },
      translate: {
        boxShadowX: "4px",
        boxShadowY: "4px",
        reverseBoxShadowX: "-4px",
        reverseBoxShadowY: "-4px",
      },
      fontWeight: {
        base: "500",
        heading: "700",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
