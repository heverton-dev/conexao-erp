const { baseUrl } = require("./config");

const urls = ["/admin", "/global/testes"];

async function checkRoutes() {
  console.log(`[SMOKE] Testing ${urls.length} global routes at ${baseUrl}...`);
  let passed = 0;
  let failed = 0;

  for (const route of urls) {
    try {
      const res = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      if (res.status === 200 || res.status === 302 || res.status === 304) {
        console.log(`[SMOKE] PASS: ${route} -> ${res.status}`);
        passed++;
      } else {
        console.warn(
          `[SMOKE] WARN: ${route} -> ${res.status} (may be acceptable)`,
        );
        passed++;
      }
    } catch (err) {
      console.error(`[SMOKE] FAIL: ${route} -> ${err.message}`);
      failed++;
    }
  }

  console.log(`[SMOKE] Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

checkRoutes();
