---
name: criar-modulo
description: >
  Cria estrutura completa de um novo módulo no ERP Odonto incluindo:
  module.ts, permissions.ts, types.ts, service.ts, React Query hooks, testes básicos,
  barrel exports, eventos da Central de Ações e configuração de Design System.
  Sistema é single-tenant (empresa_id foi removido do schema em 20260721000000_remove_empresa_id_all_tables.sql) — não injetar empresa_id. RLS é aberta (USING true). Roda build para confirmar.
  Trigger: "criar módulo", "novo módulo", "adicionar módulo"
---

# Criar Módulo — ERP Odonto

Cria estrutura completa e validada de um novo módulo.

## Pré-requisitos

- Nome do módulo em kebab-case (ex: `relatorios-avancados`)
- Nome display legível (ex: `Relatórios Avançados`)
- Tabela no Supabase (opcional — pode ser criada depois)

## Workflow

### Step 1: Validar nome

```
Formato: ^[a-z0-9-]+$
Check: não existe em src/features/
Check: não está em src/registry/modules.ts
```

### Step 2: Criar estrutura

```
src/features/<modulo>/
├── module.ts              # Definição do módulo
├── permissions.ts         # Permissões tipadas
├── types.ts               # Interfaces TypeScript
├── index.ts               # Barrel exports
├── services/
│   └── <entidade>.service.ts  # CRUD Supabase
├── hooks/
│   └── use<Entidade>.ts       # React Query hooks
├── __tests__/
│   └── <entidade>.test.ts     # Testes básicos
├── components/            # Componentes UI (preenchido depois)
├── pages/                 # Páginas (preenchido depois)
├── lib/                   # Utilitários
└── constants/             # Constantes
```

### Step 3: Gerar arquivos

#### 3.1 module.ts

```typescript
import { registerModule, registerNavItem, registerPermission, registerPermissionDefaults } from "~/registry";
import type { ModuleDefinition } from "~/registry";

export const {{MODULO_CAMEL}}Module: ModuleDefinition = {
  key: "{{MODULO_KEY}}",
  nome: "{{MODULO_NOME}}",
  descricao: "{{MODULO_DESCRICAO}}",
  icon: /* ícone Lucide */,
  routes: ["/{{MODULO_KEY}}"],
  permissions: [],
  ambientes: ["cadastro", "tecnologia"],
  abas: [
    { key: "geral", label: "Geral", descricao: "Configurações gerais" },
    { key: "permissoes", label: "Permissões", descricao: "Gerenciar permissões" },
    { key: "eventos", label: "Eventos", descricao: "Eventos e webhooks" },
  ],
  events: [
    {
      key: "{{MODULO_KEY}}.criado",
      label: "{{MODULO_NOME}} Criado",
      descricao: "Quando um novo registro é criado",
      type: "status_change",
    },
    {
      key: "{{MODULO_KEY}}.atualizado",
      label: "{{MODULO_NOME}} Atualizado",
      descricao: "Quando um registro é atualizado",
      type: "status_change",
    },
    {
      key: "{{MODULO_KEY}}.excluido",
      label: "{{MODULO_NOME}} Excluído",
      descricao: "Quando um registro é excluído",
      type: "status_change",
    },
  ],
  hasDesignConfig: true,
  designRoute: "/empresa/{{MODULO_KEY}}/design",
  setup: () => {
    // Registrar permissões
    for (const p of permissions) {
      registerPermission(p);
    }
    // Registrar nav items
    registerNavItem({ /* ... */ });
    // Registrar defaults
    registerPermissionDefaults("{{MODULO_KEY}}", { /* ... */ });
  },
};
```

#### 3.2 permissions.ts

```typescript
export interface Permissao {
  key: string;
  label: string;
  description: string;
  group: string;
}

export const {{MODULO_CAMEL}}Permissions: Permissao[] = [
  {
    key: "{{MODULO_KEY}}_ver",
    label: "Ver {{MODULO_NOME}}",
    description: "Visualizar registros",
    group: "{{MODULO_KEY}}",
  },
  {
    key: "{{MODULO_KEY}}_criar",
    label: "Criar {{MODULO_NOME}}",
    description: "Criar novos registros",
    group: "{{MODULO_KEY}}",
  },
  {
    key: "{{MODULO_KEY}}_editar",
    label: "Editar {{MODULO_NOME}}",
    description: "Editar registros existentes",
    group: "{{MODULO_KEY}}",
  },
  {
    key: "{{MODULO_KEY}}_excluir",
    label: "Excluir {{MODULO_NOME}}",
    description: "Excluir registros",
    group: "{{MODULO_KEY}}",
  },
];
```

#### 3.3 types.ts

```typescript
export interface {{MODULO_PASCAL}} {
  id: string;
  created_at: string;
  updated_at: string;
  // campos específicos
}

export interface Criar{{MODULO_PASCAL}}Input {
  // campos de criação
}

export interface Atualizar{{MODULO_PASCAL}}Input {
  id: string;
  // campos de atualização
}
```

#### 3.4 services/<entidade>.service.ts

