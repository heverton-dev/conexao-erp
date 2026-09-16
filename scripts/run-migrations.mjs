import pg from "pg";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(__dirname, "..", "supabase", "migrations");
const IMPORT_SQL = resolve(__dirname, "import-bubble.sql");

const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
if (!PASSWORD) {
  console.error("ERRO: Defina SUPABASE_DB_PASSWORD");
  process.exit(1);
}

const ENCODED_PW = encodeURIComponent(PASSWORD);
const CONNECTION_STRING = `postgresql://postgres:${ENCODED_PW}@db.cluuqzhizeqvkgvfdisx.supabase.co:5432/postgres`;

const pool = new pg.Pool({ connectionString: CONNECTION_STRING });

async function run() {
  const { rows: tables } = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name",
  );
  const existing = new Set(tables.map((r) => r.table_name));
  console.log("Tabelas existentes:", [...existing].join(", ") || "(nenhuma)");

  const hasProfiles = existing.has("profiles");
  const hasCadastros = existing.has("cadastros");

  // 00001
  if (!hasProfiles) {
    console.log("→ 00001_profiles.sql");
    await pool.query(
      readFileSync(join(MIGRATIONS_DIR, "00001_profiles.sql"), "utf-8"),
    );
  } else {
    console.log("→ 00001_profiles.sql (skip)");
  }

  // 00002 (tables.sql) só se NÃO tiver cadastros (já normalizado)
  // ou se tiver pacientes mas não cadastros (migração pendente)
  if (!hasCadastros && !existing.has("pacientes")) {
    console.log("→ 00002_tables.sql");
    await pool.query(
      readFileSync(join(MIGRATIONS_DIR, "00002_tables.sql"), "utf-8"),
    );
  } else {
    console.log("→ 00002_tables.sql (skip)");
  }

  // 00003 (extend) — só se tabela pacientes ainda existe (pré-normalização)
  if (existing.has("pacientes") && !hasCadastros) {
    console.log("→ 00003_extend_pacientes.sql");
    await pool.query(
      readFileSync(join(MIGRATIONS_DIR, "00003_extend_pacientes.sql"), "utf-8"),
    );
  } else {
    console.log("→ 00003_extend_pacientes.sql (skip)");
  }

  // 00004 (normalize) — só se cadastros ainda não existe
  if (!hasCadastros) {
    console.log("→ 00004_normalize.sql");
    await pool.query(
      readFileSync(join(MIGRATIONS_DIR, "00004_normalize.sql"), "utf-8"),
    );
  } else {
    console.log("→ 00004_normalize.sql (skip)");
  }

  // 00005 (legacy) — sempre executa (idempotente)
  console.log("→ 00005_legacy.sql");
  await pool.query(
    readFileSync(join(MIGRATIONS_DIR, "00005_legacy.sql"), "utf-8"),
  );

  // Import
  const {
    rows: [{ count }],
  } = await pool.query("SELECT COUNT(*) as count FROM public.cadastros");
  if (Number(count) > 0) {
    console.log(`\nJá existem ${count} cadastros. Pulando import.`);
  } else {
    console.log("\nImportando dados do Bubble...");
    await pool.query(readFileSync(IMPORT_SQL, "utf-8"));
    console.log("Import concluído.");
  }

  // Verify
  const {
    rows: [{ c: cadCount }],
  } = await pool.query("SELECT COUNT(*) as c FROM public.cadastros");
  const {
    rows: [{ c: pfCount }],
  } = await pool.query("SELECT COUNT(*) as c FROM public.cadastros_pf");
  const {
    rows: [{ c: pjCount }],
  } = await pool.query("SELECT COUNT(*) as c FROM public.cadastros_pj");
  const {
    rows: [{ c: endCount }],
  } = await pool.query("SELECT COUNT(*) as c FROM public.cadastros_enderecos");
  console.log(`\nVerificação:`);
  console.log(`  Cadastros:          ${cadCount}`);
  console.log(`  PF:                 ${pfCount}`);
  console.log(`  PJ:                 ${pjCount}`);
  console.log(`  Endereços:          ${endCount}`);

  await pool.end();
}

run().catch((err) => {
  console.error("ERRO:", err.message);
  process.exit(1);
});
