#!/usr/bin/env node
/**
 * db-connect.mjs — resolve a string de conexão do Postgres do Supabase e
 * exporta um cliente `pg` pronto. Usado por audit-empresa-id.mjs e
 * db-migrations-status.mjs.
 *
 * Tenta, na ordem:
 *   1. SUPABASE_DB_URL (se definida no ambiente)
 *   2. conexão direta   postgres@db.<ref>.supabase.co:5432
 *   3. pooler (session) postgres.<ref>@aws-<n>-<região>.pooler.supabase.com:5432
 *
 * A região do pooler vem da Management API quando SUPABASE_ACCESS_TOKEN é um
 * token `sbp_…`; sem isso, tenta as regiões mais comuns.
 *
 * Nenhuma credencial é impressa.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

export function lerEnv(root = process.cwd()) {
  const p = join(root, ".env");
  const env = {};
  if (!existsSync(p)) return env;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (line.trimStart().startsWith("#")) continue;
    // tolera `KEY = value` e `KEY=value`
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

export function projectRef(env) {
  if (!env.VITE_SUPABASE_URL) return null;
  return env.VITE_SUPABASE_URL.replace(/^https?:\/\//, "").split(".")[0];
}

async function regiaoViaManagementApi(env, ref) {
  if (!env.SUPABASE_ACCESS_TOKEN?.startsWith("sbp_")) return null;
  try {
    const r = await fetch("https://api.supabase.com/v1/projects", {
      headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}` },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) return null;
    const projetos = await r.json();
    if (!Array.isArray(projetos)) return null;
    return projetos.find((p) => p.id === ref)?.region ?? null;
  } catch {
    return null;
  }
}

const REGIOES_COMUNS = [
  "us-east-1",
  "us-west-1",
  "sa-east-1",
  "eu-central-1",
  "eu-west-1",
  "ap-southeast-1",
];

function candidatos(ref, senha, regioes) {
  const s = encodeURIComponent(senha);
  const out = [
    {
      rotulo: "direta db.<ref>:5432",
      url: `postgresql://postgres:${s}@db.${ref}.supabase.co:5432/postgres`,
    },
  ];
  for (const reg of regioes)
    for (const n of [0, 1])
      out.push({
        rotulo: `pooler session aws-${n}-${reg}:5432`,
        url: `postgresql://postgres.${ref}:${s}@aws-${n}-${reg}.pooler.supabase.com:5432/postgres`,
      });
  return out;
}

/** Devolve { client, rotulo } conectado, ou lança com o resumo das tentativas. */
export async function conectar({ verbose = false } = {}) {
  const env = lerEnv();
  if (process.env.SUPABASE_DB_URL) {
    const c = new pg.Client({
      connectionString: process.env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    });
    await c.connect();
    return { client: c, rotulo: "SUPABASE_DB_URL" };
  }

  const ref = projectRef(env);
  if (!ref || !env.SUPABASE_DB_PASSWORD)
    throw new Error(
      "Faltam VITE_SUPABASE_URL e/ou SUPABASE_DB_PASSWORD no .env (ou defina SUPABASE_DB_URL).",
    );

  const regiao = await regiaoViaManagementApi(env, ref);
  const regioes = regiao
    ? [regiao, ...REGIOES_COMUNS.filter((r) => r !== regiao)]
    : REGIOES_COMUNS;
  if (verbose)
    console.log(
      `  ref=${ref} · região=${regiao ?? "desconhecida (tentando as comuns)"}`,
    );

  const erros = [];
  for (const { rotulo, url } of candidatos(ref, env.SUPABASE_DB_PASSWORD, regioes)) {
    const c = new pg.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });
    try {
      await c.connect();
      if (verbose) console.log(`  conectado via ${rotulo}`);
      return { client: c, rotulo };
    } catch (e) {
      erros.push(`${rotulo}: ${e.message.slice(0, 70)}`);
      await c.end().catch(() => {});
    }
  }
  throw new Error("Nenhuma conexão funcionou:\n  - " + erros.join("\n  - "));
}
