#!/usr/bin/env node
/**
 * db-query.mjs — executa SQL no Postgres do projeto Supabase pela Management API
 * (`POST /v1/projects/{ref}/database/query`).
 *
 * Por que pela API e não por `pg`: a conexão direta em `db.<ref>.supabase.co`
 * costuma ser recusada deste ambiente, e adivinhar host/região de pooler é
 * frágil. A Management API só precisa de `SUPABASE_ACCESS_TOKEN` (`sbp_…`).
 *
 * Uso como módulo:
 *   import { query } from "./db-query.mjs";
 *   const rows = await query("select 1 as um");
 *
 * Uso como CLI (lê o SQL de argv ou de stdin):
 *   node scripts/db-query.mjs "select count(*) from profiles"
 *   echo "select 1" | node scripts/db-query.mjs
 *
 * Nenhuma credencial é impressa. Cuidado: isto executa SQL arbitrário no banco
 * do projeto — trate como acesso de produção.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function lerEnv(root = process.cwd()) {
  const p = join(root, ".env");
  const env = {};
  if (!existsSync(p)) return env;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (line.trimStart().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

export function projectRef(env = lerEnv()) {
  if (!env.VITE_SUPABASE_URL) return null;
  return env.VITE_SUPABASE_URL.replace(/^https?:\/\//, "").split(".")[0];
}

export async function query(sql, { timeoutMs = 120000 } = {}) {
  const env = lerEnv();
  const ref = projectRef(env);
  const token = env.SUPABASE_ACCESS_TOKEN;
  if (!ref) throw new Error("VITE_SUPABASE_URL ausente no .env");
  if (!token?.startsWith("sbp_"))
    throw new Error("SUPABASE_ACCESS_TOKEN deve ser um token de acesso `sbp_…`");

  const r = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
      signal: AbortSignal.timeout(timeoutMs),
    },
  );

  const texto = await r.text();
  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    throw new Error(`Resposta não-JSON (HTTP ${r.status}): ${texto.slice(0, 300)}`);
  }
  if (!r.ok || (corpo && corpo.message))
    throw new Error(corpo?.message ?? `HTTP ${r.status}`);
  return corpo;
}

// CLI
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const sql =
    process.argv[2] ?? readFileSync(0, "utf8"); /* stdin quando sem argumento */
  try {
    const rows = await query(sql);
    console.log(JSON.stringify(rows, null, 1));
  } catch (e) {
    console.error("Erro:", e.message);
    process.exit(1);
  }
}
