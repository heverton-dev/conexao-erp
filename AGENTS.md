# AGENTS.md — ERP Conexão

**PT-BR. Sem greetings. Direto ao ponto.** Este arquivo é a fonte única;
`CLAUDE.md` e `GEMINI.md` apenas redirecionam para cá.

## Como usar esta documentação

Leia **este arquivo sempre**. Os demais, só quando a tarefa exigir:

| Vai mexer em… | Leia |
| --- | --- |
| Um módulo específico | `src/features/<modulo>/AGENTS.md` |
| Estrutura, stack, comandos, env | [docs/agents/stack.md](docs/agents/stack.md) |
| Criar/alterar módulo | [docs/agents/modulos.md](docs/agents/modulos.md) · [ARCHITECTURE.md](ARCHITECTURE.md) |
| Rota, guard, permissão | [docs/agents/rotas-permissoes.md](docs/agents/rotas-permissoes.md) |
| Service, hook, API externa, form | [docs/agents/dados.md](docs/agents/dados.md) |
| Migration, RLS, schema | [docs/agents/banco.md](docs/agents/banco.md) |
| Tabela que "não existe", evento que não dispara | [docs/agents/drift-banco-vs-migrations.md](docs/agents/drift-banco-vs-migrations.md) |
| Componente, dialog, design system | [docs/agents/ui.md](docs/agents/ui.md) |
| Evento, webhook, notificação | [docs/agents/eventos.md](docs/agents/eventos.md) |
| Nomenclatura, TS, erros, testes | [docs/agents/codigo.md](docs/agents/codigo.md) |
| Skills, rules, specs, MCPs | [docs/agents/skills.md](docs/agents/skills.md) |
| Deploy | [docs/agents/deploy.md](docs/agents/deploy.md) |
| Bug estranho / armadilha conhecida | [docs/agents/debitos.md](docs/agents/debitos.md) |
| Economia de tokens e gastos | [docs/agents/tokens.md](docs/agents/tokens.md) |

## O projeto em 6 linhas

ERP single-tenant. React + Vite + TypeScript strict, TanStack Router/Query,
Supabase, Tailwind + shadcn/ui, Zustand. 25 módulos em `src/features/`,
198 arquivos de rota em `src/routes/` (132 paths declarados nos `module.ts`),
167 migrations em `supabase/migrations/`.
A empresa é fixa (`VITE_EMPRESA_ID`); RLS é aberta e a autorização acontece na
aplicação, por permissões. Módulos são ilhas: só se comunicam por dados
(`~/shared/`) e pelo barrel público de cada um.

## Invioláveis

1. **Isolamento de módulo** — nunca importar internals de outro módulo
   (`~/features/<outro>/components/...`). Só `~/core`, `~/shared`, `~/lib`,
   `~/components`, `~/registry`, o próprio módulo e o barrel `~/features/<outro>`.
2. **Sem `window.confirm/alert/prompt`** — use `AlertDialog`, `Dialog` ou `toast`.
3. **`empresa_id` está sendo eliminado, mas ainda não** — decisão de 2026-08-03:
   sem uso multi-tenant, em nenhuma tabela. Nunca em código novo (a empresa vem de
   `~/config/empresa`). **Não remova de código existente**: a coluna é `NOT NULL`
   no banco real e a remoção depende das migrations em
   `supabase/migrations-pendentes/`, que por sua vez dependem de reconciliar o
   banco. Ver [docs/agents/drift-banco-vs-migrations.md](docs/agents/drift-banco-vs-migrations.md).
4. **Eventos**: módulo registrado declara ≥2 eventos em `module.ts` e dispara com
   `dispararEventoModulo(moduloKey, eventoKey, payload)` — 3 args, sem `await`,
   sempre `.catch(() => {})`.
5. **Rota protegida** — `RequirePermission` (módulo) ou `RequireSuperAdmin`
   (`/global/*`). Registrar a rota nos 3 lugares: arquivo, `routeTree.gen.ts`, `module.ts`.
