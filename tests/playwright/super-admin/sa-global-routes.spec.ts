import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/setup";

test.describe("Global Routes Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  const routes = [
    "/admin",
    "/global/testes",
    "/global/empresas",
    "/global/modulos",
    "/global/permissoes",
    "/global/integracoes",
    "/global/banco",
    "/global/design",
    "/global/acoes",
    "/empresa/config",
  ];

  for (const route of routes) {
    test(`acessa ${route} com status 200`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
    });
  }
});
