#!/usr/bin/env node
/**
 * sync-docs.mjs — Mantém a documentação de agentes sincronizada com o código.
 *
 * O que faz:
 *   1. Preenche os blocos <!-- sync:X --> ... <!-- /sync:X --> em
 *      AGENTS.md, docs/agents/modulos.md e docs/agents/skills.md.
 *   2. Gera/atualiza src/features/<modulo>/AGENTS.md — bloco de fatos entre
 *      marcadores; o texto fora deles é preservado.
 *   3. Garante que CLAUDE.md / GEMINI.md (raiz, .gemini/ e por módulo) sejam
 *      apenas stubs de redirecionamento para o AGENTS.md correspondente.
 *
 * Texto fora dos marcadores é escrito à mão e NUNCA sobrescrito.
 *
 * Uso:
 *   node scripts/sync-docs.mjs           # aplica
 *   node scripts/sync-docs.mjs --check   # exit 1 se algo estiver desatualizado
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  statSync,
  mkdirSync,
} from "fs";
import { join, relative, dirname } from "path";

const ROOT = process.cwd();
const CHECK = process.argv.includes("--check");
const FEATURES = join(ROOT, "src", "features");

let outOfSync = false;

// ─── Utilidades ───────────────────────────────────────────────────────────────

/**
 * Lê normalizando CRLF -> LF. O git converte as pontas de linha no checkout
 * (`core.autocrlf`), e ler cru quebrava duas coisas: a comparação de
 * idempotência (todo arquivo aparecia como alterado) e o regex que preserva a
 * seção `## Notas` — que passava a não casar e reescrevia o placeholder,
 * apagando texto escrito à mão.
 */
function read(path) {
  return existsSync(path)
    ? readFileSync(path, "utf-8").replace(/\r\n/g, "\n")
    : null;
}

function emit(path, content) {
  const rel = relative(ROOT, path).replace(/\\/g, "/");
  const before = read(path);
  if (before === content) {
    if (!CHECK) console.log(`  ok   ${rel}`);
    return;
  }
  if (CHECK) {
    console.log(`OUTDATED: ${rel}`);
    outOfSync = true;
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
  console.log(`  ${before === null ? "new " : "upd "} ${rel}`);
}

/** Substitui o conteúdo entre <!-- sync:name --> e <!-- /sync:name -->. */
function fillBlock(source, name, body) {
  const re = new RegExp(
    `(<!-- sync:${name} -->)[\\s\\S]*?(<!-- /sync:${name} -->)`,
  );
  if (!re.test(source)) return source;
  return source.replace(re, `$1\n${body.trim()}\n$2`);
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const code = (f) => /\.(ts|tsx)$/.test(f);
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const list = (arr) => (arr.length ? arr.map((x) => `\`${x}\``).join(" · ") : "—");
const plural = (n, s) => `${n} ${s}${n === 1 ? "" : "s"}`;

/** Extrai o array literal que segue `key:` no topo de um objeto. */
function arrayLiteral(src, key) {
  const i = src.search(new RegExp(`\\n\\s{2}${key}:\\s*\\[`));
  if (i === -1) return null;
  const start = src.indexOf("[", i);
  let depth = 0;
  for (let j = start; j < src.length; j++) {
    if (src[j] === "[") depth++;
    else if (src[j] === "]" && --depth === 0) return src.slice(start, j + 1);
  }
  return null;
}

const strings = (lit) =>
  lit ? [...lit.matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
const objKeys = (lit) =>
  lit ? [...lit.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1]) : [];

// ─── Coleta ───────────────────────────────────────────────────────────────────

function parseModuleTs(file) {
  const s = readFileSync(file, "utf-8");
  const one = (re) => (s.match(re) || [])[1] || null;
  return {
    key: one(/\n\s{2}key:\s*"([^"]+)"/),
    nome: one(/\n\s{2}nome:\s*"([^"]+)"/),
    descricao: one(/\n\s{2}descricao:\s*\n?\s*"([^"]+)"/),
    routes: strings(arrayLiteral(s, "routes")),
    ambientes: strings(arrayLiteral(s, "ambientes")),
    abas: objKeys(arrayLiteral(s, "abas")),
    events: objKeys(arrayLiteral(s, "events")),
    flags: [...s.matchAll(/\n\s{2}(has[A-Za-z]+):\s*true/g)].map((m) => m[1]),
    designRoute: one(/\n\s{2}designRoute:\s*"([^"]+)"/),
    permissionsInline: strings(arrayLiteral(s, "permissions")),
  };
}

