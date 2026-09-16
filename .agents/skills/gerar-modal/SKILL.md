---
name: gerar-modal
description: >
  Gera componente Modal/Dialog completo usando shadcn/ui Dialog com variantes
  (confirm, form, info, warning, danger), scroll obrigatório, keyboard navigation,
  focus trap e tokens do Design System.
  Trigger: "gerar modal", "criar modal", "novo modal", "criar dialog"
---

# Gerar Modal — ERP Odonto

Gera modal completo e validado com todas as variantes.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- Variante do modal: `confirm` | `form` | `info` | `warning` | `danger`

## Workflow

### Step 1: Coletar informações

- **Nome:** PascalCase (ex: `ModalConfirmarDelete`)
- **Módulo:** kebab-case (ex: `cadastros`)
- **Variante:** `confirm` | `form` | `info` | `warning` | `danger`
- **Props:** dados necessários

### Step 2: Gerar componente

```typescript
// src/features/<modulo>/components/<Modal>.tsx
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react";

interface {{MODAL}}Props {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  title: string;
  description?: string;
  children?: React.ReactNode;
  loading?: boolean;
  variant?: "confirm" | "form" | "info" | "warning" | "danger";
}

export function {{MODAL}}({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  loading = false,
  variant = "confirm",
}: {{MODAL}}Props) {
  // ═══ KEYBOARD NAVIGATION ═══
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // ═══ VARIANT CONFIG ═══
  const variantConfig = {
    confirm: {
      icon: <CheckCircle className="h-6 w-6" />,
      iconBg: "bg-accent/15",
      iconText: "text-accent",
      headerGradient: "from-accent/20 via-accent/10 to-transparent",
      headerBorder: "border-accent/20",
      buttonClass: "bg-accent text-accent-fg hover:bg-accent-hover",
    },
    form: {
      icon: null,
      iconBg: "",
      iconText: "",
      headerGradient: "from-accent/20 via-accent/10 to-transparent",
      headerBorder: "border-accent/20",
      buttonClass: "bg-accent text-accent-fg hover:bg-accent-hover",
    },
    info: {
      icon: <Info className="h-6 w-6" />,
      iconBg: "bg-blue-500/15",
      iconText: "text-blue-400",
      headerGradient: "from-blue-500/20 via-blue-500/10 to-transparent",
      headerBorder: "border-blue-500/20",
      buttonClass: "bg-blue-500 text-white hover:bg-blue-600",
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconBg: "bg-yellow-500/15",
      iconText: "text-yellow-400",
      headerGradient: "from-yellow-500/20 via-yellow-500/10 to-transparent",
      headerBorder: "border-yellow-500/20",
      buttonClass: "bg-yellow-500 text-white hover:bg-yellow-600",
    },
    danger: {
      icon: <AlertTriangle className="h-6 w-6" />,
      iconBg: "bg-red-500/15",
      iconText: "text-red-400",
      headerGradient: "from-red-500/20 via-red-500/10 to-transparent",
      headerBorder: "border-red-500/20",
      buttonClass: "bg-red-500 text-white hover:bg-red-600",
    },
  };

  const config = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/40 max-h-[85vh] flex flex-col overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* ═══ HEADER COM GRADIENTE ═══ */}
        <DialogHeader className={`shrink-0 bg-gradient-to-br ${config.headerGradient} px-6 pt-6 pb-6 border-b ${config.headerBorder}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.icon && (
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.iconBg} ${config.iconText}`}>
                  {config.icon}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-text-main tracking-tight">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-sm text-text-muted mt-0.5">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </DialogHeader>

        {/* ═══ BODY COM SCROLL ═══ */}
        <div className="px-6 py-6 flex-1 overflow-y-auto min-h-0 space-y-4">
          {children}
        </div>

        {/* ═══ FOOTER ═══ */}
        <DialogFooter className="shrink-0 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-6 pb-8 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={loading}
              className={config.buttonClass}
            >
              {loading && (
                <span className="mr-2 h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
              )}
              Confirmar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 3: Variantes

#### Confirm (confirmação simples)

```tsx
<{{MODAL}}
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  title="Confirmar ação"
  description="Tem certeza que deseja prosseguir?"
  variant="confirm"
/>
```

#### Form (modal com formulário)

```tsx
<{{MODAL}}
  open={open}
  onClose={() => setOpen(false)}
  title="Criar registro"
  description="Preencha os campos abaixo"
  variant="form"
>
  <{{FORMULARIO}} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
</{{MODAL}}>
```

#### Info (informação)

```tsx
<{{MODAL}}
  open={open}
  onClose={() => setOpen(false)}
  title="Informação"
  description="Este é um modal informativo"
  variant="info"
>
  <p className="text-sm text-text-muted">Conteúdo informativo aqui.</p>
</{{MODAL}}>
```

#### Warning (aviso)

```tsx
<{{MODAL}}
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  title="Atenção"
  description="Esta ação pode ter consequências"
  variant="warning"
/>
```

#### Danger (exclusão/destrutivo)

```tsx
<{{MODAL}}
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Excluir registro"
  description="Esta ação não pode ser desfeita"
  variant="danger"
  loading={isDeleting}
>
  <p className="text-sm text-text-muted">
    Tem certeza que deseja excluir <strong>{item.nome}</strong>?
  </p>
</{{MODAL}}>
```

### Step 4: Validar

```bash
npm run lint    # deve passar
npm run build   # deve passar sem erros
```

### Step 5: Commit

```bash
git add src/features/<modulo>/components/<Modal>.tsx
git commit -m "feat(<modulo>): gerar modal <Modal>"
```

## Regras Obrigatórias

1. **Scroll** — `max-h-[85vh] overflow-y-auto` no body
2. **Header gradiente** — sempre usar gradiente contextual
3. **Ícone** — sempre com bg colorido
4. **Botão X** — sempre presente para fechar
5. **Keyboard** — Esc para fechar
6. **Focus trap** — Tab não sai do modal (Radix faz automaticamente)
7. **Loading** — botão desabilitado durante operação
8. **Mobile-first** — `w-full max-w-md` + `rounded-t-2xl sm:rounded-2xl`

## Padrão de Header por Variante

| Variante | Gradiente | Ícone bg | Ícone text |
|----------|-----------|----------|------------|
| confirm | `from-accent/20` | `bg-accent/15` | `text-accent` |
| form | `from-accent/20` | — | — |
| info | `from-blue-500/20` | `bg-blue-500/15` | `text-blue-400` |
| warning | `from-yellow-500/20` | `bg-yellow-500/15` | `text-yellow-400` |
| danger | `from-red-500/20` | `bg-red-500/15` | `text-red-400` |

## Economia de Tokens

- **Lean-CTX:** Template reutilizável
- **Caveman:** Apenas variantes diferentes
- **Pre-flight:** Rodar lint e build após cada alteração
