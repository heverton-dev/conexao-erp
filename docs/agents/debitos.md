# Débitos e armadilhas conhecidas

> Mantido pela skill `rtk-memory`. **Não re-analise o que já está aqui** — leia,
> aplique e siga. Ao descobrir algo novo, registre aqui.

## Armadilhas (custam retrabalho se ignoradas)

- **`vite build` não type-checka.** Build verde não garante tipos. Sempre
  `npm run check:types`, principalmente ao mexer em tipagem dinâmica do Supabase.
- **`routeTree.gen.ts` é manual.** Não há plugin do TanStack Router. Rota nova não
  aparece se você esquecer o `import` + `addChildren` ali. Módulo novo não registra
  se esquecer `registerModule()` em `src/main.tsx`.
- **`dispararEventoModulo` tem 3 argumentos.** Nunca 4. Nunca `await`. Sempre
  `.catch(() => {})`.
- **`empresa_id` não é uniforme, e a migration mente.** 19 dos 71 `DROP COLUMN` da
  `20260721000000` foram no-op (nomes já renomeados antes). Grep na migration dá
  resposta errada — consulte `information_schema`. Ver
  [banco.md](banco.md) e A1 do [plano](plano-correcao-auditoria.md).
- **Cache do PostgREST.** Depois de alterar schema, `NOTIFY pgrst, 'reload schema';`
  senão o client acusa coluna inexistente.
- **State genérico em handler** gera bug silencioso. Use nome do domínio (`tipoAtivo`).
- **Cross-feature import** é proibido — mova o compartilhado para `~/shared/` ou
  `~/lib/utils/`.
- **CRLF em script que lê arquivo do repo.** O git converte as pontas de linha no
  checkout. Regex com `
` cru não casa com `

` — isso já apagou as seções
  `## Notas` dos 25 módulos uma vez. Normalize (`.replace(/

/g, "
")`) ao ler.

## 🔴 Drift banco × migrations (2026-08-03)

**39 migrations foram marcadas como aplicadas à mão, sem executar** (`-- pre-applied`
em 33, `-- Obsoleta: empresa_id ja removida` em 6). O ledger diz 159 aplicadas; o
schema discorda. Resultado: 12 migrations sem efeito, **52 tabelas que o código
consulta não existem**, e `empresa_id` presente em 83 tabelas.

Reconciliar tem 3 bloqueios verificados: a renomeação quebraria 6 funções que
referenciam tabela por nome (inclusive `executar_api_connector_server`);
`20260711000000` sobrescreveria preço de produto em produção; e não há PITR nem
backup. Evidência e ordem:
[drift-banco-vs-migrations.md](drift-banco-vs-migrations.md).

Bloqueia: a limpeza de `empresa_id` no código e qualquer deploy.

## Auditoria de 2026-08-03 — estado

Plano com evidência, ação e verificação por item:
[plano-correcao-auditoria.md](plano-correcao-auditoria.md).

| # | Item | Estado |
| --- | --- | --- |
| A1 | Migration single-tenant nunca aplicada (o diagnóstico por migration era otimista: no banco real a coluna existe em 83 tabelas, `NOT NULL`) | ⏳ **bloqueado** — fases 1/2a/2b escritas em `supabase/migrations-pendentes/`, fora do runner de deploy. Depende de reconciliar o banco primeiro |
| A2 | 2 rotas mortas (`<div>Route Removed</div>`) em `authLayout` | ✅ removidas de `src/routes/`, `routeTree.gen.ts` e `empresas/module.ts` |
| A3 | `check:guards` com 30 falsos positivos em 32 | ✅ checker reescrito (FALHA/AVISO/INFO, reconhece redirect-shim, guard herdado e árvore pública). Exit 0 com 0 falhas; validado com caso negativo |
| A3b | `hub.cliente.dashboard.$empresaId` — única das 17 rotas do hub em `rootRoute`, sem `useAuth` nem guard, renderizando `HubDashboardPage` | ✅ **corrigido** — movida para `authLayout` + `RequirePermission modulo="hub"` |
| A3c | `catalogo.checkout` — checkout público | ✅ auditado: exige `profile` + `clienteAtivo`/`catalogoCliente` antes de gravar. Allowlist com a evidência |
| A4 | Import cross-feature `catalogo` → `crm` | ✅ `ClientePickerModal` movido para `~/components/shared/`, 3 call sites atualizados. Zero cross-feature restante |
| A5 | Atalhos `.claude/*.lnk` para fora do repo | ✅ **todos os 6** estavam errados (5 → `PROJETOS/proj_erp`, 1 → `Cadastros-Conexao`). Recriados; `.claude/skills/` duplicado removido |
| A6 | `.claude/mcp.json` com caminho fora do repo | ✅ path relativo + `dist/` buildado; servidor sobe (falta só `SUPABASE_DB_URL`) |
| A7 | `npm run deploy:safe` quebrado | ✅ removido do `package.json` |
| A8 | `catalogo` com `context/` e `contexts/` | ✅ consolidado em `contexts/`. `styles/theme.css` **não** estava vazio — mantido |
| A9 | Eventos de `cadastros` "em 3 convenções com duplicata" | ✅ **era leitura errada** — são as 3 famílias intencionais (`entidade.acao`, `EVENTOS_STATUS_CHANGE`, `EVENTOS_BUTTON_ACTION`). `link.gerado` ≠ `link_gerado`. Documentado, nada a mudar |
| A10 | i18n "pela metade" | ✅ **era leitura errada** — i18n cobre a loja pública em 3 idiomas (143 chaves × pt-BR/en-US/es-ES), com `LanguageSplash` e admin de traduções. ERP interno é PT-BR por design. Não é débito |

## Baselines que já falham (não são regressão sua)

| Comando | Estado | Observação |
| --- | --- | --- |
| `npm run check:types` | ❌ 39 erros em 18 arquivos | Pré-existentes: `agentes/ProvedoresTab`, `catalogo/*Form`, `CartDrawer` (`Object.groupBy` exige `lib: es2024`), entre outros |
| `npm run test` | ❌ 7 estáveis + **flaky** | Estáveis e pré-existentes: `catalogo` (carrinho isolamento ×3, eventos, nav items, services) e `linktree/module.test.ts` (espera ≥3 rotas, módulo tem 2). **Além disso a suíte é instável**: 3 execuções seguidas sem nenhuma mudança de código deram 9, 10 e 9 falhas. Os extras vêm de `modules/catalogo/pages.test.tsx` (`StoreLayout`/`AdminLayout` "é importável"), que passa 26/26 quando rodado isolado — depende de ordem/paralelismo |
| `npm run build` | ✅ | |
| `npm run check:guards` | ✅ | após A3 |
| `npm run check:isolation` | ✅ | novo: 0 violações |
| `supabase-mcp-server` build | ⚠️ emite `dist/` com 3 erros TS | `setRequestHandler("tools/call", …)` com string onde o SDK espera schema, em `mcp-shadcn` e `mcp-tanstack` |

No pre-flight, compare com estes baselines em vez de exigir saída limpa.
