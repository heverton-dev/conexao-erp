---
name: criar-rota
description: >
  Cria rota protegida no ERP Odonto com RequirePermission, breadcrumbs,
  lazy loading e validação de path. Trigger: "criar rota", "nova rota", "adicionar rota"
---

# Criar Rota — ERP Odonto

Cria rota completa e protegida com todos os padrões.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- Path em kebab-case
- Permissão de acesso

## Workflow

### Step 1: Validar path

```
Formato: ^/[a-z0-9-]+(/[a-z0-9-]+)*$
Exemplo: /cadastros/nova-rota

Check: não existe em src/routes/
Check: não está registrado no routeTree
```

### Step 2: Criar componente de página

```typescript
// src/features/<modulo>/pages/<Pagina>.tsx
import { PageHeader } from "~/components/ui/page-header";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { Button } from "~/components/ui/button";
import { use{{MODULO_PASCAL}}s } from "../hooks/use{{MODULO_PASCAL}}";
import { useEmpresa } from "~/hooks/useEmpresa";
import { AlertCircle, Plus } from "lucide-react";

export function {{MODULO_PASCAL}}() {
  const { empresa } = useEmpresa();
  const { data: itens, isLoading, error } = use{{MODULO_PASCAL}}s(empresa?.id || "");

  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "{{MODULO_NOME}}", href: "/{{MODULO_KEY}}" },
    { label: "{{SUBPATH_NOME}}" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader title="{{MODULO_NOME}}" breadcrumbs={breadcrumbs} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader title="{{MODULO_NOME}}" breadcrumbs={breadcrumbs} />
        <EmptyState
          icon={<AlertCircle className="w-10 h-10 text-destructive" />}
          title="Erro ao carregar"
          description="Tente novamente."
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      </div>
    );
  }

  if (!itens || itens.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="{{MODULO_NOME}}"
          breadcrumbs={breadcrumbs}
          actions={<Button><Plus size={16} /> Novo</Button>}
        />
        <EmptyState
          title="Nenhum registro"
          description="Comece criando o primeiro registro."
          action={<Button><Plus size={16} /> Criar</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="{{MODULO_NOME}}"
        breadcrumbs={breadcrumbs}
        actions={<Button><Plus size={16} /> Novo</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itens.map((item) => (
          <div key={item.id} className="group flex items-center gap-4 rounded-xl bg-surface border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5">
            {/* Conteúdo */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 3: Criar rota protegida

```typescript
// src/routes/<modulo>.<subpath>.tsx
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";
import { lazy } from "react";

const Pagina{{MODULO_PASCAL}} = lazy(() =>
  import("~/features/{{MODULO_KEY}}/pages/{{MODULO_PASCAL}}").then((m) => ({
    default: m.{{MODULO_PASCAL}},
  }))
);

export const {{MODULO_KEY}}{{SUBPATH}}Route = createRoute({
  getParentRoute: () => authLayout,
  path: "/{{MODULO_KEY}}/{{SUBPATH}}",
  component: () => (
    <RequirePermission modulo="{{MODULO_KEY}}" permissions={["{{PERMISSAO}}"]}>
      <Pagina{{MODULO_PASCAL}} />
    </RequirePermission>
  ),
});
```

### Step 4: Registrar no module.ts

```typescript
// src/features/<modulo>/module.ts
export const {{MODULO_CAMEL}}Module: ModuleDefinition = {
  // ...
  routes: [
    // ... rotas existentes
    "/{{MODULO_KEY}}/{{SUBPATH}}",
  ],
};
```

### Step 5: Validar

```bash
npm run build   # deve passar sem erros
```

### Step 6: Commit

```bash
git add src/routes/<modulo>.<subpath>.tsx src/features/<modulo>/pages/<Pagina>.tsx
git commit -m "feat(<modulo>): criar rota <subpath>"
```

## Regras Obrigatórias

1. **RequirePermission** — toda rota autenticada deve usar
2. **Lazy loading** — página deve ser carregada sob demanda
3. **Breadcrumbs** — sempre incluir navegação
4. **Loading state** — Skeleton, não Loader2
5. **Empty state** — EmptyState com CTA
6. **Error state** — ErrorState com retry
7. **Mobile-first** — grids começam em 1 coluna

## Economia de Tokens

- **Lean-CTX:** Template reutilizável
- **Caveman:** Apenas paths diferentes
- **Pre-flight:** Rodar build após cada alteração
