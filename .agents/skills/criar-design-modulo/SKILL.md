---
name: criar-design-modulo
description: Cria a estrutura de configuração de Design System para um módulo existente do ERP Odonto — gera rota /modulo/design e registra hasDesignConfig no module.ts. Inclui padrões de UI/UX baseados no módulo cadastros.
triggers:
  - "criar design do módulo"
  - "adicionar design ao módulo"
  - "configurar design do módulo"
  - "design system módulo"
---

# Skill: criar-design-modulo

## Pré-requisitos
- Módulo deve existir em `src/features/<modulo>/`
- Módulo deve estar registrado em `src/registry/modules.ts`

## Padrões de UI/UX (Referência: módulo cadastros)

### Tokens de Design

```typescript
// Cores semânticas (já definidas no design system)
const colors = {
  accent: "text-accent",           // Cor principal (dourado)
  accentFg: "text-accent-fg",      // Texto sobre accent
  textMain: "text-text-main",      // Texto principal
  textMuted: "text-text-muted",    // Texto secundário
  surface: "bg-surface",           // Fundo de cards
  card: "bg-card",                 // Fundo de cards elevados
  border: "border-border",         // Bordas padrão
  borderSubtle: "border-border/60", // Bordas sutis
};

// Cores de status
const statusColors = {
  success: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  warning: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  error: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  info: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
};

// Border radius
const radius = {
  sm: "rounded-lg",    // 8px - botões pequenos, badges
  md: "rounded-xl",    // 12px - cards, inputs
  lg: "rounded-2xl",   // 16px - cards grandes, modais
};

// Animações
const animations = {
  fadeIn: "animate-fade-in",
  hover: "transition-all duration-200",
  hoverCard: "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5",
  hoverScale: "hover:scale-[1.02]",
  activeScale: "active:scale-[0.99]",
};
```

### Componentes de Layout

#### 1. Header com Ações
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-text-main tracking-tight">Título da Página</h1>
    <p className="text-sm text-text-muted mt-1">Subtítulo ou contagem de registros</p>
  </div>
  <div className="flex items-center gap-3">
    <button className="flex items-center gap-2 rounded-xl bg-surface border border-border px-4 py-2.5 text-sm text-text-muted hover:text-text-main hover:border-accent/30 transition-all duration-200 min-h-[44px]">
      <Icon size={16} className="text-accent" />
      <span>Ação Secundária</span>
    </button>
    <Link className="flex items-center gap-2 rounded-xl bg-accent text-accent-fg px-4 py-2.5 text-sm font-semibold hover:bg-accent-hover transition-all duration-200 min-h-[44px] shadow-lg shadow-accent/20">
      <Icon size={16} />
      <span>Ação Principal</span>
    </Link>
  </div>
</div>
```

#### 2. KPI Cards (Dashboard)
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Card KPI */}
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40">
    <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 text-accent group-hover:scale-110 transition-transform duration-300">
      <Icon size={22} />
    </div>
    <p className="text-xs font-semibold text-accent/80 uppercase tracking-wider">Label</p>
    <p className="text-4xl font-bold text-text-main mt-2">123</p>
    <p className="text-xs text-text-muted mt-2">Descrição adicional</p>
  </div>

  {/* Card com barra de progresso */}
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/40">
    <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform duration-300">
      <TrendingUp size={22} />
    </div>
    <p className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider">Taxa</p>
    <p className="text-4xl font-bold text-text-main mt-2">85%</p>
    <div className="mt-2 h-1.5 w-full rounded-full bg-blue-500/10 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000" style={{ width: "85%" }} />
    </div>
  </div>
</div>
```

