#!/usr/bin/env node
/**
 * check:isolation — garante que nenhum módulo de `src/features/` importe
 * *internals* de outro módulo (regra `.agents/rules/module-autonomy.yaml`).
 *
 *   Permitido:  from "~/features/<outro>"             (barrel público, index.ts)
 *   Proibido:   from "~/features/<outro>/services/…"  (internals)
 *
 * Um `rg 'from "~/features/'` cru NÃO responde isso: conta também os imports do
 * próprio módulo e os do barrel, devolvendo dezenas de falsos positivos.
 *
 * Uso: `npm run check:isolation` — exit 1 se houver violação.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

const BASE = join("src", "features");

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const violacoes = [];
const barrel = [];

for (const mod of readdirSync(BASE)) {
  for (const file of walk(join(BASE, mod))) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(
      /from "~\/features\/([a-z0-9-]+)(\/[^"]*)?"/g,
    )) {
      if (m[1] === mod) continue; // próprio módulo
      const rel = file.split(sep).join("/");
      if (m[2]) violacoes.push(`${rel} → ~/features/${m[1]}${m[2]}`);
      else barrel.push(`${rel} → ~/features/${m[1]}`);
    }
  }
}

console.log(
  `check:isolation — ${violacoes.length} violação(ões) · ${barrel.length} import(s) de barrel (ok)`,
);

if (barrel.length) {
  console.log("\nBarrel público (permitido):");
  for (const b of barrel) console.log(`  ${b}`);
}

if (violacoes.length) {
  console.error("\nVIOLAÇÃO — import de internals de outro módulo:\n");
  for (const v of violacoes) console.error(`  ${v}`);
  console.error(
    "\nMova o compartilhado para ~/shared/, ~/lib/utils/ ou ~/components/shared/,\n" +
      "ou exponha pelo index.ts do módulo de origem. Ver ARCHITECTURE.md.",
  );
  process.exit(1);
}

console.log("\nNenhum módulo alcança internals de outro.");
