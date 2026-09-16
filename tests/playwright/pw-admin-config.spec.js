const { chromium } = require("playwright");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

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

  console.log("\n=== P4: Admin Config (Super Admin) ===\n");

  await step("Login como super admin", async () => {
    await page.goto(APP_URL + "/", { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', process.env.SA_EMAIL || "");
    await page.fill('input[type="password"]', process.env.SA_PASSWORD || "");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  await step("Navegar para admin/config", async () => {
    await page.goto(APP_URL + "/admin/config", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
  });

  await step("Abrir aba Integrações", async () => {
    const tab = await page.$('button, [role="tab"]:has-text("Integra")');
    if (tab) {
      await tab.click();
      await page.waitForTimeout(1000);
    }
  });

  await step("Abrir Central de Acoes", async () => {
    const tab = await page.$('button, [role="tab"]:has-text("Central")');
    if (tab) {
      await tab.click();
      await page.waitForTimeout(1000);
    }
  });

  console.log(
    `\nResultados: ${results.passed} passaram, ${results.failed} falharam\n`,
  );
  await browser.close();
  return results;
}

run().catch(console.error);