#### 3. Status Breakdown Cards
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
  {[
    { label: "Status 1", value: 10, icon: Icon1, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Status 2", value: 5, icon: Icon2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    // ... mais status
  ].map((item) => (
    <div key={item.label} className={`flex items-center gap-3 rounded-xl ${item.bg} border ${item.border} p-3 transition-all duration-200 hover:scale-[1.02]`}>
      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${item.bg}`}>
        <item.icon size={16} className={item.color} />
      </div>
      <div>
        <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
        <p className="text-[11px] text-text-muted font-medium">{item.label}</p>
      </div>
    </div>
  ))}
</div>
```

#### 4. Cards de Listagem
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item, i) => (
    <button
      key={item.id}
      onClick={() => navigate({ to: "/rota/$id", params: { id: item.id } })}
      className="group flex flex-col gap-4 rounded-2xl bg-surface border border-border/60 p-5 text-left transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 active:scale-[0.99]"
      style={{ animationDelay: `${i * 30}ms` }}
    >
      {/* Topo: avatar + nome + ações */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
            <span className="text-sm font-bold text-accent">{item.nome[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-main truncate group-hover:text-accent transition-colors">{item.nome}</p>
            <p className="text-xs text-text-muted mt-0.5">{item.subtitulo}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent/60">{item.tipo}</span>
        <span className="text-[10px] text-text-muted/60">{item.data}</span>
      </div>
    </button>
  ))}
</div>
```

#### 5. Filtros e Search
```tsx
{/* Search */}
<div className="flex flex-col lg:flex-row gap-3">
  <div className="relative flex-1">
    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar..."
      className="pl-11 h-12"
    />
    {search && (
      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors">
        <X size={14} />
      </button>
    )}
  </div>
</div>

{/* Filter Pills */}
<div className="flex flex-wrap gap-2">
  <button
    onClick={() => setFiltro("")}
    className={cn(
      "inline-flex items-center gap-2 h-9 rounded-full px-4 text-xs font-semibold transition-all duration-200",
      filtro === ""
        ? "bg-accent text-accent-fg shadow-md shadow-accent/25"
        : "bg-surface border border-border text-text-muted hover:text-text-main hover:border-accent/30"
    )}
  >
    Todos
    <span className={cn(
      "inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-bold",
      filtro === "" ? "bg-accent-fg/20 text-accent-fg" : "bg-surface-hover text-text-muted"
    )}>
      {count}
    </span>
  </button>
</div>
```

#### 6. Modais

##### Modal Custom (simples)
```tsx
function Modal({ titulo, descricao, onClose, children }: { titulo: string; descricao?: string; onClose?: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-text-main">{titulo}</h2>
          {onClose && <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={20} /></button>}
        </div>
        {descricao && <p className="mb-3 text-xs text-text-muted">{descricao}</p>}
        {children}
      </div>
    </div>
  );
}
```

##### AlertDialog (exclusão)
```tsx
<AlertDialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
  <AlertDialogContent>
    <div className="h-1 w-full bg-gradient-to-r from-error via-error to-error rounded-t-2xl" />
    <div className="p-6 sm:p-8">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-3 text-lg">
          <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center">
            <XCircle className="text-error" size={20} />
          </div>
          Confirmar exclusão
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-text-muted leading-relaxed">
          Tem certeza? Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={handleDelete} className="bg-error text-white hover:bg-error/90 shadow-lg shadow-error/25">
          Excluir permanentemente
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

##### Dialog (edição)
```tsx
<Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar Item</DialogTitle>
      <DialogDescription>Atualize as informações abaixo.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-text-secondary">Campo</label>
        <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="..." />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
      <Button onClick={handleSave} loading={submitting}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 7. Estados de Loading e Empty
```tsx
{/* Loading */}
{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-36 rounded-2xl" />
    ))}
  </div>
) : items.length === 0 ? (
  <EmptyState
    icon={<Search className="w-10 h-10 text-text-muted/30" />}
    title="Nenhum item encontrado"
    description="Tente ajustar seus filtros ou termos de busca."
  />
) : (
  {/* Lista de itens */}
)}
```

#### 8. Tabs (Detail Page)
```tsx
{/* Mobile Tabs */}
<div className="flex md:hidden gap-1 rounded-xl bg-card p-1">
  {(["tab1", "tab2", "tab3"] as const).map((t) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${tab === t ? "bg-accent text-white" : "text-text-muted hover:text-text-main"}`}
    >
      {t === "tab1" ? "Tab 1" : t === "tab2" ? "Tab 2" : "Tab 3"}
    </button>
  ))}
</div>

{/* Content Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
  <div className={`${tab === "tab1" ? "block" : "hidden md:block"} rounded-xl bg-card p-4 shadow-lg w-full`}>
    <h2 className="text-sm font-bold text-text-main mb-4">Seção 1</h2>
    {/* Conteúdo */}
  </div>
</div>
```

#### 9. Botões de Ação (Detail)
```tsx
<div className="w-full lg:w-auto flex flex-wrap gap-2 lg:gap-3">
  <button className="flex-1 lg:flex-none lg:w-32 rounded-xl bg-orange-600/80 py-2.5 px-4 text-sm font-medium text-white min-h-[44px] hover:bg-orange-600 transition-all duration-200 shadow-md border border-orange-600/20">
    Corrigir
  </button>
  <button className="flex-1 lg:flex-none lg:w-32 rounded-xl bg-green-700/80 py-2.5 px-4 text-sm font-medium text-white min-h-[44px] hover:bg-green-700 transition-all duration-200 shadow-md border border-green-700/20">
    Aprovar
  </button>
  <button className="flex-1 lg:flex-none lg:w-32 rounded-xl bg-red-700/80 py-2.5 px-4 text-sm font-medium text-white min-h-[44px] hover:bg-red-700 transition-all duration-200 shadow-md border border-red-700/20">
    Reprovar
  </button>
</div>
```

#### 10. Badges de Status
```tsx
{/* Badge simples */}
<span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-green-500/10 text-green-400">
  Ativo
</span>

{/* Badge com ícone */}
<span className="flex items-center gap-1 self-start rounded-full px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400">
  <CheckCircle size={14} />
  Aprovado
</span>

{/* Badge de tipo */}
<span className="self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
  PF
</span>
```

#### 11. Botões de Ação em Campo (Revisão)
```tsx
<div className="flex items-center gap-1 shrink-0">
  <button className="rounded-lg p-1 text-green-400 hover:bg-green-500/10 transition" title="Aprovar">
    <CheckCircle size={14} />
  </button>
  <button className="rounded-lg p-1 text-red-400 hover:bg-red-500/10 transition" title="Reprovar">
    <XCircle size={14} />
  </button>
  <button className="rounded-lg p-1 text-orange-400 hover:bg-orange-500/10 transition" title="Corrigir">
    <AlertTriangle size={14} />
  </button>
</div>
```

---

## Steps para Criar Design do Módulo

### 1. Criar rota de design
```typescript
// src/routes/<modulo>.design.tsx
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { ModuloDesignPage } from "~/design-system/components/ModuloDesignPage";

export const <modulo>DesignRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/<modulo>/design",
  component: () => <ModuloDesignPage moduloKey="<modulo>" moduloNome="<Nome>" />,
});
```

### 2. Registrar rota no routeTree.gen.ts
- Adicionar import
- Adicionar na lista de rotas dentro de `authLayout.addChildren([])`

### 3. Atualizar module.ts do módulo
```typescript
// Adicionar em ModuleDefinition:
hasDesignConfig: true,
designRoute: "/<modulo>/design",
```

### 4. Commit
```bash
git add src/routes/<modulo>.design.tsx src/features/<modulo>/module.ts
git commit -m "feat(<modulo>): adicionar configuração de Design System"
```

## Validação

```bash
npm run build   # deve passar sem erros
```

## Regras Obrigatórias

1. **Rota protegida** — sempre usar RequirePermission
2. **Lazy loading** — página deve ser carregada sob demanda
3. **module.ts** — sempre atualizar hasDesignConfig e designRoute
4. **Tokens** — sempre usar tokens do design system
5. **Mobile-first** — sempre aplicar responsividade

## Economia de Tokens

- **Lean-CTX:** Template reutilizável
- **Caveman:** Apenas paths diferentes
- **Pre-flight:** Rodar build após cada alteração
