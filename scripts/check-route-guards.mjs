#!/usr/bin/env node
/**
 * check:guards — garante que toda rota da árvore autenticada esteja protegida
 * por `RequirePermission`, `RequireSuperAdmin` ou `RequireEmpresaAdmin`.
 *
 * Uso: `npm run check:guards`
 *
 * O relatório tem 3 blocos e SÓ o primeiro define o exit code:
 *
 *   FALHA — rota em `authLayout`, com componente, sem guard próprio nem herdado
 *   AVISO — rota pública (`rootRoute`) fora da allowlist: confirmar se é intencional
 *   INFO  — redirect-shims e rotas que herdam o guard do pai (nada a fazer)
 *
 * Padrões reconhecidos (antes desta versão, os 3 viravam falso positivo):
 *   1. redirect-shim — `beforeLoad` com `throw redirect(...)` e sem `component`.
 *      Não há UI para proteger; o guard mora na rota destino.
 *   2. guard herdado — o pai envolve `<Outlet/>` com um guard, então os filhos
 *      já estão protegidos. Resolvido seguindo `getParentRoute` recursivamente.
 *   3. árvore pública — `getParentRoute: () => rootRoute` é, por construção,
 *      fora da sessão do ERP (vitrine, loja, survey, encurtador).
 *
 * A checagem é textual, não AST: um arquivo que apenas *importa* um guard sem
 * envolver o componente passa como ok. Falso negativo aceito — revisão de PR
 * continua necessária.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROUTES_DIR = join(process.cwd(), "src", "routes");

const GUARD_NAMES = [
  "RequirePermission",
  "RequireSuperAdmin",
  "RequireEmpresaAdmin",
];

/**
 * Rotas que legitimamente não usam guard do ERP. Cada entrada precisa de um
 * motivo — não adicionar aqui só para silenciar o script.
 *
 * Convenção para a loja/catálogo público: a autenticação é a sessão de cliente
 * final, não `profile`/`permissoes` do ERP.
 */
const ALLOWLIST = {
  "index.tsx": "tela de login, pública por definição",
  "pre-cadastro.$token.tsx":
    "acessada por link público enviado ao lead, sem sessão autenticada",
  "__root.tsx": "root layout do router, não é uma rota navegável",
  "_auth.tsx":
    "layout pai das rotas autenticadas — o guard fica nas rotas filhas, não aqui",
  "funis.tsx": "shell de layout/redirect do módulo funis, sem UI própria",
  "mapas.tsx": "shell de layout/redirect do módulo mapas, sem UI própria",
  "nps.tsx": "shell de layout/redirect do módulo nps, sem UI própria",
  "e.$slug.tsx": "redirecionador de link curto público (encurtador de URL)",
  "r.$linkId.tsx": "redirecionador de link curto público (encurtador de URL)",
  "crm.aceitar-convite.$token.tsx":
    "aceite de convite via token público, antes de existir sessão",

  // ── Catálogo / loja pública ──────────────────────────────────────────────
  "catalogo.index.tsx": "landing pública do catálogo (vitrine, sem login)",
  "catalogo.busca.tsx": "busca da vitrine pública",
  "catalogo.implantes.tsx": "listagem da vitrine pública",
  "catalogo.componentes.tsx": "listagem da vitrine pública",
  "catalogo.kits.tsx": "listagem da vitrine pública",
  "catalogo.promocionais.tsx": "listagem da vitrine pública",
  "catalogo.produto.$tipo.$sku.tsx": "detalhe de produto da vitrine pública",
  "catalogo.empresa.$slug.tsx": "vitrine pública por empresa",
  "catalogo.carrinho.tsx":
    "carrinho da loja pública, estado é da sessão de cliente (não profile/permissoes do ERP)",
  "catalogo.checkout.tsx":
    "checkout da loja pública — AUDITADO 2026-08-03: finalizarPedido exige profile e clienteAtivo (consultor) ou catalogoCliente antes de gravar",
  "catalogo.teste.$token.tsx":
    "acesso via token de link de teste compartilhado, sem login",
  "catalogo-loja.$slug.index.tsx":
    "loja pública do catálogo por empresa (cliente final, sem login interno)",
  "catalogo-loja.$slug.login.tsx":
    "tela de login do cliente final da loja — pública por definição",
  "catalogo-loja.$slug.favoritos.tsx":
    "favoritos da loja pública, autenticação é via sessão de cliente (não profile/permissoes do ERP)",
  "catalogo-loja.$slug.orcamento.$token.tsx":
    "acesso via token compartilhado com o cliente final, sem login",
  "catalogo-loja.$slug.pedidos.tsx":
    "pedidos da loja pública, autenticação é via sessão de cliente (não profile/permissoes do ERP)",
  "catalogo-loja.$slug.pedidos.$id.tsx":
    "detalhe de pedido da loja pública, autenticação é via sessão de cliente (não profile/permissoes do ERP)",

  // ── Outras rotas públicas por design ─────────────────────────────────────
  "nps.survey.tsx":
    "pesquisa respondida pelo destinatário via link público, sem sessão",
  "linktree.$id.tsx": "cartão digital público do colaborador",
};

