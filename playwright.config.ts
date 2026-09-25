import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

import { TEST_DATABASE_URL } from "./src/test/test-database";

const port = 3100;
const libraryPath = [
  path.resolve(process.cwd(), ".playwright-libs"),
  process.env.LD_LIBRARY_PATH,
]
  .filter(Boolean)
  .join(":");

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
    launchOptions: {
      env: {
        ...process.env,
        LD_LIBRARY_PATH: libraryPath,
      },
    },
  },
  webServer: {
    command: `pnpm exec next build && pnpm exec next start --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_DIST_DIR: ".next-e2e",
      DATABASE_URL: TEST_DATABASE_URL,
      AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY || "test-gateway-key",
      SKIP_ENV_VALIDATION: "1",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
