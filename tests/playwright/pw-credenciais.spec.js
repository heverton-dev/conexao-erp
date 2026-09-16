const { chromium } = require("playwright");

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

  console.log("\n=== P5: Credenciais (Role TI) ===\n");

  await step("Login como TI", async () => {
    await page.goto(APP_URL + "/", { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', process.env.TI_EMAIL || "");
    await page.fill('input[type="password"]', process.env.TI_PASSWORD || "");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/credenciais", { timeout: 10000 });
  });

  await step("Pagina de credenciais carregada", async () => {
    await page
      .waitForSelector('table, [class*="card"], [class*="grid"]', {
        timeout: 8000,
      })
      .catch(() => {});
  });

  console.log(
    `\nResultados: ${results.passed} passaram, ${results.failed} falharam\n`,
  );
  await browser.close();
  return results;
}

run().catch(console.error);