/**
 * Rotas públicas que precisam de auditoria de autorização própria (a proteção
 * não é guard do ERP, é validação de sessão de cliente / de token dentro da
 * página). Enquanto estiverem aqui, saem como AVISO e não como FALHA.
 */
const AUDITAR = {
};

function listRouteFiles() {
  return readdirSync(ROUTES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .sort();
}

const hasGuard = (c) => GUARD_NAMES.some((n) => c.includes(n));

/** redirect-shim: só redireciona, não renderiza nada. */
const isRedirectShim = (c) =>
  /throw\s+redirect\s*\(/.test(c) && !/\bcomponent\s*:/.test(c);

/** Nome do symbol da rota pai, se houver. */
const parentSymbol = (c) =>
  (c.match(/getParentRoute:\s*\(\)\s*=>\s*(\w+)/) || [])[1] ?? null;

/** Mapa symbol exportado -> arquivo, para resolver a cadeia de pais. */
function buildSymbolIndex(files, contents) {
  const idx = new Map();
  for (const f of files) {
    for (const m of contents
      .get(f)
      .matchAll(/export const (\w+)\s*=\s*createRoute\(/g))
      idx.set(m[1], f);
  }
  return idx;
}

/** Sobe a cadeia de pais procurando um guard. */
function inheritsGuard(file, contents, symbolIndex, seen = new Set()) {
  if (seen.has(file)) return false;
  seen.add(file);
  const parent = parentSymbol(contents.get(file) ?? "");
  if (!parent) return false;
  const parentFile = symbolIndex.get(parent);
  if (!parentFile || !contents.has(parentFile)) return false;
  if (hasGuard(contents.get(parentFile))) return true;
  return inheritsGuard(parentFile, contents, symbolIndex, seen);
}

/** Raiz da cadeia: "rootRoute" (árvore pública) ou "authLayout". */
function treeRoot(file, contents, symbolIndex, seen = new Set()) {
  if (seen.has(file)) return null;
  seen.add(file);
  const parent = parentSymbol(contents.get(file) ?? "");
  if (!parent) return null;
  if (parent === "rootRoute" || parent === "authLayout") return parent;
  const parentFile = symbolIndex.get(parent);
  if (!parentFile) return parent;
  return treeRoot(parentFile, contents, symbolIndex, seen);
}

function main() {
  const files = listRouteFiles();
  const contents = new Map(
    files.map((f) => [f, readFileSync(join(ROUTES_DIR, f), "utf8")]),
  );
  const symbolIndex = buildSymbolIndex(files, contents);

  const falhas = [];
  const avisos = [];
  const info = [];

  for (const file of files) {
    const c = contents.get(file);

    if (hasGuard(c)) continue;

    if (isRedirectShim(c)) {
      info.push([file, "redirect-shim — guard está na rota destino"]);
      continue;
    }
    if (inheritsGuard(file, contents, symbolIndex)) {
      info.push([file, "herda o guard da rota pai"]);
      continue;
    }
    if (AUDITAR[file]) {
      avisos.push([file, AUDITAR[file]]);
      continue;
    }
    if (ALLOWLIST[file]) continue;

    const raiz = treeRoot(file, contents, symbolIndex);
    if (raiz === "rootRoute") {
      avisos.push([
        file,
        "rota pública (rootRoute) fora da allowlist — confirmar se é intencional",
      ]);
      continue;
    }
    falhas.push(file);
  }

  console.log(
    `check:guards — ${files.length} rotas · ${Object.keys(ALLOWLIST).length} na allowlist · ` +
      `${falhas.length} falha(s) · ${avisos.length} aviso(s) · ${info.length} info`,
  );

  if (info.length) {
    console.log(`\nINFO (nada a fazer):`);
    for (const [f, m] of info) console.log(`  - ${f}: ${m}`);
  }

  if (avisos.length) {
    console.log(`\nAVISO (revisar, não bloqueia):`);
    for (const [f, m] of avisos) console.log(`  - ${f}: ${m}`);
  }

  if (falhas.length) {
    console.error(
      `\nFALHA — ${falhas.length} rota(s) autenticada(s) com componente e sem guard próprio nem herdado:\n`,
    );
    for (const f of falhas) console.error(`  - ${f}`);
    console.error(
      "\nEnvolva o componente com RequirePermission/RequireSuperAdmin/RequireEmpresaAdmin,\n" +
        "ou — se for exceção legítima — adicione à ALLOWLIST em scripts/check-route-guards.mjs com o motivo.",
    );
    process.exit(1);
  }

  console.log("\nNenhuma rota autenticada desprotegida.");
}

main();
