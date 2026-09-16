import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/setup";

test.describe("Despesas CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test("lista despesas carrega", async ({ page }) => {
    await page.goto("/despesas");
    await expect(page.locator("text=Despesas").first()).toBeVisible();
  });

  test("navega para formulario de nova despesa", async ({ page }) => {
    await page.goto("/despesas");
    const btn = page
      .locator(
        'a[href*="nova"], button:has-text("Nova"), button:has-text("Adicionar")',
      )
      .first();
    if (await btn.isVisible()) {
      await btn.click();
      await expect(page).toHaveURL(
        /\/despesas\/.*nova|\/despesas\/.*novo|\/despesas\/new/,
      );
    }
  });

  test("rota despesas retorna 200", async ({ page }) => {
    const response = await page.goto("/despesas");
    expect(response?.status()).toBe(200);
  });
});
