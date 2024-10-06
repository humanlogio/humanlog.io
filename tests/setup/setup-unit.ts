import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("next/font/google", () => ({
  JetBrains_Mono: () => ({
    variable: "--font-mono",
  }),
}));

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      console.error("Deprecated. Do not use.");
    },
    removeListener: () => {
      console.error("Deprecated. Do not use.");
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
