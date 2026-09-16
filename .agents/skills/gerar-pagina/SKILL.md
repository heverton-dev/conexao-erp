---
name: gerar-pagina
description: >
  Gera página React completa com PageHeader, breadcrumbs automáticos,
  layout responsivo mobile-first, tokens do Design System, estados de
  loading (Skeleton), erro (ErrorState) e vazio (EmptyState).
  Inclui proteção de rota com RequirePermission e lazy loading.
  Trigger: "gerar página", "criar página", "nova página", "nova rota"
---

# Gerar Página — ERP Odonto

Gera página completa e validada com todos os padrões de UI.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- Nome da página e path da rota

## Workflow

### Step 1: Coletar informações

- **Nome:** PascalCase (ex: `PaginaRelatorios`)
- **Módulo:** kebab-case (ex: `relatorios`)
- **Path:** kebab-case (ex: `/relatorios/dashboard`)
- **Tipo:** `list` | `detail` | `form` | `dashboard`
- **Permissão:** chave de permissão (ex: `relatorios_ver`)

### Step 2: Gerar rota protegida

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

export const {{MODULO_KEY}}{{MODULO_PASCAL}}Route = createRoute({
  getParentRoute: () => authLayout,
  path: "/{{MODULO_KEY}}/{{SUBPATH}}",
  component: () => (
    <RequirePermission modulo="{{MODULO_KEY}}" permissions={["{{PERMISSAO}}"]}>
      <Pagina{{MODULO_PASCAL}} />
    </RequirePermission>
  ),
});
```

### Step 3: Gerar componente de página

```typescript
// src/features/<modulo>/pages/<Pagina>.tsx
import { useState } from "react";
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

  // ═══ BREADCRUMBS ═══
  const breadcrumbs = [
    { label: "Início", href: "/" },
    { label: "{{MODULO_NOME}}", href: "/{{MODULO_KEY}}" },
    { label: "{{SUBPATH_NOME}}" },
  ];

  // ═══ LOADING STATE ═══
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="{{MODULO_NOME}}"
          description="{{DESCRICAO}}"
          breadcrumbs={breadcrumbs}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ═══ ERROR STATE ═══
  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="{{MODULO_NOME}}"
          description="{{DESCRICAO}}"
          breadcrumbs={breadcrumbs}
        />
        <EmptyState
          icon={<AlertCircle className="w-10 h-10 text-destructive" />}
          title="Erro ao carregar"
          description="Ocorreu um erro ao carregar os dados. Tente novamente."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          }
        />
      </div>
    );
  }

  // ═══ EMPTY STATE ═══
  if (!itens || itens.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="{{MODULO_NOME}}"
          description="{{DESCRICAO}}"
          breadcrumbs={breadcrumbs}
          actions={
            <Button>
              <Plus size={16} /> Novo
            </Button>
          }
        />
        <EmptyState
          icon={<Icone className="w-10 h-10 text-text-muted/30" />}
          title="Nenhum registro"
          description="Comece criando o primeiro registro."
          action={
            <Button>
              <Plus size={16} /> Criar primeiro
            </Button>
          }
        />
      </div>
    );
  }

  // ═══ CONTENT ═══
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="{{MODULO_NOME}}"
        description="{{DESCRICAO}}"
        breadcrumbs={breadcrumbs}
        actions={
          <Button>
            <Plus size={16} /> Novo
          </Button>
        }
      />

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itens.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-4 rounded-xl bg-surface border border-border p-4 transition-all duration-200 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5"
          >
            {/* Conteúdo do card */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 4: Validar

```bash
npm run build   # deve passar sem erros
npm run lint    # deve passar
```

### Step 5: Commit

```bash
git add src/routes/<modulo>.<subpath>.tsx src/features/<modulo>/pages/<Pagina>.tsx
git commit -m "feat(<modulo>): criar página <Pagina>"
```

## Padrões de Layout

### Grid Responsivo

```tsx
// Mobile: 1 coluna → Tablet: 2 → Desktop: 3
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Mobile: 1 → Tablet: 2 → Desktop: 4
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

### Header Responsivo

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-text-main tracking-tight">Título</h1>
    <p className="text-sm text-text-muted mt-1">Descrição</p>
  </div>
  <Button>Ação</Button>
</div>
```

## Regras Obrigatórias

1. **RequirePermission** — toda rota autenticada deve usar
2. **Lazy loading** — página deve ser carregada sob demanda
3. **Skeleton** — loading state com Skeleton, não Loader2
4. **EmptyState** — estado vazio com CTA
5. **ErrorState** — erro com botão de retry
6. **Breadcrumbs** — sempre incluir navegação
7. **Mobile-first** — grids começam em 1 coluna
8. **Touch targets** — botões com min-h-[44px]

## Economia de Tokens

- **Lean-CTX:** Ler apenas hooks do módulo
- **Caveman:** Template reutilizável
- **Pre-flight:** Rodar build após cada alteração
