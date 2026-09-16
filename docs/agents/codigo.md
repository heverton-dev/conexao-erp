# Padrões de código

## Nomenclatura (o que o repositório realmente usa)

| Item | Padrão | Exemplo |
| --- | --- | --- |
| Componente React | `PascalCase.tsx` | `KanbanAvancado.tsx`, `NovaVisitaModal.tsx` |
| Primitivo em `components/ui/` | `kebab-case.tsx` | `alert-dialog.tsx`, `page-header.tsx` |
| Service | `<dominio>.service.ts` | `despesas.service.ts` |
| Hook | `use<Dominio>.ts` | `useDespesas.ts`, `useCatalogoCliente.ts` |
| Arquivo de rota | `dot.case.tsx` | `_auth.crm.cliente.$id.tsx` |
| Diretório | `kebab-case` | `gerador-links`, `email-marketing` |
| Path de rota | `kebab-case` | `/mapas/distribuidores` |
| Chave de módulo / tabela / permissão | `snake_case` (módulo em kebab) | `crm_pipeline`, `catalogo_pedidos` |
| Evento | `entidade.acao` | `despesa.aprovada` |
| Teste | `<alvo>.test.ts` em `src/__tests__/` | `modules/crm/module.test.ts` |

Identificadores, comentários e strings de UI em **PT-BR**. Tipos e primitivos
seguem o vocabulário da lib (`useQuery`, `Props`, `children`).

## TypeScript

- `strict: true`. Não introduza `any` — se inevitável, comente o motivo.
- Tipos de linha do Supabase são escritos à mão em `types.ts` do módulo.
- `import type { … }` para imports só de tipo.
- `vite build` **não** type-checka: rode `npm run check:types`.

## Imports

Ordem: libs externas → `~/core`, `~/shared`, `~/lib`, `~/components`, `~/registry`
→ relativos do módulo (`../services/...`).

Regra de isolamento (`.agents/rules/module-autonomy.yaml`): módulo importa de
`~/core`, `~/shared`, `~/lib`, `~/components`, `~/registry` e do próprio módulo.
Nunca de internals de outro módulo. Barrel público (`~/features/<modulo>` →
`index.ts`) é o único ponto de consumo entre módulos. Detalhes:
[ARCHITECTURE.md](../../ARCHITECTURE.md).

```bash
npm run check:isolation                # audita imports entre módulos
```

## Erros

- Service: `if (error) throw error;` — propaga.
- Hook/componente: trata e mostra `toast.error(...)`. Nunca engolir erro em `catch {}` vazio.
- Exceção única: `dispararEventoModulo(...).catch(() => {})` (ver [eventos.md](eventos.md)).
- Erros de runtime vão para Sentry (`@sentry/react`).

## Estado

- Servidor → TanStack Query. Global de UI/sessão → Zustand (`~/core/store`:
  `auth-store`, `ui-store`). Local → `useState`.
- Nome de state explícito sobre o domínio (`tipoAtivo`, `clienteSelecionado`),
  não genérico (`value`, `item`).

## Testes

Vitest + Testing Library + MSW. Todos em `src/__tests__/`, espelhando o alvo:

```
src/__tests__/
├── modules/<modulo>/    module.test.ts · permissions.test.ts · services.test.ts
├── components/  a11y/  integrations/  single-tenant/  super-admin/  msw/
└── setup.ts
```

O teste padrão de módulo valida o contrato do `module.ts` (key, nome, icon,
`routes.length`, `permissions.length`, `ambientes`, flags) e o formato das
permissões. Ao criar módulo, replique esses três arquivos.

## Antes de commit / deploy

```bash
npm run check:types && npm run check:guards && npm run test && npm run build
```

Skill `pre-flight-check` faz isso e bloqueia em qualquer falha.
