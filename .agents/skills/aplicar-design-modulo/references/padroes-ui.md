# Padrões de UI - ERP Conexão

## Componentes Disponíveis

### Button

```tsx
import { Button } from "~/components/ui/button";

// Variantes
<Button variant="default">Primário (Gold)</Button>
<Button variant="destructive">Destrutivo (Vermelho)</Button>
<Button variant="outline">Secundário</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="ghost-edit">Editar (Azul)</Button>
<Button variant="ghost-destructive">Delete (Vermelho)</Button>

// Tamanhos
<Button size="xs">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="sm">Médio</Button>
<Button size="lg">Grande</Button>
<Button size="icon">Ícone</Button>

// Loading
<Button loading>Salvando...</Button>
```

### Input

```tsx
import { Input } from "~/components/ui/input";

<Input placeholder="Digite..." />
<Input disabled />
<Input aria-invalid />
```

### Badge

```tsx
import { Badge } from "~/components/ui/badge";

<Badge variant="default">Gold</Badge>
<Badge variant="secondary">Cinza</Badge>
<Badge variant="destructive">Vermelho</Badge>
<Badge variant="success">Verde</Badge>
<Badge variant="warning">Amarelo</Badge>
<Badge variant="outline">Borda</Badge>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Ações</CardFooter>
</Card>
```

### Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="flex flex-col max-h-[85vh] overflow-hidden">
    <DialogHeader className="shrink-0">
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição</DialogDescription>
    </DialogHeader>
    <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
      {/* Conteúdo com scroll */}
    </div>
    <DialogFooter className="shrink-0">
      <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
      <Button onClick={handleSave}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### AlertDialog

```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";

<AlertDialog open={!!item} onOpenChange={(o) => !o && setItem(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir item?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-destructive">
        Excluir
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna 1</TableHead>
      <TableHead>Coluna 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dado 1</TableCell>
      <TableCell>Dado 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Form

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(1, "Obrigatório"),
});

function MeuForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## Padrões de Status

### Status de Cadastro/Entidade

```tsx
const statusConfig = {
  criado: { badge: "default", label: "Criado" },
  ativo: { badge: "success", label: "Ativo" },
  inativo: { badge: "secondary", label: "Inativo" },
  pendente: { badge: "warning", label: "Pendente" },
  erro: { badge: "destructive", label: "Erro" },
};

<Badge variant={statusConfig[status].badge}>
  {statusConfig[status].label}
</Badge>
```

### Ações por Status

```tsx
const acoesPorStatus = {
  criado: [
    { label: "Aprovar", variant: "default", onClick: handleAprovar },
    { label: "Reprovar", variant: "ghost-destructive", onClick: handleReprovar },
  ],
  ativo: [
    { label: "Editar", variant: "ghost-edit", onClick: handleEditar },
    { label: "Desativar", variant: "ghost-destructive", onClick: handleDesativar },
  ],
};

{acoesPorStatus[status]?.map((acao) => (
  <Button key={acao.label} variant={acao.variant} onClick={acao.onClick}>
    {acao.label}
  </Button>
))}
```

## Tokens CSS

### Cores Principais

```css
--color-bg: #0f172a;
--color-surface: #1e293b;
--color-surface-hover: #334155;
--color-card: #1e293b;
--color-text-main: #f8fafc;
--color-text-secondary: #cbd5e1;
--color-text-muted: #94a3b8;
--color-border: #334155;
--color-accent: #c9a655;
--color-accent-hover: #d4b366;
```

### Cores de Feedback

```css
--color-success: #22c55e;
--color-success-bg: #22c55e15;
--color-warning: #eab308;
--color-warning-bg: #eab30815;
--color-error: #ef4444;
--color-error-bg: #ef444415;
```

### shadcn/ui Aliases

```css
--color-primary: #c9a655;
--color-primary-foreground: #3D2B00;
--color-secondary: #334155;
--color-secondary-foreground: #f8fafc;
--color-muted: #1e293b;
--color-muted-foreground: #94a3b8;
--color-destructive: #ef4444;
--color-destructive-foreground: #f8fafc;
```

## Classes de Utilidade

### Botões de Ação

```css
.btn-hover-destructive  /* Hover vermelho */
.btn-hover-edit         /* Hover azul */
.btn-hover-neutral      /* Hover neutro */
```

### Gradientes

```css
.bg-gradient-brand  /* Gradiente da marca (Gold) */
```

### Skeleton

```css
.skeleton  /* Loading shimmer */
```

## Regras Obrigatórias

1. **NUNCA usar** `window.confirm()`, `window.alert()`, `window.prompt()`
2. **SEMPRE usar** `AlertDialog` ou `Dialog` para modais
3. **SEMPRE rodar** `npm run build` após alterações
4. **SEMPRE usar** `RequirePermission` em rotas autenticadas
