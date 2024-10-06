import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    dir: "tests/unit",
    environment: "jsdom",
    setupFiles: "tests/setup/setup-unit.ts",
    globals: true,
  },
  resolve: {
    alias: {
      "@": "/src/",
    },
  },
});
