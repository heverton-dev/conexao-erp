# UI — componentes e design

## Proibido / obrigatório

| ❌ Nunca | ✅ Sempre |
| --- | --- |
| `window.confirm()` | `AlertDialog` (`~/components/ui/alert-dialog`) para exclusão/confirmação destrutiva |
| `window.alert()` | `toast` (`sonner`) |
| `window.prompt()` | `Dialog` com form |
| CSS hex hardcoded | tokens do design system / classes semânticas Tailwind |

Hoje há **0 ocorrências** de `window.confirm/alert/prompt` em `src/`. Manter assim.

## Base de componentes

59 componentes shadcn/ui em `src/components/ui/` (kebab-case). Reutilize antes de criar.
Além dos padrões shadcn, existem: `page-header`, `empty-state`, `loading-state`,
`permission-badge`, `password-input`, `doc-viewer`, `tutoriais-popup`, `sidebar`, `chart`.

| Pasta | Conteúdo |
| --- | --- |
| `components/ui/` | primitivos genéricos (shadcn) |
| `components/shared/` | componentes usados por múltiplos módulos |
| `components/layout/` | `AppLayout`, navegação |
| `components/guards/` | ver [rotas-permissoes.md](rotas-permissoes.md) |
| `components/admin/`, `components/diagnostic/` | telas administrativas |
| `src/features/<modulo>/components/` | componentes do módulo — **PascalCase.tsx** |

## Dialog com scroll (obrigatório)

```tsx
<DialogContent className="flex flex-col max-h-[85vh] overflow-hidden">
  <DialogHeader>…</DialogHeader>
  <div className="overflow-y-auto flex-1 min-h-0">{/* corpo */}</div>
  <DialogFooter>…</DialogFooter>
</DialogContent>
```

Sem `min-h-0` no corpo o flex não encolhe e o scroll quebra. Skill: `gerar-modal`.

## Página padrão

`PageHeader` (título + breadcrumbs + ações) → conteúdo em `space-y-6` →
`Skeleton`/`loading-state` no carregamento → `empty-state` na lista vazia.
Skill: `gerar-pagina`.

## Design system — `src/design-system/`

```
tokens/      types.ts · resolver.ts (PRESETS, resolveTokens) · css-var-map.ts · presets/
provider/    DesignSystemProvider · ModuleDesignProvider · DesignSystemContext
hooks/       useDesignSystem · useModuleDesign · useDesignToken · useDesignEditor
services/    design-system.service · design-system.queries (persistência por empresa/módulo)
components/
```

Presets: `dark-blue`, `dark-emerald`, `dark-gold`, `light-clean`.
Tokens viram CSS vars via `tokensToCssVars` — no Tailwind use as classes semânticas
(`bg-background`, `text-muted-foreground`, `text-accent`), não cores literais.

Ler token em código:

```ts
const radius = useDesignToken("radius.md", "0.5rem");
```

Módulo com tela de design própria declara `hasDesignConfig: true` + `designRoute`
no `module.ts`. Skills: `criar-design-modulo`, `aplicar-design-modulo`, `design-frontend`.

Referência visual por módulo: `docs-projeto/docs-design-system/ds-<modulo>.md`.

## Responsividade

Mobile-first: escreva o layout base para telas pequenas e suba com `sm: md: lg:`.
Alvo mínimo 360px de largura; tabelas em container com `overflow-x-auto`.
Skill: `responsividade`. Docs: `docs-projeto/doc-responsividade/`.

## Storybook

Cobre apenas primitivos de `src/components/ui/` (`Badge`, `Button`, `Card`, `Dialog`,
`Input`, `PageHeader`). Não é obrigatório criar story para componente de módulo.
