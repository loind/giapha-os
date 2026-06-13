/**
 * Playwright screenshot script for UI/UX review.
 *
 * Usage:
 *   1. Start dev server:  npm run dev  (default http://localhost:3000)
 *   2. Run screenshots:   npx playwright test e2e/take-screenshots.spec.ts
 *
 * Output: e2e/screenshots/{page}-{viewport}.png
 *
 * Environment:
 *   BASE_URL  — override dev server URL (default http://localhost:3000)
 *   AUTH_EMAIL / AUTH_PASSWORD — if set, login and capture authenticated pages
 */

import { test, expect, type Page, type ViewportSize } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const VIEWPORTS: Record<string, ViewportSize> = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

/** Pages that don't require authentication */
const PUBLIC_PAGES: Record<string, string> = {
  landing: "/",
  login: "/login",
  about: "/about",
  setup: "/setup",
};

/** Pages that require authentication (captured only if AUTH_EMAIL is set) */
const AUTH_PAGES: Record<string, string> = {
  "dashboard": "/dashboard",
  "dashboard-members": "/dashboard/members",
  "dashboard-events": "/dashboard/events",
  "dashboard-stats": "/dashboard/stats",
  "dashboard-gallery": "/dashboard/gallery",
  "dashboard-kinship": "/dashboard/kinship",
  "dashboard-users": "/dashboard/users",
  "dashboard-lineage": "/dashboard/lineage",
  "dashboard-data": "/dashboard/data",
};

async function loginIfCredentials(page: Page): Promise<boolean> {
  const email = process.env.AUTH_EMAIL;
  const password = process.env.AUTH_PASSWORD;
  if (!email || !password) return false;

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard**", { timeout: 10000 }).catch(() => {});
  return page.url().includes("/dashboard");
}

async function takeScreenshot(
  page: Page,
  name: string,
  viewport: string,
  fullPage = true,
) {
  const path = `e2e/screenshots/${name}-${viewport}.png`;
  await page.screenshot({ path, fullPage });
  console.log(`  ✓ ${path}`);
}

// ─── Public pages ───────────────────────────────────────────────
for (const [name, path] of Object.entries(PUBLIC_PAGES)) {
  for (const [vpName, vpSize] of Object.entries(VIEWPORTS)) {
    test(`${name} (${vpName})`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: vpSize,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
      // Wait for animations to settle
      await page.waitForTimeout(1000);

      await takeScreenshot(page, name, vpName);
      await context.close();
    });
  }
}

// ─── Authenticated pages ────────────────────────────────────────
for (const [name, path] of Object.entries(AUTH_PAGES)) {
  for (const [vpName, vpSize] of Object.entries(VIEWPORTS)) {
    test(`${name} (${vpName})`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: vpSize,
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      const loggedIn = await loginIfCredentials(page);
      if (!loggedIn) {
        test.skip();
        return;
      }

      await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      await takeScreenshot(page, name, vpName);
      await context.close();
    });
  }
}
