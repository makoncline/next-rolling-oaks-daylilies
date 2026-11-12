import { PlaywrightTestConfig, devices } from "@playwright/test";

const externalServer = process.env.TEST_BASE_URL;
const port = Number(process.env.PORT || 3000);
if (!externalServer && (!Number.isInteger(port) || port < 1024 || port > 65535)) {
  throw new Error("PORT must be a valid unprivileged port");
}
const baseURL = externalServer || `http://127.0.0.1:${port}`;

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  // An explicit URL always selects an already-running server, including in CI.
  // Otherwise own the requested port; never silently reuse another checkout.
  ...(externalServer
    ? {}
    : {
        webServer: {
          command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
};

export default config;