function parsePermissions(dir) {
  const f = join(dir, "permissions.ts");
  if (!existsSync(f)) return [];
  const s = readFileSync(f, "utf-8");
  const keys = [...s.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (keys.length) return keys;
  return [
    ...new Set(
      [...s.matchAll(/^\s{2}([a-z][a-z0-9_]*):\s*(?:true|false)/gm)].map(
        (m) => m[1],
      ),
    ),
  ];
}

function collectModule(name) {
  const dir = join(FEATURES, name);
  const files = walk(dir).filter(code);
  const rel = (p) => relative(dir, p).replace(/\\/g, "/");

  const tables = new Set();
  const rpcs = new Set();
  const cross = new Set();
  let dispatches = 0;

  for (const f of files) {
    const s = readFileSync(f, "utf-8");
    for (const m of s.matchAll(/\.from\(\s*"([a-z0-9_]+)"/g)) tables.add(m[1]);
    for (const m of s.matchAll(/\.rpc\(\s*"([a-z0-9_]+)"/g)) rpcs.add(m[1]);
    for (const m of s.matchAll(/from "~\/features\/([a-z0-9-]+)/g))
      if (m[1] !== name) cross.add(`${rel(f)} → ${m[1]}`);
    dispatches += (s.match(/dispararEventoModulo\(/g) || []).length;
  }

  // Superfície pública: funções/constantes exportadas na raiz do módulo
  const api = [];
  for (const f of ["index.ts", "index.tsx"]) {
    const p = join(dir, f);
    if (!existsSync(p)) continue;
    const s = readFileSync(p, "utf-8");
    for (const mm of s.matchAll(
      /export\s+(?:async\s+)?(?:function|const)\s+([A-Za-z_][A-Za-z0-9_]*)/g,
    ))
      api.push(mm[1]);
  }

  const modTs = join(dir, "module.ts");
  const def = existsSync(modTs) ? parseModuleTs(modTs) : null;
  const perms = parsePermissions(dir);

  const entries = readdirSync(dir, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  // submódulos: diretórios filhos que têm o próprio module.ts
  const submodules = dirs
    .filter((d) => existsSync(join(dir, d, "module.ts")))
    .map((d) => ({ dir: d, ...parseModuleTs(join(dir, d, "module.ts")) }));

  return {
    name,
    dir,
    def,
    permissions: perms.length ? perms : (def?.permissionsInline ?? []),
    api: [...new Set(api)],
    tables: [...tables].sort(),
    rpcs: [...rpcs].sort(),
    cross: [...cross],
    dispatches,
    dirs,
    counts: Object.fromEntries(
      dirs.map((d) => [d, walk(join(dir, d)).filter(code).length]),
    ),
    rootFiles: entries
      .filter((e) => e.isFile() && code(e.name))
      .map((e) => e.name)
      .sort(),
    fileCount: files.length,
    submodules,
    tipo: existsSync(modTs)
      ? submodules.length
        ? "meta-módulo"
        : "registrado"
      : "serviço",
  };
}

function collectSkills() {
  const dir = join(ROOT, ".agents", "skills");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const f = join(dir, name, "SKILL.md");
    if (!existsSync(f)) continue;
    const lines = readFileSync(f, "utf-8").split(/\r?\n/);
    const i = lines.findIndex((l) => /^description:/.test(l));
    let desc = "";
    if (i >= 0) {
      desc = lines[i].replace(/^description:\s*/, "").replace(/^[>|][-+]?$/, "");
      for (
        let j = i + 1;
        j < lines.length &&
        desc.length < 200 &&
        lines[j].trim() &&
        !/^[a-z_-]+:/.test(lines[j]) &&
        !/^---/.test(lines[j]);
        j++
      )
        desc += " " + lines[j].trim();
    }
    desc = desc.replace(/\s+/g, " ").replace(/["']/g, "").trim();

    // Sem description no frontmatter: usa o 1º parágrafo depois do título H1.
    if (!desc) {
      const body = lines.slice(lines.indexOf("---", 1) + 1);
      const h1 = body.findIndex((l) => /^#\s/.test(l));
      const from = h1 >= 0 ? h1 + 1 : 0;
      const para = [];
      for (let j = from; j < body.length; j++) {
        const t = body[j].trim();
        if (!t) {
          if (para.length) break;
          continue;
        }
        if (/^[#>|`\-*]/.test(t)) {
          if (para.length) break;
          continue;
        }
        para.push(t);
      }
      desc =
        para.join(" ").replace(/\s+/g, " ").replace(/["']/g, "").trim() ||
        (h1 >= 0 ? body[h1].replace(/^#\s*(Skill:\s*)?/, "").trim() : "");
    }

    // corta no bloco de disparo e na primeira frase
    desc = desc.split(/\s(?:DISPARO|Trigger|TRIGGER):/)[0];
    const dot = desc.indexOf(". ");
    if (dot > 40) desc = desc.slice(0, dot + 1);
    out.push({ name, desc: desc.slice(0, 160) });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Blocos gerados ───────────────────────────────────────────────────────────

function blocoModulos(mods) {
  const rows = mods.map((m) => {
    const d = m.def;
    const nums = d
      ? `${d.routes.length} · ${m.permissions.length} · ${d.events.length}`
      : "— · — · —";
    return `| [\`${m.name}\`](src/features/${m.name}/AGENTS.md) | ${m.tipo} | ${esc(d?.nome ?? "—")} | ${nums} |`;
  });
  return [
    "| Módulo | Tipo | Nome | Rotas · Perms · Eventos |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

function blocoModulosDocs(mods) {
  return blocoModulos(mods).replace(
    /\]\(src\/features\//g,
    "](../../src/features/",
  );
}

function blocoSkills(skills) {
  return [
    `${skills.length} skills em \`.agents/skills/\`.`,
    "",
    "| Skill | Para quê |",
    "| --- | --- |",
    ...skills.map((s) => `| \`${s.name}\` | ${esc(s.desc) || "—"} |`),
  ].join("\n");
}

// ─── AGENTS.md do módulo ──────────────────────────────────────────────────────

function moduloAgentsMd(m, existing) {
  const d = m.def;
  const L = [];

  L.push(`# AGENTS.md — \`${m.name}\``);
  L.push("");
  L.push(
    "**PT-BR. Sem greetings.** Regras globais em [AGENTS.md](../../../AGENTS.md) da raiz — " +
      "este arquivo cobre só o que é específico deste módulo.",
  );
  L.push("");
  L.push("<!-- sync:fatos -->");
  L.push("");

  if (d) {
    L.push(`**${d.nome}** — ${d.descricao || "sem descrição em `module.ts`"}`);
    L.push("");
    L.push(`Tipo: **${m.tipo}** · \`key: "${d.key}"\` · ${plural(m.fileCount, "arquivo")}`);
  } else {
    L.push(
      "**Módulo-serviço** — sem `module.ts`: não tem rotas, permissões nem eventos próprios. " +
        `Exporta tipos e funções Supabase por \`~/features/${m.name}\`, consumido por rotas e outros módulos.`,
    );
    L.push("");
    L.push(`Tipo: **serviço** · ${plural(m.fileCount, "arquivo")}`);
  }
  L.push("");

  // Estrutura
  L.push("## Estrutura");
  L.push("");
  L.push("```");
  L.push(`src/features/${m.name}/`);
  const tree = [
    ...m.rootFiles,
    ...m.dirs.map((dd) => `${dd}/  (${plural(m.counts[dd], "arquivo")})`),
  ];
  tree.forEach((line, i) =>
    L.push(`${i === tree.length - 1 ? "└──" : "├──"} ${line}`),
  );
  L.push("```");
  L.push("");

  if (!d && m.api.length) {
    L.push("## API pública");
    L.push("");
    L.push(list(m.api));
    L.push("");
  }

  if (d) {
    if (d.routes.length) {
      L.push("## Rotas");
      L.push("");
      L.push(list(d.routes));
      L.push("");
    }
    if (m.permissions.length) {
      L.push("## Permissões");
      L.push("");
      L.push(list(m.permissions));
      L.push("");
    }
    if (d.events.length) {
      L.push("## Eventos");
      L.push("");
      L.push(list(d.events));
      L.push("");
      L.push(
        `Disparos no código: ${m.dispatches}. Sempre \`dispararEventoModulo("${d.key}", <evento>, payload).catch(() => {})\`.`,
      );
      L.push("");
    }
    const meta = [];
    if (d.ambientes.length) meta.push(`Ambientes: ${list(d.ambientes)}`);
    if (d.abas.length) meta.push(`Abas de config: ${list(d.abas)}`);
    if (d.flags.length) meta.push(`Flags: ${list(d.flags)}`);
    if (d.designRoute) meta.push(`Rota de design: \`${d.designRoute}\``);
    if (meta.length) {
      L.push("## Registro");
      L.push("");
      for (const x of meta) L.push(`- ${x}`);
      L.push("");
    }
  }

  if (m.submodules.length) {
    L.push("## Submódulos");
    L.push("");
    L.push("| Diretório | key | Nome | Rotas | Eventos |");
    L.push("| --- | --- | --- | --- | --- |");
    for (const s of m.submodules) {
      L.push(
        `| \`${s.dir}/\` | \`${s.key}\` | ${esc(s.nome)} | ${list(s.routes)} | ${list(s.events)} |`,
      );
    }
    L.push("");
  }

  if (m.tables.length || m.rpcs.length) {
    L.push("## Tabelas e RPCs");
    L.push("");
    if (m.tables.length) L.push(`Tabelas: ${list(m.tables)}`);
    if (m.rpcs.length) {
      L.push("");
      L.push(`RPCs: ${list(m.rpcs)}`);
    }
    L.push("");
  }

  if (m.cross.length) {
    L.push("## ⚠ Imports cross-feature (violação a corrigir)");
    L.push("");
    for (const c of m.cross) L.push(`- \`${c}\``);
    L.push("");
  }

  L.push("<!-- /sync:fatos -->");

  const generated = L.join("\n");

  // Preserva a seção "## Notas" escrita à mão, se existir.
  const notas = existing?.match(/## Notas\r?\n[\s\S]*$/);
  return (
    generated +
    "\n\n" +
    (notas
      ? notas[0].replace(/\s+$/, "")
      : "## Notas\n\n_Regras de negócio e decisões específicas deste módulo. Escrito à mão — o `sync-docs` não sobrescreve._") +
    "\n"
  );
}

const STUB = (titulo, alvo) =>
  `# ${titulo} → AGENTS.md\n\nRedirecionamento. A fonte única de instruções deste projeto é \`${alvo}\`.\n\n@${alvo}\n`;

// ─── Main ─────────────────────────────────────────────────────────────────────

const moduleNames = readdirSync(FEATURES)
  .filter((f) => statSync(join(FEATURES, f)).isDirectory())
  .sort();

const mods = moduleNames.map(collectModule);
const skills = collectSkills();

console.log(
  CHECK ? "Verificando docs de agentes…" : "Sincronizando docs de agentes…",
);

// 1. Blocos nos arquivos escritos à mão
for (const [file, blocks] of [
  [join(ROOT, "AGENTS.md"), { modulos: blocoModulos(mods) }],
  [join(ROOT, "docs", "agents", "modulos.md"), { modulos: blocoModulosDocs(mods) }],
  [join(ROOT, "docs", "agents", "skills.md"), { skills: blocoSkills(skills) }],
]) {
  if (!existsSync(file)) {
    console.log(`AUSENTE: ${relative(ROOT, file)}`);
    outOfSync = true;
    continue;
  }
  let content = read(file);
  for (const [name, body] of Object.entries(blocks))
    content = fillBlock(content, name, body);
  emit(file, content);
}

// 2. Stubs de redirecionamento na raiz
emit(join(ROOT, "CLAUDE.md"), STUB("CLAUDE.md", "AGENTS.md"));
emit(join(ROOT, "GEMINI.md"), STUB("GEMINI.md", "AGENTS.md"));
if (existsSync(join(ROOT, ".gemini")))
  emit(join(ROOT, ".gemini", "GEMINI.md"), STUB("GEMINI.md", "../AGENTS.md"));

// 3. AGENTS.md + stubs por módulo
for (const m of mods) {
  const target = join(m.dir, "AGENTS.md");
  const existing = read(target);
  emit(target, moduloAgentsMd(m, existing));
  emit(join(m.dir, "CLAUDE.md"), STUB("CLAUDE.md", "AGENTS.md"));
  emit(join(m.dir, "GEMINI.md"), STUB("GEMINI.md", "AGENTS.md"));
}

if (CHECK) {
  console.log(outOfSync ? "\nDesatualizado." : "\nTudo sincronizado.");
  process.exit(outOfSync ? 1 : 0);
}
console.log(
  `\n${mods.length} módulos · ${skills.length} skills · ${mods.reduce((a, m) => a + (m.def?.routes.length ?? 0), 0)} rotas registradas`,
);
