import { Page } from "@playwright/test";

export const SUPER_ADMIN = {
  email: process.env.SA_EMAIL,
  password: process.env.SA_PASSWORD,
};

export async function loginAsSuperAdmin(page: Page) {
  await page.goto("/");
  await page.fill('input[type="email"]', SUPER_ADMIN.email);
  await page.fill('input[type="password"]', SUPER_ADMIN.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(2000);
}

export async function waitForDashboard(page: Page) {
  await page.waitForSelector("text=Dashboard", { timeout: 10000 });
}
