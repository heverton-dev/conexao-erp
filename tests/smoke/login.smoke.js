const { baseUrl, credentials } = require("./config");

async function loginSmoke() {
  console.log(`[SMOKE] Testing login at ${baseUrl}...`);

  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (res.status === 200 || res.status === 302) {
    console.log("[SMOKE] PASS: Login endpoint responded with", res.status);
    process.exit(0);
  }

  // Some apps use 302 redirect on success
  if (res.status === 302 && res.headers.get("location")) {
    console.log(
      "[SMOKE] PASS: Login redirected to",
      res.headers.get("location"),
    );
    process.exit(0);
  }

  console.error(`[SMOKE] FAIL: Login returned ${res.status}`);
  process.exit(1);
}

loginSmoke().catch((err) => {
  console.error("[SMOKE] FAIL:", err.message);
  process.exit(1);
});
