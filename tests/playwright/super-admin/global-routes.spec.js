const { chromium } = require("playwright");
const { loginAsSuperAdmin } = require("../helpers/auth");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  const results = { passed: 0, failed: 0, steps: [] };

  async function step(name, fn) {
    try {
      await fn();
      results.passed++;
      results.steps.push({ name, status: "✅" });
      console.log(`  ✅ ${name}`);
    } catch (e) {
      results.failed++;
      results.steps.push({ name, status: "❌", error: e.message });
      console.log(`  ❌ ${name}: ${e.message}`);
    }
  }

  console.log("\n=== Super Admin - Global Routes ===\n");

  await loginAsSuperAdmin(page);

  const globalRoutes = [
    "/global/empresas",
    "/global/modulos",
    "/global/permissoes",
    "/global/integracoes",
    "/global/banco",
    "/global/design",
    "/global/acoes",
  ];

  for (const route of globalRoutes) {
    await step(`Rota ${route} carrega sem redirect`, async () => {
      await page.goto(APP_URL + route, {
        waitUntil: "networkidle",
        timeout: 15000,
      });
      const currentUrl = page.url();
      if (currentUrl.includes("/login") || currentUrl === APP_URL + "/") {
        throw new Error(`Redirecionado para login: ${currentUrl}`);
      }
    });
  }

  await browser.close();

  console.log(
    `\nResultados: ${results.passed} passaram, ${results.failed} falharam\n`,
  );
  return results;
}

run().catch(console.error);
