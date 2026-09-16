# Dados — services, hooks, APIs

Fluxo único: **componente → hook (TanStack Query) → service (Supabase) → tabela do módulo.**
Componente nunca chama `supabase` direto; hook nunca monta query SQL.

## Services — `services/<dominio>.service.ts`

```ts
import { supabase } from "~/core/supabase";
import { dispararEventoModulo } from "~/core/services/webhooks";
import type { Despesa, DespesaFiltros } from "../types";

const MODULO_KEY = "despesas";

export async function listarDespesas(filtros?: DespesaFiltros): Promise<Despesa[]> {
  let query = supabase
    .from("despesas")
    .select("*, tipo:despesas_tipos(*)")
    .order("data_despesa", { ascending: false });

  if (filtros?.status) query = query.eq("status", filtros.status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Despesa[];
}
```

Regras:

- Funções assíncronas nomeadas em PT-BR (`listar`, `buscar`, `criar`, `atualizar`,
  `excluir`/`deletar`, `aprovar`, `reprovar`). Não exportar classes nem objetos-service.
- Sempre `if (error) throw error;` — quem trata é o hook/UI, nunca `console.error` silencioso.
- Filtros opcionais aplicados condicionalmente sobre `query` (padrão acima).
- Joins via `select("*, rel:tabela(*)")`, nunca N+1 no hook.
- **Só tabelas do próprio módulo.** Dado de outro módulo entra por parâmetro/prop
  ou por `~/shared/`. Ver [ARCHITECTURE.md](../../ARCHITECTURE.md).
- Retorno tipado (`Promise<T[]>`), com `as T[]` no fim quando o Supabase perde o tipo.

Módulos-serviço (`clientes`, `documentos`, `credenciais`, …) põem tudo em `index.ts`,
sem pasta `services/`.

## Hooks — `hooks/use<Dominio>.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "~/core/auth";
import { listarDespesas, criarDespesa } from "../services/despesas.service";

export function useDespesas(filtros?: DespesaFiltros) {
  return useQuery({
    queryKey: ["despesas", filtros],
    queryFn: () => listarDespesas(filtros),
  });
}

export function useCriarDespesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: criarDespesa,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["despesas"] }),
  });
}
```

Regras:

- Um hook por operação; `use<Entidade>s` (lista), `use<Entidade>` (item),
  `useCriar/useAtualizar/useExcluir<Entidade>`.
- `queryKey` começa com o nome da entidade e inclui todo parâmetro que muda o resultado.
- Mutation invalida a key da lista no `onSuccess`. Toast é responsabilidade do componente.
- Hook só consome services do próprio módulo.

## Single-tenant

Não passe `empresaId` em código novo — a empresa é fixa:

```ts
import { EMPRESA_ID, EMPRESA_SLUG } from "~/config/empresa";
```

Hooks antigos ainda aceitam `overrideEmpresaId`. Não propague o padrão.
Detalhes e exceções em [banco.md](banco.md).

## APIs externas

| Integração | Entrada |
| --- | --- |
| Conectores HTTP configuráveis | `~/features/api-connectors` (`executeApiConnector`, RPC `executar_api_connector_server`) |
| CEP | `~/lib/viacep` / `buscarCepResiliente` (`~/features/integracoes`) |
| Evolution API (WhatsApp) | `testarConexaoEvolution` (`~/features/integracoes`) |
| Google Maps | skill `google-maps-platform` |
| Provedores de IA | `~/features/agentes` (`provedores_ia`) |
| Webhooks de saída | `~/core/services/webhooks` — ver [eventos.md](eventos.md) |

Chaves e segredos ficam em `credenciais` / `provedores_ia` / `.env` — nunca hardcoded.

## Formulários

React Hook Form + Zod (`@hookform/resolvers`). Schema Zod ao lado do componente
ou em `schemas/` (padrão do `catalogo`). Skills: `gerar-formulario`, `criar-form-multitipo`.
