import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/setup";

test.describe("Super Admin Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test("visualiza todos os modulos na sidebar", async ({ page }) => {
    const modulos = ["Cadastros", "CRM", "Despesas", "NPS", "Hub", "Linktree"];
    for (const mod of modulos) {
      await expect(
        page.locator(`nav:has-text("${mod}")`).first(),
      ).toBeVisible();
    }
  });

  test("acessa rota de admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("acessa rota de testes globais", async ({ page }) => {
    await page.goto("/global/testes");
    await expect(page).toHaveURL(/\/global\/testes/);
  });

  test("acessa /empresa/config sem redirect", async ({ page }) => {
    await page.goto("/empresa/config");
    await expect(page).not.toHaveURL(/\/login/);
  });
});