6. **Pre-flight antes de commit/deploy** — `npm run validate:all` (types + guards +
   isolation + testes) e `npm run build`. Build verde não prova tipos: Vite não
   type-checka. `check:types` e `test` **já falham hoje** por débito pré-existente e
   a suíte é instável — compare com o baseline em
   [docs/agents/debitos.md](docs/agents/debitos.md), não exija saída limpa.
7. **Deploy só quando o usuário pedir** "deploy" / "/deploy". Skill `deploy-vps`.
   ⚠ Hoje o deploy aplicaria 6+ migrations atrasadas de uma vez, incluindo a
   renomeação de 38 tabelas — ver o relatório de drift antes.

## Comandos

```bash
npm run dev            # dev server
npm run build          # build produção
npm run check:types    # tsc --noEmit
npm run check:guards   # guards de rota
npm run check:isolation # imports entre módulos
npm run validate:all   # pre-flight completo
npm run test           # vitest run
npm run lint           # ESLint
npm run format         # Prettier
```

Lista completa em [docs/agents/stack.md](docs/agents/stack.md).

## Método de trabalho

- Tarefa multi-step não trivial → skill `fable-method`.
- Tarefa unattended / subagents em paralelo → skill `fable-loop`.
- Antes de declarar pronto → skill `fable-judge`.
- Muitos erros de uma vez → `triagem-erros-massa` → `fix-squad-paralelo` →
  `auditoria-fix-adversarial`.
- Economize tokens conforme [docs/agents/tokens.md](docs/agents/tokens.md) e exiba
  `[💰 Ação: R$ X | Sessão: R$ Y]` ao final de cada ação.

## Manutenção destes arquivos

```bash
node scripts/sync-docs.mjs           # regenera índices e AGENTS.md dos módulos
node scripts/sync-docs.mjs --check   # falha se algo estiver desatualizado
```

O script só reescreve os blocos entre marcadores `<!-- sync:… -->`. Texto fora deles
é escrito à mão e preservado.

## Módulos

Cada módulo tem seu `AGENTS.md`. Leia o do módulo em que vai trabalhar — não os 25.

