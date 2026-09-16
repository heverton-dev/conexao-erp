import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/setup";

test.describe("Cadastros CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test("pagina de solicitacoes carrega", async ({ page }) => {
    await page.goto("/cadastros/solicitacoes");
    await expect(page.locator("text=Solicitações").first()).toBeVisible();
  });

  test("pagina de solicitacoes retorna 200", async ({ page }) => {
    const response = await page.goto("/cadastros/solicitacoes");
    expect(response?.status()).toBe(200);
  });
});
