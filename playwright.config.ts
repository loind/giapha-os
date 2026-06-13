import { defineConfig } from "@playwright/test";

/**
 * Playwright config for UI screenshot capture.
 *
 * Usage:
 *   1. Start dev server:   npm run dev
 *   2. Capture screenshots: npx playwright test --config=playwright.config.ts
 *   3. With auth:          AUTH_EMAIL=x AUTH_PASSWORD=y npx playwright test
 *
 * Screenshots saved to: e2e/screenshots/
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",
  timeout: 30000,
  retries: 0,
  workers: 1, // Sequential to avoid port conflicts
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    screenshot: "off", // We control screenshots manually
    trace: "off",
    video: "off",
  },
});
