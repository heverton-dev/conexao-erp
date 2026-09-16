#!/usr/bin/env node
/**
 * db-aplicar-migrations.mjs — aplica migrations pela Management API, uma a uma,
 * de forma idempotente e verificando o efeito depois de cada uma.
 *
 * Contexto: 39 migrations deste repositório foram inseridas à mão em
 * `supabase_migrations.schema_migrations` sem que o SQL rodasse. Reaplicar os
 * arquivos originais falha, porque vários usam `CREATE TABLE` / `CREATE POLICY`
 * sem guarda de existência. Este script aplica uma versão idempotente do SQL,
 * sem alterar os arquivos originais.
 *
 * Uso:
 *   node scripts/db-aplicar-migrations.mjs --dry-run <arquivo.sql> [...]
 *   node scripts/db-aplicar-migrations.mjs --aplicar <arquivo.sql> [...]
 *   node scripts/db-aplicar-migrations.mjs --aplicar --lista lote.txt
 *
 * `--dry-run` (padrão) mostra as transformações e NÃO toca no banco.
 *
 * Transformações aplicadas ao SQL:
 *   CREATE TABLE x            -> CREATE TABLE IF NOT EXISTS x
 *   CREATE INDEX i            -> CREATE INDEX IF NOT EXISTS i
 *   CREATE POLICY "p" ON t    -> DROP POLICY IF EXISTS "p" ON t; CREATE POLICY …
 *   CREATE TRIGGER g … ON t   -> DROP TRIGGER IF EXISTS g ON t; CREATE TRIGGER …
 *   ADD COLUMN c              -> ADD COLUMN IF NOT EXISTS c
 *
 * NÃO transforma nem tolera: DROP COLUMN, DROP TABLE, TRUNCATE, DELETE, UPDATE,
 * RENAME TO, ALTER COLUMN TYPE. Arquivo com qualquer um desses é recusado, para
 * que nada destrutivo entre por aqui sem revisão explícita (`--permitir-dml`).
 */
import { readFileSync, existsSync } from "node:fs";
import { query } from "./db-query.mjs";

