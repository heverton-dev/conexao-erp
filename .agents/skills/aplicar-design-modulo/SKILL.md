---
name: aplicar-design-modulo
description: Aplica o design system a um módulo inteiro do ERP Odonto a partir de um documento de referência. Use quando o usuário pedir para "aplicar design ao módulo X", "estilizar módulo X", "aplicar DS em X", ou similar. Utiliza técnicas de economia de tokens (Lean-CTX, Caveman, Pre-flight Check) e referencia documentos em docs-projeto/docs-design-system/.
---

# Aplicar Design System ao Módulo

## Quick Start

1. Receber nome do módulo como input
2. Ler documento `ds-<modulo>.md` de referência
3. Verificar arquivos CSS existentes no módulo
4. Aplicar tokens e padrões de UI
5. Rodar `npm run build` para validar

## Workflow

### Step 1: Input do Usuário

Extrair nome do módulo do comando:
- `/aplicar-design <modulo>`
- "aplicar design ao módulo <modulo>"
- "estilizar <modulo>"

### Step 2: Carregar Referência

```
read docs-projeto/docs-design-system/ds-<modulo>.md
```

Se não existir, usar `ds-erp.md` como referência global.

### Step 3: Verificar Estado Atual

```bash
# Verificar se existe CSS próprio
glob src/features/<modulo>/**/*.css

# Verificar componentes existentes
glob src/features/<modulo>/**/*.tsx
```

### Step 4: Aplicar Design System

#### 4.1 Tokens CSS

Se módulo tem CSS próprio, adicionar variáveis:
```css
.modulo-theme {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-accent: var(--color-accent);
  /* ... tokens do ds-<modulo>.md */
}
```

#### 4.2 Componentes UI

Aplicar classes do design system:
```tsx
// Button
<Button variant="default">  // Gold accent
<Button variant="destructive">  // Vermelho
<Button variant="ghost-edit">  // Azul hover

// Badge
<Badge variant="success">  // Verde
<Badge variant="warning">  // Amarelo
<Badge variant="destructive">  // Vermelho

// Card
<Card className="rounded-2xl border-border/60 bg-card">
```

#### 4.3 Padrões de UI

Seguir padrões documentados:
- Status de entidades (badge colors)
- Ações comuns (button variants)
- Modais (Dialog/AlertDialog patterns)
- Formulários (Form + React Hook Form)

### Step 5: Validação

```bash
npm run build
```

Se falhar, corrigir erros antes de prosseguir.

### Step 6: Documentar Alterações

Atualizar `ds-<modulo>.md` se necessário:
- Novos padrões descobertos
- CSS próprio adicionado
- Componentes customizados

## Técnicas de Economia de Tokens

### Lean-CTX

- **Ler apenas arquivos necessários:** Não ler componentes UI existentes se já conhecidos
- **Glob patterns:** Buscar padrões específicos
- **Assinaturas primeiro:** Verificar interfaces antes de corpos

### Caveman

- **Diffs cirúrgicos:** Apenas alterações necessárias
- **Sem re-emitir arquivos inteiros:** Usar edit em vez de write
- **Direto ao ponto:** "[Arquivo] alterado. [Razão]"

### Pre-flight Check

- **Sempre rodar build:** `npm run build` após alterações
- **Verificar types:** `npm run check:types` se disponível
- **Testar:** Verificar se módulo funciona

## Padrões de Referência

### Cores por Status

| Status | Badge | Cor CSS |
|--------|-------|---------|
| Sucesso/Ativo | `badge-success` | `#22c55e` |
| Atenção/Pendente | `badge-warning` | `#eab308` |
| Erro/Inativo | `badge-destructive` | `#ef4444` |
| Neutro/Rascunho | `badge-secondary` | `#334155` |
| Primário/Gold | `badge-default` | `#c9a655` |

### Button Variants

| Variante | Uso |
|----------|-----|
| `default` | Ação primária (Gold) |
| `destructive` | Exclusão (Vermelho) |
| `outline` | Ação secundária |
| `ghost-edit` | Editar (Azul hover) |
| `ghost-destructive` | Delete (Vermelho hover) |

### Dialog Pattern

```tsx
<DialogContent className="flex flex-col max-h-[85vh] overflow-hidden">
  <DialogHeader className="shrink-0">...</DialogHeader>
  <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
    {/* Conteúdo */}
  </div>
  <DialogFooter className="shrink-0">...</DialogFooter>
</DialogContent>
```

## Referências

- `docs-projeto/docs-design-system/ds-erp.md` - Design system global
- `docs-projeto/docs-design-system/ds-<modulo>.md` - DS do módulo
- `src/styles/globals.css` - Tokens CSS
- `src/components/ui/` - Componentes UI
- `AGENTS.md` - Regras e técnicas de economia

## Regras Obrigatórias

1. **Não alterar lógica** — apenas classes CSS
2. **Não remover elementos** — apenas reaplicar classes
3. **Mobile-first** — sempre aplicar responsividade
4. **Touch targets** — min-h-[44px] em botões
5. **Acessibilidade** — ARIA labels em botões de ícone
6. **Build** — sempre rodar build após alterações
7. **Rollback** — reverter se build falhar
