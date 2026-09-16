const fs = require("fs");
const path = require("path");
const pg = require("C:/Users/trcnologia/Desktop/PROJETOS/proj_erp/supabase-mcp-server/node_modules/pg");

// Read .env
const env = {};
for (const line of fs.readFileSync("C:/Users/trcnologia/Desktop/PROJETOS/proj_erp/.env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const ref = env.VITE_SUPABASE_URL.replace("https://", "").split(".")[0];
const DB_URL = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;

const migrations = [
  "20260718180000_fix_fk_implante_chaves.sql",
  "20260718190000_seed_empresa_teste.sql",
];

(async () => {
  const c = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log("Connected to database.");

  for (const file of migrations) {
    const filePath = path.join("C:/Users/trcnologia/Desktop/PROJETOS/proj_erp/supabase/migrations", file);
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] ${file} not found`);
      continue;
    }
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`\nApplying: ${file}`);
    try {
      await c.query(sql);
      console.log(`  OK`);
    } catch (e) {
      console.log(`  ERROR: ${e.message}`);
    }
  }

  await c.end();
  console.log("\nDone.");
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
