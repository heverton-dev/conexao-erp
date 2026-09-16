# Rotas e Permissões

## Rotas — 3 pontos de registro manual

`src/routeTree.gen.ts` **não é gerado**: não há plugin do TanStack Router no
`vite.config.ts`. A árvore é montada à mão. Criar rota exige tocar 3 arquivos:

1. `src/routes/<nome>.tsx` — nome do arquivo em `dot.case` espelhando o path
   (`_auth.crm.pipeline.tsx` → `/crm/pipeline`); prefixo `_auth.` = dentro do layout autenticado
2. `src/routeTree.gen.ts` — `import` da rota + entrada no `addChildren([...])` do pai
3. `module.ts` do módulo — adicionar o path em `routes[]`

Novo módulo também precisa de `registerModule(<modulo>Module)` em `src/main.tsx`.

Skill: `criar-rota`. Validação: `npm run check:guards`.

## Anatomia da rota

```tsx
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

export const crmPipelineRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/crm/pipeline",
  component: () => (
    <RequirePermission modulo="crm" permissions={["crm_pipeline"]}>
      <PipelinePage />
    </RequirePermission>
  ),
});

function PipelinePage() { /* ... */ }
```

Regras:

- A rota **só orquestra**: importa componentes de `~/features/<modulo>/components/`.
  Lógica de negócio não mora em `src/routes/`.
- `path` em kebab-case; params com `$` (`/crm/cliente/$id`).
- Rota pública (sem login) usa `getParentRoute: () => rootRoute`.

## Layout autenticado

`src/routes/_auth.tsx` (`authLayout`) faz, em ordem: loading → redireciona sem
usuário → chama `mod.setup()` de cada módulo ativo (super admin: todos) →
renderiza `AppLayout` + `OnboardingOverlay`.

Consequência: nav items e permissões de um módulo só existem depois desse passo.

## Guards — `~/components/guards`

| Guard | Uso |
| --- | --- |
| `RequirePermission` | padrão para toda rota de módulo (130 rotas) |
| `RequireSuperAdmin` | rotas `/global/*` (20 rotas) |
| `RequireEmpresaAdmin` | administração da empresa (3 rotas) |

`RequirePermission` aceita:

| Prop | Efeito |
| --- | --- |
| `permissions: string[]` | OR entre as chaves |
| `requireAll` | muda para AND |
| `modulo` | exige `modulosAcesso[modulo].acessar` |
| `paginas: string[]` | exige ao menos uma página do nav em `modulosAcesso[modulo].paginas` |
| `redirectTo` | fallback (default `/cadastros/dashboard`) |

`profile.is_super_admin` passa por qualquer guard.

## Permissões

Definidas em `src/features/<modulo>/permissions.ts` e registradas no `setup()`:

```ts
export const CRM_PERMISSIONS = [
  { key: "crm_pipeline", label: "Pipeline", description: "...", group: "CRM" },
];
```

Regras (`.agents/rules/permission-conflicts.yaml`):

- `snake_case`, prefixo do módulo (`crm_*`, `catalogo_*`, `hub_*`, `lk_*`, `lt_*`, `nps_*`)
- chave única em todo o registry
- `registerPermissionDefaults(moduloKey, { cadastro, consultor, tecnologia, suporte })`
  define o default por ambiente

Em UI, esconder ação sem permissão:

```tsx
const { permissoes } = useAuth();
{permissoes?.crm_transferencia && <Button>Transferir</Button>}
```

Hooks: `useCan`, `useCanAny`, `useCanAll` (`~/core/auth`).
Fonte canônica: `~/core/permissions` (re-exportado por `~/lib/permissoes`).
