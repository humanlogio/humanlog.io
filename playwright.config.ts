import { defineConfig, devices } from "@playwright/test";

const HOSTNAME = "app.humanlog.dev";
const PORT = process.env.PORT || 3000;
const baseURL = `https://${HOSTNAME}:${PORT}`;

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  timeout: 30 * 1000,
  testDir: "tests/e2e",
  outputDir: "test-results/",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  webServer: {
    command: `npm run dev`,
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: true,
    ignoreHTTPSErrors: true,
  },

  use: {
    baseURL,
    trace: "retry-with-trace",
    ignoreHTTPSErrors: true,
    launchOptions: {
      args: ["--no-sandbox"],
      env: {
        ...process.env,
        NODE_EXTRA_CA_CERTS: "/etc/ssl/certs/ca-certificates.crt",
      },
    },
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: devices["Desktop Chrome"],
    },
    {
      name: "Desktop Firefox",
      use: devices["Desktop Firefox"],
    },
    {
      name: "Desktop Safari",
      use: devices["Desktop Safari"],
    },

    {
      name: "Mobile Chrome",
      use: devices["Pixel 5"],
    },
    {
      name: "Mobile Safari",
      use: devices["iPhone 12"],
    },
  ],
});
