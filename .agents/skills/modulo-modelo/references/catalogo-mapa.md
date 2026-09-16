# Mapa do módulo Catálogo (modelo ouro)

Carregar sob demanda quando a skill `modulo-modelo` precisar de paths, tabelas, eventos ou exemplos concretos. Não inventar — copiar daqui ou abrir o arquivo real.

Raiz: `src/features/catalogo/`

## Árvore real (resumo)

```
catalogo/
├── module.ts                 # ModuleDefinition + setup() nav/perms
├── permissions.ts            # admin + cliente + colaborador
├── types/                    # cadastros, clientes, orcamentos, pedidos + index
├── schemas/                  # Zod por entidade (implantes, kits, …) + index
├── services/                 # 30+ arquivos por domínio
├── hooks/                    # useCatalogo.ts (principal) + variantes
├── components/
│   ├── admin/produtos/       # ProdutoFormModal multi-tipo + forms/
│   ├── design/               # editor design loja
│   └── …                     # loja, carrinho, tables, etc.
├── import/                   # pipeline CSV
│   ├── engine/               # parser, mapper, validator, executor
│   ├── hooks/                # useImportWizard, …
│   └── components/steps/     # wizard UI
├── context/ + contexts/      # cliente-ativo, language, empresa crud
├── lib/                      # compressImage, dbError
├── styles/theme.css
├── index.ts                  # barrel
├── AGENTS.md / CLAUDE.md
└── onboarding.tsx
```

## Arquivos âncora (abrir estes primeiro)

| Precisa de… | Abrir |
|---|---|
| Registro do módulo | `module.ts` |
| Permissões multi-camada | `permissions.ts` |
| Types + barrel | `types/index.ts` |
| Zod | `schemas/index.ts` + arquivo da entidade |
| Service CRUD + evento | `services/implantes.service.ts` |
| Hooks RQ + queryKey | `hooks/useCatalogo.ts` (topo: hierarquia) |
| Form multi-tipo | `components/admin/produtos/ProdutoFormModal.tsx` |
| Form single + composition | `components/admin/produtos/forms/ImplanteForm.tsx`, `CompositionSection.tsx` |
| Import CSV | `import/index.ts` + `import/engine/*` |
| Docs enxutas do módulo | `AGENTS.md` |

## module.ts — o que copiar

- `key: "catalogo"`
- `routes: string[]` (todas as rotas do módulo)
- `permissions: CATALOGO_PERMISSIONS.map(p => p.key)`
- `ambientes: ["cadastro", "tecnologia"]`
- `abas: geral | permissoes | eventos`
- `events: [{ key, label, descricao, type }]` — dezenas no catálogo; **mínimo 2** em módulo novo
- `hasDesignConfig: true` quando tiver design
- `setup()`:
  1. `registerPermission` loop
  2. `registerNavItem` com `permissionCheck`, `order`, `moduloKey`
  3. `registerPermissionDefaults(key, { cadastro, tecnologia, consultor, suporte })`

## permissions.ts — 3 camadas

1. `CATALOGO_PERMISSIONS` — admin ERP (`catalogo_gerenciar_*`, `catalogo_dashboard`, …)
2. `CATALOGO_CLIENTE_PERMISSIONS` — loja externa
3. `CATALOGO_COLABORADOR_PERMISSIONS` — ERP logado, carteira

Padrão de key: `<modulo>_<acao>` ou `<modulo>_<papel>_<acao>`, `as const`.

Módulo simples: uma lista basta. Multi-papel: espelhar as 3 camadas.

## services — padrão real

```ts
import { supabase } from "~/core/supabase"
import { dispararEventoModulo } from "~/core/services/webhooks"

const MODULO_KEY = "catalogo"

export async function criarX(input: ...): Promise<...> {
  const { data, error } = await supabase.from("catalogo_x").insert({ ...input }).select().single()
  if (error) throw error
  dispararEventoModulo(MODULO_KEY, "produto.criado", { id: data.id }).catch(() => {})
  return data
}
```

- Funções exportadas (não obrigatório objeto service monólito)
- 1 arquivo ≈ 1 domínio (`implantes.service.ts`, `kits.service.ts`)
- Joins aninhados no select quando hierarquia importa
- **Sem** `empresa_id`

## hooks — padrão real

```ts
export function useCategorias() {
  return useQuery({
    queryKey: ["catalogo", "categorias"],
    queryFn: () => hierarquia.listarCategorias(),
  })
}
```

- Namespace sempre `["catalogo", ...]`
- Mutations: optimistic opcional + `onError` toast + `onSettled` invalidate
- Hooks importam `* as domain from "../services/....service"`

## Form multi-tipo

- Modal orquestra `tipo` (`implante | abutment | kit | …`)
- Sub-forms em `forms/`
- Composições N:N via `CompositionSection` / `CompositionSectionWithToggle`
- Save: mutation do tipo + saves de pivots nos services

## Import CSV

Pipeline: `FileParser → ColumnMapper → RowValidator → Executor`  
Hooks: `useImportWizard`, `useFileParser`, `useColumnMapper`, `useRowValidator`, `useImportExecutor`  
Steps UI em `import/components/steps/`

## Eventos (amostra)

| Domínio | keys |
|---|---|
| Produto | `produto.criado`, `produto.atualizado`, `produto.removido` |
| Orçamento | `orcamento.criado`, `orcamento.enviado`, `orcamento.aprovado`, `orcamento.reprovado`, `orcamento.pedido_criado` |
| Pedido | `pedido.criado`, `pedido.pago`, `pedido.confirmado`, `pedido.enviado`, `pedido.entregue`, `pedido.cancelado` |
| Cliente | `cliente.credencial_criada` |
| Solicitação | `solicitacao_acesso.criada/aprovada/rejeitada` |

## Tabelas (prefixo `catalogo_`)

**Produtos:** implantes, abutments, kits, componentes, parafusos, cicatrizadores, chaves, fresas, complementares, opcionais  

**Comércio:** pedidos, pedido_itens, orcamentos, orcamento_itens, clientes, favoritos, cupons, promocionais  

**Estrutura:** categorias, ips_conexoes, ips_familias, ips_linhas  

**Pivots N:N:** implante_abutment, implante_chaves, kit_chaves, kit_fresas, …

## Hierarquia de domínio

```
Categoria → Conexão → Família → Linha → Implante
                                         ├→ Abutment
                                         ├→ Componente
                                         ├→ Parafuso → Chave
                                         └→ Cicatrizador
Kit → { Chaves, Fresas, Complementares, Opcionais } (N:M)
```

## UI rules (iguais ao repo)

- PROIBIDO: `window.confirm`, `window.alert`, `window.prompt`
- OBRIGATÓRIO: `AlertDialog` (delete) / `Dialog` (conteúdo)
- Dialog scroll: `DialogContent flex flex-col max-h-[85vh] overflow-hidden` + body `overflow-y-auto flex-1 min-h-0`
- Admin routes: `RequirePermission`

## Rotas (amostra)

| Path | Uso |
|---|---|
| `/catalogo` | loja |
| `/catalogo/admin/*` | painel |
| `/loja/$slug` | loja por slug |
| `/loja/$slug/orcamento/$token` | orçamento público |

## Economia de tokens (ao usar o mapa)

- Lean-CTX: assinatura antes de corpo
- Não ler `useCatalogo.ts` inteiro — grep da entidade
- Preferir arquivo de service da entidade a monólitos
