import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || 3000;
const baseURL = `https://app.humanlog.dev:${PORT}`;

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  globalSetup: "./tests/setup/global-setup.js",
  timeout: 30 * 1000,
  testDir: "tests/e2e",
  outputDir: "test-results/",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: `npm run dev`,
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: false,
  },

  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: "retry-with-trace",
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Desktop Firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "Desktop Safari",
      use: {
        ...devices["Desktop Safari"],
      },
    },

    // Test against mobile viewports.
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },
    {
      name: "Mobile Safari",
      use: devices["iPhone 12"],
    },
  ],
});