```typescript
import { supabase } from "~/lib/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { {{MODULO_PASCAL}}, Criar{{MODULO_PASCAL}}Input, Atualizar{{MODULO_PASCAL}}Input } from "../types";

const TABELA = "{{TABELA}}";
const MODULO_KEY = "{{MODULO_KEY}}";

export const {{MODULO_CAMEL}}Service = {
  async listar(): Promise<{{MODULO_PASCAL}}[]> {
    const { data, error } = await supabase
      .from(TABELA)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async buscarPorId(id: string): Promise<{{MODULO_PASCAL}} | null> {
    const { data, error } = await supabase
      .from(TABELA)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async criar(input: Criar{{MODULO_PASCAL}}Input): Promise<{{MODULO_PASCAL}}> {
    const { data, error } = await supabase
      .from(TABELA)
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    dispararEventoModulo(MODULO_KEY, "{{MODULO_KEY}}.criado", { id: data.id }).catch(() => {});

    return data;
  },

  async atualizar(input: Atualizar{{MODULO_PASCAL}}Input): Promise<{{MODULO_PASCAL}}> {
    const { id, ...campos } = input;
    const { data, error } = await supabase
      .from(TABELA)
      .update(campos)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    dispararEventoModulo(MODULO_KEY, "{{MODULO_KEY}}.atualizado", { id }).catch(() => {});

    return data;
  },

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABELA)
      .delete()
      .eq("id", id);

    if (error) throw error;

    dispararEventoModulo(MODULO_KEY, "{{MODULO_KEY}}.excluido", { id }).catch(() => {});
  },
};
```

#### 3.5 hooks/use<Entidade>.ts

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { {{MODULO_CAMEL}}Service } from "../services/{{MODULO_KEY}}.service";
import type { Criar{{MODULO_PASCAL}}Input, Atualizar{{MODULO_PASCAL}}Input } from "../types";

export function use{{MODULO_PASCAL}}s() {
  return useQuery({
    queryKey: ["{{MODULO_KEY}}"],
    queryFn: () => {{MODULO_CAMEL}}Service.listar(),
  });
}

export function use{{MODULO_PASCAL}}(id: string) {
  return useQuery({
    queryKey: ["{{MODULO_KEY}}", id],
    queryFn: () => {{MODULO_CAMEL}}Service.buscarPorId(id),
    enabled: !!id,
  });
}

export function useCriar{{MODULO_PASCAL}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Criar{{MODULO_PASCAL}}Input) => {{MODULO_CAMEL}}Service.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{{MODULO_KEY}}"] });
    },
  });
}

export function useAtualizar{{MODULO_PASCAL}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Atualizar{{MODULO_PASCAL}}Input) => {{MODULO_CAMEL}}Service.atualizar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{{MODULO_KEY}}"] });
    },
  });
}

export function useExcluir{{MODULO_PASCAL}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {{MODULO_CAMEL}}Service.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{{MODULO_KEY}}"] });
    },
  });
}
```

#### 3.6 __tests__/<entidade>.test.ts

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { {{MODULO_CAMEL}}Service } from "../services/{{MODULO_KEY}}.service";

// Mock do Supabase
vi.mock("~/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe("{{MODULO_PASCAL}}Service", () => {
  it("deve listar registros", async () => {
    const result = await {{MODULO_CAMEL}}Service.listar();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve criar registro", async () => {
    const input = { /* campos obrigatórios */ };
    const result = await {{MODULO_CAMEL}}Service.criar(input);
    expect(result).toBeDefined();
  });
});
```

#### 3.7 index.ts (Barrel Exports)

```typescript
// Module
export { {{MODULO_CAMEL}}Module } from "./module";

// Types
export type { {{MODULO_PASCAL}}, Criar{{MODULO_PASCAL}}Input, Atualizar{{MODULO_PASCAL}}Input } from "./types";

// Services
export { {{MODULO_CAMEL}}Service } from "./services/{{MODULO_KEY}}.service";

// Hooks
export {
  use{{MODULO_PASCAL}}s,
  use{{MODULO_PASCAL}},
  useCriar{{MODULO_PASCAL}},
  useAtualizar{{MODULO_PASCAL}},
  useExcluir{{MODULO_PASCAL}},
} from "./hooks/use{{MODULO_PASCAL}}";

// Permissions
export { {{MODULO_CAMEL}}Permissions } from "./permissions";
```

### Step 4: Registrar módulo

- Adicionar em `src/registry/modules.ts`
- Chamar `registerModule({{MODULO_CAMEL}}Module)` no `main.tsx`

### Step 5: Criar rota protegida

```typescript
// src/routes/{{MODULO_KEY}}.tsx
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

export const {{MODULO_KEY}}Route = createRoute({
  getParentRoute: () => authLayout,
  path: "/{{MODULO_KEY}}",
  component: () => (
    <RequirePermission modulo="{{MODULO_KEY}}" permissions={["{{MODULO_KEY}}_ver"]}>
      <Pagina{{MODULO_PASCAL}} />
    </RequirePermission>
  ),
});
```

### Step 6: Criar Design System

- Executar skill `criar-design-modulo`
- Adicionar `hasDesignConfig: true, designRoute: "/empresa/{{MODULO_KEY}}/design"` ao module.ts

### Step 7: Validar

```bash
npm run build   # deve passar sem erros
npm run lint    # deve passar
```

### Step 8: Commit

```bash
git add src/features/<modulo>/ src/routes/<modulo>.tsx
git commit -m "feat(<modulo>): criar módulo <modulo>"
```

## Regras Obrigatórias

1. **Single-tenant** — não injetar empresa_id (removido em 20260721000000_remove_empresa_id_all_tables.sql). RLS é aberta (USING true)
2. **dispararEventoModulo(moduloKey, eventoKey, payload)** — 3 args, fire-and-forget com `.catch(() => {})`
3. **Eventos** — mínimo 3 por módulo (criado, atualizado, excluído)
4. **Permissões** — usar snake_case sem acentos
5. **Build** — sempre rodar npm run build antes de commitar
6. **RequirePermission** — toda rota autenticada deve usar

## Economia de Tokens

- **Lean-CTX:** Ler apenas arquivos necessários
- **Caveman:** Alterações cirúrgicas
- **Pre-flight:** Rodar build após cada alteração