const argv = process.argv.slice(2);
const APLICAR = argv.includes("--aplicar");
const PERMITIR_DML = argv.includes("--permitir-dml");
const iLista = argv.indexOf("--lista");
let arquivos = argv.filter((a) => a.endsWith(".sql"));
if (iLista !== -1) {
  arquivos = readFileSync(argv[iLista + 1], "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}
if (!arquivos.length) {
  console.error("Informe arquivos .sql ou --lista <arquivo>.");
  process.exit(2);
}

const PROIBIDO = [
  [/\bDROP\s+TABLE\b/i, "DROP TABLE"],
  [/\bDROP\s+COLUMN\b/i, "DROP COLUMN"],
  [/\bTRUNCATE\b/i, "TRUNCATE"],
  [/^\s*DELETE\s+FROM\b/im, "DELETE FROM"],
  [/\bRENAME\s+TO\b/i, "RENAME TO"],
  [/\bALTER\s+COLUMN\s+\w+\s+TYPE\b/i, "ALTER COLUMN TYPE"],
];
const DML = [[/^\s*UPDATE\s+\w+\s+SET\b/im, "UPDATE ... SET"]];

function idempotente(sql) {
  const mudancas = [];
  const conta = (re) => (sql.match(re) || []).length;

  let n = conta(/CREATE TABLE(?!\s+IF NOT EXISTS)/gi);
  if (n) mudancas.push(`${n}× CREATE TABLE → IF NOT EXISTS`);
  sql = sql.replace(/CREATE TABLE(?!\s+IF NOT EXISTS)/gi, "CREATE TABLE IF NOT EXISTS");

  n = conta(/CREATE (UNIQUE )?INDEX(?!\s+IF NOT EXISTS)/gi);
  if (n) mudancas.push(`${n}× CREATE INDEX → IF NOT EXISTS`);
  sql = sql.replace(
    /CREATE (UNIQUE )?INDEX(?!\s+IF NOT EXISTS)/gi,
    (m, u) => `CREATE ${u ?? ""}INDEX IF NOT EXISTS`,
  );

  n = conta(/ADD COLUMN(?!\s+IF NOT EXISTS)/gi);
  if (n) mudancas.push(`${n}× ADD COLUMN → IF NOT EXISTS`);
  sql = sql.replace(/ADD COLUMN(?!\s+IF NOT EXISTS)/gi, "ADD COLUMN IF NOT EXISTS");

  // policies: DROP IF EXISTS antes de cada CREATE POLICY
  const pols = [...sql.matchAll(/CREATE POLICY\s+("?[^"\s]+"?)\s+ON\s+([\w.]+)/gi)];
  if (pols.length) {
    mudancas.push(`${pols.length}× CREATE POLICY → precedida de DROP IF EXISTS`);
    sql = sql.replace(
      /CREATE POLICY\s+("?[^"\s]+"?)\s+ON\s+([\w.]+)/gi,
      (_m, nome, tab) => `DROP POLICY IF EXISTS ${nome} ON ${tab};\nCREATE POLICY ${nome} ON ${tab}`,
    );
  }

  // triggers: DROP IF EXISTS antes de cada CREATE TRIGGER (quando não houver)
  const trgs = [...sql.matchAll(/CREATE TRIGGER\s+(\w+)([\s\S]{0,120}?)\bON\s+([\w.]+)/gi)];
  const semDrop = trgs.filter(
    (t) => !new RegExp(`DROP TRIGGER IF EXISTS ${t[1]}\\b`, "i").test(sql),
  );
  if (semDrop.length) {
    mudancas.push(`${semDrop.length}× CREATE TRIGGER → precedida de DROP IF EXISTS`);
    for (const t of semDrop)
      sql = sql.replace(
        t[0],
        `DROP TRIGGER IF EXISTS ${t[1]} ON ${t[3]};\n${t[0]}`,
      );
  }

  return { sql, mudancas };
}

console.log(
  `${APLICAR ? "APLICANDO" : "DRY-RUN"} · ${arquivos.length} migration(s)\n`,
);

let aplicadas = 0;
for (const rel of arquivos) {
  const caminho = rel.includes("/") ? rel : `supabase/migrations/${rel}`;
  if (!existsSync(caminho)) {
    console.error(`  ✗ ${rel} — arquivo não encontrado`);
    process.exit(1);
  }
  const bruto = readFileSync(caminho, "utf8");
  const versao = rel.split("/").pop().split("_")[0];

  const bloqueios = PROIBIDO.filter(([re]) => re.test(bruto)).map(([, n]) => n);
  const dml = DML.filter(([re]) => re.test(bruto)).map(([, n]) => n);
  if (bloqueios.length) {
    console.error(`  ✗ ${rel} — contém ${bloqueios.join(", ")}. Recusado.`);
    process.exit(1);
  }
  if (dml.length && !PERMITIR_DML) {
    console.error(
      `  ✗ ${rel} — contém ${dml.join(", ")}. Revise e use --permitir-dml se for intencional.`,
    );
    process.exit(1);
  }

  const { sql, mudancas } = idempotente(bruto);
  console.log(`  ${rel}`);
  if (mudancas.length) for (const m of mudancas) console.log(`      ${m}`);
  else console.log("      já idempotente");
  if (dml.length) console.log(`      ⚠ DML permitido: ${dml.join(", ")}`);

  if (!APLICAR) continue;

  try {
    await query(sql, { timeoutMs: 180000 });
  } catch (e) {
    console.error(`      ✗ FALHOU: ${e.message.slice(0, 300)}`);
    console.error("\nInterrompido. Nenhuma migration seguinte foi aplicada.");
    process.exit(1);
  }

  // registra a verdade no ledger (upsert), substituindo marcador falso se houver
  const marcador = `-- Reaplicada idempotente em 2026-08-03 por scripts/db-aplicar-migrations.mjs`;
  await query(`
    insert into supabase_migrations.schema_migrations (version, statements)
    values ('${versao}', array['${marcador}'])
    on conflict (version) do update set statements = array['${marcador}']
  `);
  console.log("      ✓ aplicada e registrada");
  aplicadas++;
}

if (APLICAR) console.log(`\n${aplicadas} migration(s) aplicada(s).`);
else console.log("\nDry-run: nada foi enviado ao banco. Use --aplicar para executar.");