<!-- sync:modulos -->
| Módulo | Tipo | Nome | Rotas · Perms · Eventos |
| --- | --- | --- | --- |
| [`admin`](src/features/admin/AGENTS.md) | serviço | — | — · — · — |
| [`agentes`](src/features/agentes/AGENTS.md) | registrado | Agentes IA | 2 · 6 · 7 |
| [`api-connectors`](src/features/api-connectors/AGENTS.md) | serviço | — | — · — · — |
| [`cadastros`](src/features/cadastros/AGENTS.md) | registrado | Cadastros | 8 · 17 · 18 |
| [`catalogo`](src/features/catalogo/AGENTS.md) | registrado | Catálogo | 31 · 26 · 23 |
| [`clientes`](src/features/clientes/AGENTS.md) | serviço | — | — · — · — |
| [`credenciais`](src/features/credenciais/AGENTS.md) | serviço | — | — · — · — |
| [`crm`](src/features/crm/AGENTS.md) | registrado | CRM | 13 · 10 · 5 |
| [`dashboard`](src/features/dashboard/AGENTS.md) | serviço | — | — · — · — |
| [`demos`](src/features/demos/AGENTS.md) | serviço | — | — · — · — |
| [`despesas`](src/features/despesas/AGENTS.md) | registrado | Despesas em Rota | 4 · 8 · 7 |
| [`documentos`](src/features/documentos/AGENTS.md) | serviço | — | — · — · — |
| [`empresas`](src/features/empresas/AGENTS.md) | registrado | Empresa | 22 · 0 · 0 |
| [`funis`](src/features/funis/AGENTS.md) | registrado | Funis | 4 · 8 · 12 |
| [`gerador-links`](src/features/gerador-links/AGENTS.md) | registrado | Links | 9 · 6 · 3 |
| [`hub`](src/features/hub/AGENTS.md) | registrado | Hub | 18 · 27 · 8 |
| [`integracoes`](src/features/integracoes/AGENTS.md) | serviço | — | — · — · — |
| [`linktree`](src/features/linktree/AGENTS.md) | registrado | LinkTree | 2 · 13 · 3 |
| [`manutencao`](src/features/manutencao/AGENTS.md) | registrado | Manutenção | 2 · 0 · 2 |
| [`mapas`](src/features/mapas/AGENTS.md) | registrado | Mapas | 7 · 5 · 8 |
| [`marketing`](src/features/marketing/AGENTS.md) | meta-módulo | Marketing | 1 · 0 · 0 |
| [`nps`](src/features/nps/AGENTS.md) | registrado | NPS | 6 · 7 · 3 |
| [`precadastro`](src/features/precadastro/AGENTS.md) | serviço | — | — · — · — |
| [`revisoes`](src/features/revisoes/AGENTS.md) | serviço | — | — · — · — |
| [`rotas`](src/features/rotas/AGENTS.md) | registrado | Rotas de Visitas | 3 · 6 · 4 |
<!-- /sync:modulos -->

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANTE: este projeto tem um grafo de conhecimento do código. Use SEMPRE
as tools MCP do `code-review-graph` antes de gastar tokens desnecessários com
Grep/Glob/Read para explorar o código.** O grafo é mais rápido, mais barato
(menos tokens) e dá contexto estrutural (quem chama, quem depende, cobertura
de teste) que escanear arquivo por arquivo não dá.

Vale para **qualquer skill, subagente ou tool** invocado nesta sessão — não só
o loop principal. Ao delegar trabalho (Agent, Workflow, skills como
`explore-codebase`/`debug-issue`/`refactor-safely`/`review-changes`), a
instrução de preferir o grafo se aplica também a quem executa.

O grafo **se atualiza automaticamente**: hook `PostToolUse` (Edit/Write) roda
`code-review-graph update --skip-flows` a cada edição, e `SessionStart` roda
`status`. Nunca rode `build`/`update` manualmente — já está coberto.

### Quando usar o grafo primeiro

- **Explorar código**: `semantic_search_nodes_tool` ou `query_graph_tool` em vez de Grep
- **Entender impacto**: `get_impact_radius_tool` em vez de rastrear imports na mão
- **Code review**: `detect_changes_tool` + `get_review_context_tool` em vez de ler arquivos inteiros
- **Relações**: `query_graph_tool` com callers_of/callees_of/imports_of/tests_for
- **Arquitetura**: `get_architecture_overview_tool` + `list_communities_tool`

Só cair para Grep/Glob/Read quando o grafo **não** cobrir o que precisa.

### Tools principais

| Tool | Quando usar |
| ------ | ---------- |
| `detect_changes_tool` | Revisar mudanças de código — análise com score de risco |
| `get_review_context_tool` | Precisa de trechos de código para review — econômico em tokens |
| `get_impact_radius_tool` | Entender o raio de impacto de uma mudança |
| `get_affected_flows_tool` | Achar quais fluxos de execução são afetados |
| `query_graph_tool` | Rastrear chamadores, chamados, imports, testes, dependências |
| `semantic_search_nodes_tool` | Achar funções/classes por nome ou palavra-chave |
| `get_architecture_overview_tool` | Entender a estrutura de alto nível do código |
| `refactor_tool` | Planejar renomes, achar código morto |

### Fluxo

1. O grafo se atualiza automaticamente a cada edição (hooks) — nunca rode build manual.
2. Use `detect_changes_tool` para code review.
3. Use `get_affected_flows_tool` para entender impacto.
4. Use `query_graph_tool` pattern="tests_for" para checar cobertura.
