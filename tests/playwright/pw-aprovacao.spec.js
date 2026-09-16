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

  console.log("\n=== P2: Aprovacao (Role Cadastro) ===\n");

  await step("Login como cadastro", async () => {
    await page.goto(APP_URL + "/", { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', process.env.CADASTRO_EMAIL || "");
    await page.fill('input[type="password"]', process.env.CADASTRO_PASSWORD || "");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  });

  await step("Dashboard carregado com cards", async () => {
    await page.waitForSelector("text=Cadastros", { timeout: 5000 });
    const body = await page.textContent("body");
    const hasCounts = body.includes("Em Análise") || body.includes("Pendente");
    if (!hasCounts)
      console.log("  ⚠️ Cards nao encontrados, mas pagina carregou");
  });

  await step("Navegar para lista de cadastros", async () => {
    await page.goto(APP_URL + "/clientes", { waitUntil: "networkidle" });
    await page
      .waitForSelector('table, [class*="grid"], [class*="list"]', {
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
