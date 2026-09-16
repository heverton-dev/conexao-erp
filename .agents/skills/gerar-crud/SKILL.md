---
name: gerar-crud
description: >
  Gera operações CRUD completas com React Query hooks, paginação, ordenação,
  filtros avançados, validação Zod, tratamento de erros e cache strategies.
  Sistema é single-tenant (empresa_id foi removido do schema, ver 20260721000000_remove_empresa_id_all_tables.sql) — não injetar empresa_id nas queries.
  Trigger: "gerar crud", "criar crud", "operações crud"
---

# Gerar CRUD — ERP Odonto

Gera service completo + hooks React Query com funcionalidades avançadas.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- Tabela deve existir no Supabase

## Workflow

### Step 1: Coletar informações

- **Módulo:** kebab-case (ex: `cadastros`)
- **Entidade:** PascalCase (ex: `Cadastro`)
- **Tabela:** snake_case no Supabase (ex: `cadastros`)
- **Campos:** lista de campos com tipos

### Step 2: Ler schema da tabela

```bash
# Via MCP Supabase
supabase_describe_table schema=public table=<tabela>
```

Mapear tipos PostgreSQL → TypeScript:

| PostgreSQL | TypeScript |
|------------|------------|
| uuid | string |
| text | string |
| varchar | string |
| integer | number |
| bigint | number |
| numeric | number |
| boolean | boolean |
| timestamptz | string |
| jsonb | Record<string, unknown> |
| enum | union type |

### Step 3: Gerar types.ts

```typescript
// src/features/<modulo>/types.ts

export interface {{MODULO_PASCAL}} {
  id: string;
  created_at: string;
  updated_at: string;
  // campos da tabela
}

export interface Criar{{MODULO_PASCAL}}Input {
  // campos de criação (sem id, timestamps)
}

export interface Atualizar{{MODULO_PASCAL}}Input {
  id: string;
  // campos de atualização (parcial)
}

export interface Filtros{{MODULO_PASCAL}} {
  busca?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  ordenarPor?: keyof {{MODULO_PASCAL}};
  direcao?: "asc" | "desc";
  pagina?: number;
  itensPorPagina?: number;
}

export interface PaginacaoResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  itensPorPagina: number;
  totalPaginas: number;
}
```

### Step 4: Gerar service.ts

```typescript
// src/features/<modulo>/services/<entidade>.service.ts

import { supabase } from "~/lib/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type {
  {{MODULO_PASCAL}},
  Criar{{MODULO_PASCAL}}Input,
  Atualizar{{MODULO_PASCAL}}Input,
  Filtros{{MODULO_PASCAL}},
  PaginacaoResponse,
} from "../types";

const TABELA = "{{TABELA}}";
const MODULO_KEY = "{{MODULO_KEY}}";

export const {{MODULO_CAMEL}}Service = {
  // ═══ LISTAR COM FILTROS E PAGINAÇÃO ═══
  async listar(
    filtros: Filtros{{MODULO_PASCAL}} = {}
  ): Promise<PaginacaoResponse<{{MODULO_PASCAL}}>> {
    const {
      busca,
      status,
      dataInicio,
      dataFim,
      ordenarPor = "created_at",
      direcao = "desc",
      pagina = 1,
      itensPorPagina = 20,
    } = filtros;

    let query = supabase
      .from(TABELA)
      .select("*", { count: "exact" });

    // Filtros
    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (dataInicio) {
      query = query.gte("created_at", dataInicio);
    }
    if (dataFim) {
      query = query.lte("created_at", dataFim);
    }

    // Ordenação
    query = query.order(ordenarPor, { ascending: direcao === "asc" });

    // Paginação
    const inicio = (pagina - 1) * itensPorPagina;
    query = query.range(inicio, inicio + itensPorPagina - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      pagina,
      itensPorPagina,
      totalPaginas: Math.ceil((count || 0) / itensPorPagina),
    };
  },

  // ═══ BUSCAR POR ID ═══
  async buscarPorId(id: string): Promise<{{MODULO_PASCAL}} | null> {
    const { data, error } = await supabase
      .from(TABELA)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // ═══ CRIAR ═══
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

  // ═══ ATUALIZAR ═══
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

  // ═══ EXCLUIR ═══
  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABELA)
      .delete()
      .eq("id", id);

    if (error) throw error;

    dispararEventoModulo(MODULO_KEY, "{{MODULO_KEY}}.excluido", { id }).catch(() => {});
  },

  // ═══ CONTAR ═══
  async contar(filtros: Filtros{{MODULO_PASCAL}} = {}): Promise<number> {
    let query = supabase
      .from(TABELA)
      .select("*", { count: "exact", head: true });

    if (filtros.status) {
      query = query.eq("status", filtros.status);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  },
};
```

### Step 5: Gerar hooks/use<Entidade>.ts

```typescript
// src/features/<modulo>/hooks/use<Entidade>.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { {{MODULO_CAMEL}}Service } from "../services/{{MODULO_KEY}}.service";
import type {
  Criar{{MODULO_PASCAL}}Input,
  Atualizar{{MODULO_PASCAL}}Input,
  Filtros{{MODULO_PASCAL}},
} from "../types";

const QUERY_KEY = "{{MODULO_KEY}}";

// ═══ LISTAR ═══
export function use{{MODULO_PASCAL}}s(filtros: Filtros{{MODULO_PASCAL}} = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, filtros],
    queryFn: () => {{MODULO_CAMEL}}Service.listar(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ═══ BUSCAR POR ID ═══
export function use{{MODULO_PASCAL}}(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => {{MODULO_CAMEL}}Service.buscarPorId(id),
    enabled: !!id,
  });
}

// ═══ CRIAR ═══
export function useCriar{{MODULO_PASCAL}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Criar{{MODULO_PASCAL}}Input) => {{MODULO_CAMEL}}Service.criar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ═══ ATUALIZAR ═══
export function useAtualizar{{MODULO_PASCAL}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Atualizar{{MODULO_PASCAL}}Input) => {{MODULO_CAMEL}}Service.atualizar(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ═══ EXCLUIR ═══
export function useExcluir{{MODULO_PASCAL}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {{MODULO_CAMEL}}Service.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ═══ CONTAR ═══
export function useContar{{MODULO_PASCAL}}s(filtros: Filtros{{MODULO_PASCAL}} = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, "count", filtros],
    queryFn: () => {{MODULO_CAMEL}}Service.contar(filtros),
  });
}
```

### Step 6: Validar

```bash
npm run build   # deve passar sem erros
npm run lint    # deve passar
```

### Step 7: Commit

```bash
git add src/features/<modulo>/services/ src/features/<modulo>/hooks/ src/features/<modulo>/types.ts
git commit -m "feat(<modulo>): gerar CRUD completo com paginação e filtros"
```

## Regras Obrigatórias

1. **Single-tenant** — não injetar empresa_id (removido do schema, RLS aberta)
2. **dispararEventoModulo(moduloKey, eventoKey, payload)** — 3 args, fire-and-forget com `.catch(() => {})`
3. **Ordenação padrão** — created_at desc
4. **Paginação** — padrão 20 itens por página
5. **Stale time** — 5 minutos para queries frequentes
6. **Invalidação** — sempre invalidar cache após mutações

## Economia de Tokens

- **Lean-CTX:** Ler apenas schema da tabela
- **Caveman:** Service e hooks são templates reutilizáveis
- **Pre-flight:** Rodar build após cada alteração
