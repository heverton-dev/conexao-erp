#!/usr/bin/env node
/**
 * audit-empresa-id.mjs — responde a pergunta que o repositório NÃO responde:
 * quais tabelas ainda têm a coluna `empresa_id`.
 *
 * Por que existe: a migration `20260721000000_remove_empresa_id_all_tables.sql`
 * usa `ALTER TABLE IF EXISTS <nome_antigo>`, e 24 desses nomes já haviam sido
 * renomeados pela `20260705000000_normalizar_tabelas.sql`. O `IF EXISTS` virou
 * no-op silencioso e a verificação final só fazia `RAISE WARNING`. Logo, grep na
 * migration dá resposta errada — só o schema real vale.
 *
 * Uso:
 *   node scripts/audit-empresa-id.mjs
 *
 * Requer no `.env`:
 *   VITE_SUPABASE_URL   +  SUPABASE_DB_PASSWORD
 *   (ou defina SUPABASE_DB_URL direto)
 *
 * Saída: tabelas com empresa_id, separadas em "exceção aprovada" e "pendente",
 * e o cruzamento com os módulos que ainda referenciam o campo no código.
 * Exit 1 se houver pendência. Nenhuma credencial é impressa.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const ROOT = process.cwd();

/**
 * Exceções aprovadas — vazio por decisão de 2026-08-03: `empresa_id` não tem uso
 * multi-tenant, então nenhuma tabela deve mantê-la. Qualquer ocorrência é pendência.
 */
const EXCECOES = [];
const isExcecao = (t) => EXCECOES.some((r) => r.test(t));

function dbUrl() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return null;
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    // tolera `KEY = value`, espaços e CRLF — o .env do projeto mistura os formatos
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_DB_PASSWORD) return null;
  const ref = env.VITE_SUPABASE_URL.replace("https://", "").split(".")[0];
  return `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;
}

/** Onde o código ainda referencia empresa_id, por módulo. */
function usosNoCodigo() {
  const base = join(ROOT, "src", "features");
  const out = new Map();
  const walk = (d, a = []) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p, a);
      else if (/\.(ts|tsx)$/.test(e.name)) a.push(p);
    }
    return a;
  };
  for (const mod of readdirSync(base)) {
    let n = 0;
    for (const f of walk(join(base, mod)))
      n += (readFileSync(f, "utf8").match(/empresa_id/g) || []).length;
    if (n) out.set(mod, n);
  }
  return out;
}

const url = dbUrl();
if (!url) {
  console.error(
    "Sem credencial de banco. Defina SUPABASE_DB_URL, ou VITE_SUPABASE_URL +\n" +
      "SUPABASE_DB_PASSWORD no .env. Sem isso este script não tem o que auditar —\n" +
      "e o grep nas migrations NÃO é substituto (ver cabeçalho).",
  );
  process.exit(2);
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  const { rows } = await client.query(
    `SELECT table_name, is_nullable FROM information_schema.columns
     WHERE table_schema = 'public' AND column_name = 'empresa_id'
     ORDER BY table_name`,
  );

  const excecoes = rows.filter((r) => isExcecao(r.table_name));
  const pendentes = rows.filter((r) => !isExcecao(r.table_name));

  console.log(`Tabelas com empresa_id: ${rows.length}`);
  console.log(`  exceções aprovadas : ${excecoes.length}`);
  console.log(`  pendentes          : ${pendentes.length}\n`);

  if (pendentes.length) {
    console.log("PENDENTES (alvo da migration de fase 2):");
    for (const r of pendentes)
      console.log(
        `  - ${r.table_name}${r.is_nullable === "NO" ? "  [NOT NULL — código não pode parar de enviar antes da fase 1]" : ""}`,
      );
    console.log("");
  }

  const usos = usosNoCodigo();
  if (usos.size) {
    console.log("Módulos que ainda referenciam empresa_id no código:");
    for (const [mod, n] of [...usos].sort((a, b) => b[1] - a[1]))
      console.log(`  ${mod.padEnd(18)} ${n} ocorrência(s)`);
  }

  process.exit(pendentes.length ? 1 : 0);
} catch (e) {
  console.error("Falha ao consultar o schema:", e.message);
  process.exit(2);
} finally {
  await client.end().catch(() => {});
}
