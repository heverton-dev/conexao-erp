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

  console.log("\n=== Super Admin - Navigation E2E ===\n");

  await loginAsSuperAdmin(page);

  const expectedModules = [
    "Cadastros",
    "CRM",
    "Despesas",
    "NPS",
    "Hub",
    "Linktree",
  ];
  for (const modName of expectedModules) {
    await step(`Sidebar contém módulo "${modName}"`, async () => {
      const visible = await page
        .locator(`nav:has-text("${modName}")`)
        .first()
        .isVisible();
      if (!visible) throw new Error(`Módulo "${modName}" não encontrado`);
    });
  }

  await browser.close();

  console.log(
    `\nResultados: ${results.passed} passaram, ${results.failed} falharam\n`,
  );
  return results;
}

run().catch(console.error);
