import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    dir: ".",
    include: [
      "tests/unit/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    environment: "jsdom",
    setupFiles: "tests/setup/setup-unit.ts",
    globals: true,
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    isolate: true,
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": "/src/",
    },
  },
});
