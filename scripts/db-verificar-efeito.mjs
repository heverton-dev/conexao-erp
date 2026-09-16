#!/usr/bin/env node
/**
 * db-verificar-efeito.mjs — para cada migration marcada como aplicada, verifica
 * se o efeito dela existe de fato no schema.
 *
 * Por que existe: `supabase_migrations.schema_migrations` diz que 159 migrations
 * foram aplicadas, mas 39 delas foram inseridas à mão (statement `-- pre-applied`
 * ou `-- Obsoleta: …`) sem que o SQL rodasse. O ledger mente; o schema não.
 *
 * Método: extrai de cada arquivo os objetos que ele deveria criar/renomear/
 * remover, e compara com information_schema. Read-only.
 *
 * Uso: `npm run db:verificar` — exit 1 se alguma marcada como aplicada não tiver
 * surtido efeito.
 */
import { readFileSync, readdirSync } from "node:fs";
import { query } from "./db-query.mjs";

const DIR = "supabase/migrations";

// ── schema real ─────────────────────────────────────────────────────────────
const tabelasRows = await query(
  "select table_name from information_schema.tables where table_schema='public'",
);
const colunasRows = await query(
  "select table_name, column_name from information_schema.columns where table_schema='public'",
);
const tabelas = new Set(tabelasRows.map((r) => r.table_name));
const colunas = new Set(
  colunasRows.map((r) => `${r.table_name}.${r.column_name}`),
);

// ── ledger ──────────────────────────────────────────────────────────────────
const ledger = await query(
  `select version, left(coalesce(statements[1],''),40) as marcador
   from supabase_migrations.schema_migrations`,
);
const marcador = new Map(ledger.map((r) => [r.version, r.marcador]));
const manual = (m) =>
  m?.startsWith("-- pre-applied") || m?.startsWith("-- Obsoleta");

// ── expectativas por migration ──────────────────────────────────────────────
function expectativas(sql) {
  const e = [];
  for (const m of sql.matchAll(
    /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)/gi,
  ))
    e.push({ tipo: "tabela", alvo: m[1] });
  for (const m of sql.matchAll(
    /ALTER TABLE (?:IF EXISTS )?(?:public\.)?(\w+) RENAME TO (\w+)/gi,
  ))
    e.push({ tipo: "renome", de: m[1], alvo: m[2] });
  for (const m of sql.matchAll(
    /ALTER TABLE (?:IF EXISTS )?(?:public\.)?(\w+)[\s\S]{0,60}?ADD COLUMN (?:IF NOT EXISTS )?(\w+)/gi,
  ))
    e.push({ tipo: "coluna", alvo: `${m[1]}.${m[2]}` });
  for (const m of sql.matchAll(
    /ALTER TABLE (?:IF EXISTS )?(?:public\.)?(\w+) DROP COLUMN (?:IF EXISTS )?(\w+)/gi,
  ))
    e.push({ tipo: "coluna_removida", alvo: `${m[1]}.${m[2]}` });
  return e;
}

function avaliar(e) {
  if (e.tipo === "tabela") return tabelas.has(e.alvo);
  if (e.tipo === "renome") return tabelas.has(e.alvo) && !tabelas.has(e.de);
  if (e.tipo === "coluna") return colunas.has(e.alvo);
  if (e.tipo === "coluna_removida") {
    const [t] = e.alvo.split(".");
    return !tabelas.has(t) || !colunas.has(e.alvo);
  }
  return true;
}

// ── varredura ───────────────────────────────────────────────────────────────
const arquivos = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
const semEfeito = [];
const parciais = [];
let okManual = 0;
let semExpectativa = 0;

for (const f of arquivos) {
  const versao = f.split("_")[0];
  const marc = marcador.get(versao);
  if (marc === undefined) continue; // pendente, tratado por db:status
  if (!manual(marc)) continue; // registrada com execução real

  const exp = expectativas(readFileSync(`${DIR}/${f}`, "utf8"));
  if (!exp.length) {
    semExpectativa++;
    continue;
  }
  const falhas = exp.filter((e) => !avaliar(e));
  if (!falhas.length) okManual++;
  else if (falhas.length === exp.length)
    semEfeito.push({ f, marc, total: exp.length, falhas });
  else parciais.push({ f, marc, total: exp.length, falhas });
}

const resumo = (x) =>
  x.falhas
    .slice(0, 4)
    .map((e) =>
      e.tipo === "renome" ? `${e.de}→${e.alvo}` : `${e.tipo}:${e.alvo}`,
    )
    .join(", ") + (x.falhas.length > 4 ? ` … (+${x.falhas.length - 4})` : "");

console.log(
  `migrations marcadas à mão com efeito verificável: ${okManual + semEfeito.length + parciais.length}` +
    ` · sem objeto verificável: ${semExpectativa}`,
);
console.log(
  `  efeito presente: ${okManual} · SEM efeito: ${semEfeito.length} · parcial: ${parciais.length}\n`,
);

if (semEfeito.length) {
  console.log("SEM EFEITO — marcada como aplicada, nada existe no schema:");
  for (const x of semEfeito)
    console.log(`  ${x.f}\n      ${x.falhas.length}/${x.total} · ${resumo(x)}`);
}
if (parciais.length) {
  console.log("\nPARCIAL — parte do efeito existe:");
  for (const x of parciais)
    console.log(`  ${x.f}\n      ${x.falhas.length}/${x.total} faltando · ${resumo(x)}`);
}

process.exit(semEfeito.length || parciais.length ? 1 : 0);
