# Módulos

> Princípio: **módulos são ilhas, dados são a ponte.** Regras de import completas em
> [ARCHITECTURE.md](../../ARCHITECTURE.md).

Cada módulo tem seu próprio `src/features/<modulo>/AGENTS.md`. **Leia o do módulo antes de mexer nele** — não leia os 25.

## Os 3 tipos de módulo

| Tipo | Tem `module.ts` | Exemplos |
| --- | --- | --- |
| **Registrado** | sim | `catalogo`, `crm`, `hub`, `funis`, `nps`, `despesas`, `rotas`, `mapas`, `linktree`, `gerador-links`, `cadastros`, `agentes`, `empresas`, `manutencao` |
| **Meta-módulo** | sim, no pai e em cada submódulo | `marketing` (12 submódulos `mktg-*`) |
| **Serviço** | não — só `index.ts` com tipos + funções Supabase | `admin`, `api-connectors`, `clientes`, `credenciais`, `demos`, `documentos`, `integracoes`, `revisoes`, `dashboard`, `precadastro` |

Módulos-serviço não têm rotas, permissões nem eventos próprios: são consumidos por
rotas e por outros módulos via `~/features/<nome>` (barrel público — permitido).

## Anatomia de um módulo registrado

```
src/features/<modulo>/
├── module.ts        # OBRIGATÓRIO — registerModule() + registerNavItem() + defaults
├── permissions.ts   # OBRIGATÓRIO se tem rotas protegidas
├── types.ts         # tipos internos
├── index.ts         # barrel público (só o que outros podem consumir)
├── diagnostic.ts    # plano de diagnóstico (se hasDiagnostico)
├── onboarding.tsx   # passos de onboarding do módulo
├── components/      # PascalCase.tsx
├── hooks/           # useAlgo.ts (TanStack Query)
├── services/        # algo.service.ts (Supabase)
└── lib/ | utils/ | constants/ | schemas/ | contexts/   # opcionais
```

`pages/` só existe em `hub`. Não é padrão do projeto.

## `module.ts` — campos

```ts
export const meuModulo: ModuleDefinition = {
  key: "meu-modulo",          // kebab-case, único
  nome: "Meu Módulo",
  descricao: "...",
  icon: IconeLucide,
  routes: ["/meu-modulo", "/meu-modulo/$id"],   // paths reais registrados
  permissions: MEU_PERMISSIONS.map((p) => p.key),
  ambientes: ["cadastro", "consultor", "tecnologia", "suporte"],
  abas: [{ key: "geral", label: "Geral" }],     // abas na tela de config da empresa
  events: [...],                                // ver eventos.md — mínimo 2
  hasDiagnostico?, hasDesignConfig?, hasCredentialScopes?,
  hasFormulario?, hasLaboratorio?, hasCustomActions?, hasApiConnectors?,
  designRoute?: "/empresa/meu-modulo/design",
  setup: () => { /* registerPermission, registerNavItem, registerPermissionDefaults */ },
};
```

`registerModule` é idempotente (ignora chave duplicada) e chama `setup()` na hora.

## Checklist para criar módulo

Use a skill `criar-modulo`. Manualmente, a ordem é:

1. `module.ts` + `permissions.ts` + `types.ts`
2. `services/` → `hooks/` → `components/` (ver [dados.md](dados.md))
3. Migration das tabelas (ver [banco.md](banco.md))
4. Rotas em `src/routes/` com guard (ver [rotas-permissoes.md](rotas-permissoes.md))
5. `events[]` + disparos (ver [eventos.md](eventos.md))
6. `AGENTS.md` do módulo — `node scripts/sync-docs.mjs` gera o bloco de fatos
7. `npm run check:types && npm run check:guards && npm run test`

## Validação

```bash
npm run check:guards                                   # guards de rota
npm run check:isolation                                # imports entre módulos
node scripts/sync-docs.mjs --check                     # AGENTS.md sincronizados
```

Skills: `validar-modulo`, `documentar-modulo`, `responsividade`.

## Índice

<!-- sync:modulos -->
| Módulo | Tipo | Nome | Rotas · Perms · Eventos |
| --- | --- | --- | --- |
| [`admin`](../../src/features/admin/AGENTS.md) | serviço | — | — · — · — |
| [`agentes`](../../src/features/agentes/AGENTS.md) | registrado | Agentes IA | 2 · 6 · 7 |
| [`api-connectors`](../../src/features/api-connectors/AGENTS.md) | serviço | — | — · — · — |
| [`cadastros`](../../src/features/cadastros/AGENTS.md) | registrado | Cadastros | 8 · 17 · 18 |
| [`catalogo`](../../src/features/catalogo/AGENTS.md) | registrado | Catálogo | 31 · 26 · 23 |
| [`clientes`](../../src/features/clientes/AGENTS.md) | serviço | — | — · — · — |
| [`credenciais`](../../src/features/credenciais/AGENTS.md) | serviço | — | — · — · — |
| [`crm`](../../src/features/crm/AGENTS.md) | registrado | CRM | 13 · 10 · 5 |
| [`dashboard`](../../src/features/dashboard/AGENTS.md) | serviço | — | — · — · — |
| [`demos`](../../src/features/demos/AGENTS.md) | serviço | — | — · — · — |
| [`despesas`](../../src/features/despesas/AGENTS.md) | registrado | Despesas em Rota | 4 · 8 · 7 |
| [`documentos`](../../src/features/documentos/AGENTS.md) | serviço | — | — · — · — |
| [`empresas`](../../src/features/empresas/AGENTS.md) | registrado | Empresa | 22 · 0 · 0 |
| [`funis`](../../src/features/funis/AGENTS.md) | registrado | Funis | 4 · 8 · 12 |
| [`gerador-links`](../../src/features/gerador-links/AGENTS.md) | registrado | Links | 9 · 6 · 3 |
| [`hub`](../../src/features/hub/AGENTS.md) | registrado | Hub | 18 · 27 · 8 |
| [`integracoes`](../../src/features/integracoes/AGENTS.md) | serviço | — | — · — · — |
| [`linktree`](../../src/features/linktree/AGENTS.md) | registrado | LinkTree | 2 · 13 · 3 |
| [`manutencao`](../../src/features/manutencao/AGENTS.md) | registrado | Manutenção | 2 · 0 · 2 |
| [`mapas`](../../src/features/mapas/AGENTS.md) | registrado | Mapas | 7 · 5 · 8 |
| [`marketing`](../../src/features/marketing/AGENTS.md) | meta-módulo | Marketing | 1 · 0 · 0 |
| [`nps`](../../src/features/nps/AGENTS.md) | registrado | NPS | 6 · 7 · 3 |
| [`precadastro`](../../src/features/precadastro/AGENTS.md) | serviço | — | — · — · — |
| [`revisoes`](../../src/features/revisoes/AGENTS.md) | serviço | — | — · — · — |
| [`rotas`](../../src/features/rotas/AGENTS.md) | registrado | Rotas de Visitas | 3 · 6 · 4 |
<!-- /sync:modulos -->
