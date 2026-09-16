#!/usr/bin/env node
/**
 * db-migrations-status.mjs — compara `supabase/migrations/` com
 * `supabase_migrations.schema_migrations` no banco do projeto.
 *
 * Responde: quais migrations do repositório NÃO estão aplicadas, e quais
 * versões o banco tem que o repositório não tem.
 *
 * Uso: `npm run db:status`  — exit 1 se houver pendência.
 */
import { readdirSync } from "node:fs";
import { query } from "./db-query.mjs";

const DIR = "supabase/migrations";

const arquivos = readdirSync(DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => ({ arquivo: f, versao: f.split("_")[0] }));

const rows = await query(
  "select version from supabase_migrations.schema_migrations order by version",
);
const aplicadas = new Set(rows.map((r) => r.version));

const pendentes = arquivos.filter((a) => !aplicadas.has(a.versao));
const orfas = [...aplicadas].filter(
  (v) => !arquivos.some((a) => a.versao === v),
);

console.log(
  `migrations no repo: ${arquivos.length} · aplicadas no banco: ${aplicadas.size} · pendentes: ${pendentes.length}`,
);

if (pendentes.length) {
  console.log("\nPENDENTES (na ordem de aplicação):");
  for (const p of pendentes) console.log(`  ${p.arquivo}`);
}

if (orfas.length) {
  console.log(
    `\nVersões aplicadas que não existem no repo (${orfas.length}):\n  ${orfas.join(", ")}`,
  );
}

// Verificação cruzada: migration marcada como aplicada pode não ter tido efeito
// (todo statement com IF EXISTS sobre nome que não casou = no-op silencioso).
const sonda = await query(`
  select
    (select count(*) from information_schema.tables
      where table_schema='public' and table_name='hub_materials')  as hub_materials_en,
    (select count(*) from information_schema.tables
      where table_schema='public' and table_name='hub_materiais')  as hub_materiais_pt,
    (select count(*) from information_schema.columns
      where table_schema='public' and column_name='empresa_id')    as tabelas_com_empresa_id
`);
const s = sonda[0];
console.log(
  `\nsonda de efeito: hub_materials(EN)=${s.hub_materials_en} · hub_materiais(PT)=${s.hub_materiais_pt} · tabelas com empresa_id=${s.tabelas_com_empresa_id}`,
);
if (Number(s.hub_materials_en) === 1 && Number(s.hub_materiais_pt) === 0)
  console.log(
    "  ⚠ a renomeação EN→PT não teve efeito, mesmo que 20260705000000 esteja marcada como aplicada",
  );

process.exit(pendentes.length ? 1 : 0);
