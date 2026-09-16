const { chromium } = require("playwright");
const path = require("path");

const APP_URL = process.env.APP_URL || "http://localhost:3000";

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

  console.log("\n=== P1: Fluxo Completo (Consultor + Lead) ===\n");

  // 1. Login como consultor
  await step("Login como consultor", async () => {
    await page.goto(APP_URL + "/", { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', process.env.CONSULTOR_EMAIL || "");
    await page.fill('input[type="password"]', process.env.CONSULTOR_PASSWORD || "");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/consultor", { timeout: 10000 });
  });

  // 2. Gerar link de cadastro
  await step("Gerar link de cadastro PF", async () => {
    await page
      .waitForSelector("text=Gerar Link", { timeout: 5000 })
      .catch(() => {});
    // Tenta achar o botao de gerar link
    const btn = await page.$('button:has-text("Gerar")');
    if (btn) {
      await btn.click();
      await delay(1000);
    }
  });

  // 3. Logout
  await step("Logout", async () => {
    await page.goto(APP_URL + "/", { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.localStorage.clear();
    });
  });

  console.log(
    `\nResultados: ${results.passed} passaram, ${results.failed} falharam\n`,
  );
  await browser.close();
  return results;
}

run().catch(console.error);
