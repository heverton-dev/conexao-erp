# Stack

## Runtime

| Camada | Tecnologia |
| --- | --- |
| Build | Vite + TypeScript (strict) |
| UI | React 18 + Tailwind + shadcn/ui (Radix) |
| Rotas | TanStack Router (file-based, `src/routes/`) |
| Dados | TanStack Query + Supabase JS |
| Estado global | Zustand (`src/core/store/`) |
| Forms | React Hook Form + Zod |
| Gráficos | Recharts · Mapas: `d3-geo` + Google Maps |
| Toast | `sonner` / `react-hot-toast` |
| Testes | Vitest + Testing Library + MSW |
| Docs UI | Storybook (apenas `src/components/ui/`) |
| Erros | Sentry (`@sentry/react`) |
| i18n | i18next (parcial — ~24 arquivos) |
| Deploy | Docker + nginx (ver [deploy.md](deploy.md)) |

## Alias

`~` → `src/`. Único alias. Sempre use `~/...` para imports fora do módulo atual.

## Comandos

```bash
npm run dev            # dev server
npm run build          # build produção
npm run preview        # preview do build
npm run check:types    # tsc --noEmit  (Vite NÃO type-checka)
npm run check:guards   # guards das rotas (FALHA/AVISO/INFO)
npm run check:isolation # imports entre módulos
npm run test           # vitest run
npm run test:watch     # vitest watch
npm run test:coverage  # coverage
npm run test:safe      # test com headroom-filter (output comprimido)
npm run lint           # ESLint
npm run format         # Prettier
npm run storybook      # Storybook :6006
npm run validate:all   # types + guards + isolation + testes
npm run db:status      # repo × schema_migrations: migrations pendentes
npm run db:verificar   # migrations "aplicadas" cujo efeito não existe no schema
npm run db:query       # SQL ad-hoc pela Management API (acesso de produção)
npm run audit:empresa-id # tabelas que ainda têm empresa_id
```

Deploy é pela skill `deploy-vps` — não há script npm para isso.

## Variáveis de ambiente

Obrigatórias em `.env` (ver `.env.example`) e como `ARG` no `Dockerfile`:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_EMPRESA_ID      # single-tenant: id fixo da empresa
VITE_EMPRESA_SLUG
```

Para as ferramentas de banco e o deploy, também:
`VITE_SUPABASE_SERVICE_ROLE`, `SUPABASE_ACCESS_TOKEN` (`sbp_…`),
`SUPABASE_DB_PASSWORD`, `DOCKER_HUB_USERNAME`, `DOCKER_HUB_PASSWORD`,
`VPS_IP`, `VPS_USER`, `VPS_PASSWORD`.

Use sempre `KEY=value` **sem espaços** em volta do `=`: o `source .env` do bash e
o parser da skill `deploy-vps` não leem `KEY = value`.

⚠ A skill `deploy-vps` documenta `DOCKER_HUB_USERNAME`/`DOCKER_HUB_PASSWORD`, mas o `.env` usa
`DOCKER_HUB_USERNAME`/`DOCKER_HUB_PASSWORD` (igual ao `.env.example`). Alinhar
antes do próximo deploy.

Lidas por `src/config/empresa.ts` → `EMPRESA_ID`, `EMPRESA_SLUG`.

## Estrutura de diretórios

```
src/
├── features/       # módulos de negócio (25) — ver modulos.md
├── routes/         # 198 rotas file-based
├── core/           # infra canônica: auth, permissions, supabase, services,
│                   # store, theme, i18n, router, empresa, diagnostic, monitoring
├── shared/         # dados entre módulos (empresas, form-schema)
├── components/     # ui/ (59 shadcn) · shared/ · layout/ · guards/ · admin/ · diagnostic/
├── design-system/  # tokens/, provider/, hooks/, services/, components/
├── registry/       # registerModule, nav items, permissões
├── config/         # empresa.ts (single-tenant)
├── lib/            # re-exports de core/ + utils/format.ts + helpers isolados
├── hooks/          # useDebounce, usePageTitle, useFavicon
└── __tests__/      # 53 testes (modules/, components/, a11y/, single-tenant/, msw/)

supabase/migrations/   # 167 migrations SQL
docs/agents/           # esta documentação
docs-projeto/          # documentação extensa por tema
.agents/               # skills, rules, specs, workflows, hooks, commands
scripts/               # utilitários Node/Python de manutenção
```

## `lib/` vs `core/`

`src/lib/auth.tsx`, `supabase.ts`, `utils.ts`, `webhooks.ts`, `permissoes.ts`,
`supabase-types.ts` são **apenas re-exports** de `~/core/*` (compatibilidade).

Em código novo importe de `~/core/...`. Exceções que só existem em `lib/`:
`~/lib/utils/format`, `~/lib/image-compress`, `~/lib/ocr`, `~/lib/viacep`,
`~/lib/themes`, `~/lib/task-meta`, `~/lib/sentiment`, `~/lib/sellerMetrics`.
