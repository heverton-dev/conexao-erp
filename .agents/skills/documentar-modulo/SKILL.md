---
name: documentar-modulo
description: >
  Gera documentação completa de um módulo do ERP Odonto incluindo:
  visão geral, arquitetura, permissões, tipos, operações CRUD, eventos,
  design system, exemplos de uso e diagrama de dependências.
  Trigger: "documentar módulo", "gerar documentação", "docs do módulo"
---

# Documentar Módulo — ERP Odonto

Gera documentação completa e atualizada do módulo.

## Workflow

### Step 1: Analisar módulo

```bash
# Ler arquivos principais
read src/features/<modulo>/module.ts
read src/features/<modulo>/permissions.ts
read src/features/<modulo>/types.ts
read src/features/<modulo>/services/*.ts
read src/features/<modulo>/hooks/*.ts
```

### Step 2: Gerar documentação

Criar `docs-projeto/docs-design-system/ds-<modulo>.md`:

```markdown
# Design System — Módulo {{MODULO_NOME}}

> Módulo: `{{MODULO_KEY}}` | Versão: 1.0.0

## Sumário

1. [Visão Geral](#visão-geral)
2. [Permissões](#permissões)
3. [Rotas](#rotas)
4. [Eventos](#eventos)
5. [Tipos](#tipos)
6. [Services](#services)
7. [Hooks](#hooks)
8. [Design System](#design-system)
9. [Exemplos](#exemplos)

---

## Visão Geral

**Chave:** `{{MODULO_KEY}}`
**Ícone:** {{ICONE}}
**Descrição:** {{DESCRICAO}}

---

## Permissões

| Chave | Descrição | Grupo |
|-------|-----------|-------|
{{#each permissions}}
| `{{key}}` | {{label}} | {{group}} |
{{/each}}

### Defaults por Ambiente

| Ambiente | Permissões Padrão |
|----------|-------------------|
| `cadastro` | {{cadastro_defaults}} |
| `consultor` | {{consultor_defaults}} |
| `tecnologia` | {{tecnologia_defaults}} |
| `suporte` | {{suporte_defaults}} |

---

## Rotas

| Rota | Descrição | Permissão |
|------|-----------|-----------|
{{#each routes}}
| `{{path}}` | {{descricao}} | {{permissao}} |
{{/each}}

---

## Eventos

### Status Change

| Evento | Descrição |
|--------|-----------|
{{#each status_events}}
| `{{key}}` | {{descricao}} |
{{/each}}

### Button Action

| Evento | Descrição |
|--------|-----------|
{{#each button_events}}
| `{{key}}` | {{descricao}} |
{{/each}}

---

## Tipos

### {{MODULO_PASCAL}}

```typescript
interface {{MODULO_PASCAL}} {
  id: string;
  created_at: string;
  updated_at: string;
  // campos específicos
}
```

### Input Types

```typescript
interface Criar{{MODULO_PASCAL}}Input {
  // campos de criação
}

interface Atualizar{{MODULO_PASCAL}}Input {
  id: string;
  // campos de atualização
}
```

---

## Services

### Operações Disponíveis

| Operação | Método | Descrição |
|----------|--------|-----------|
| Listar | `listar(empresaId)` | Lista registros com paginação |
| Buscar | `buscarPorId(id, empresaId)` | Busca registro por ID |
| Criar | `criar(input, empresaId)` | Cria novo registro |
| Atualizar | `atualizar(input, empresaId)` | Atualiza registro |
| Excluir | `excluir(id, empresaId)` | Exclui registro |

### Exemplo de Uso

```typescript
import { {{MODULO_CAMEL}}Service } from "~/features/{{MODULO_KEY}}/services/{{MODULO_KEY}}.service";

// Listar
const registros = await {{MODULO_CAMEL}}Service.listar(empresaId);

// Criar
const novo = await {{MODULO_CAMEL}}Service.criar({
  nome: "Exemplo",
  // ...
}, empresaId);
```

---

## Hooks

### use{{MODULO_PASCAL}}s

```typescript
const { data, isLoading, error } = use{{MODULO_PASCAL}}s(empresaId);
```

### use{{MODULO_PASCAL}}

```typescript
const { data, isLoading } = use{{MODULO_PASCAL}}(id, empresaId);
```

### useCriar{{MODULO_PASCAL}}

```typescript
const mutate = useCriar{{MODULO_PASCAL}}(empresaId);
mutate.mutate({ nome: "Novo" });
```

### useAtualizar{{MODULO_PASCAL}}

```typescript
const mutate = useAtualizar{{MODULO_PASCAL}}(empresaId);
mutate.mutate({ id, nome: "Atualizado" });
```

### useExcluir{{MODULO_PASCAL}}

```typescript
const mutate = useExcluir{{MODULO_PASCAL}}(empresaId);
mutate.mutate(id);
```

---

## Design System

### Tokens CSS

```css
--color-bg: #0f172a;
--color-surface: #1e293b;
--color-accent: #c9a655;
```

### Componentes UI

- `Button` — Ações
- `Input` — Campos de formulário
- `Badge` — Status
- `Card` — Containers
- `Dialog` — Modais
- `Table` — Tabelas

### Padrões de Status

| Status | Badge | Cor |
|--------|-------|-----|
| Ativo | `badge-success` | Verde |
| Inativo | `badge-secondary` | Cinza |
| Pendente | `badge-warning` | Amarelo |
| Erro | `badge-destructive` | Vermelho |

---

## Exemplos

### Listar registros

```tsx
function Pagina{{MODULO_PASCAL}}() {
  const { empresa } = useEmpresa();
  const { data: itens, isLoading } = use{{MODULO_PASCAL}}s(empresa?.id || "");

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {itens?.map((item) => (
        <Card key={item.id}>{item.nome}</Card>
      ))}
    </div>
  );
}
```

### Criar registro

```tsx
function Form{{MODULO_PASCAL}}() {
  const { empresa } = useEmpresa();
  const mutate = useCriar{{MODULO_PASCAL}}(empresa?.id || "");

  const handleSubmit = (data) => {
    mutate.mutate(data);
  };

  return <{{FORMULARIO}} onSubmit={handleSubmit} />;
}
```

### Excluir registro

```tsx
function BotaoExcluir({ id }: { id: string }) {
  const { empresa } = useEmpresa();
  const mutate = useExcluir{{MODULO_PASCAL}}(empresa?.id || "");

  return (
    <Button
      variant="ghost-destructive"
      onClick={() => mutate.mutate(id)}
    >
      Excluir
    </Button>
  );
}
```
```

### Step 3: Commit

```bash
git add docs-projeto/docs-design-system/ds-<modulo>.md
git commit -m "docs(<modulo>): gerar documentação completa"
```

## Regras Obrigatórias

1. **Sempre atualizar** — documentação deve refletir código atual
2. **Incluir exemplos** — código real de uso
3. **Documentar eventos** — todos os eventos do módulo
4. **Documentar permissões** — todas as permissões
5. **Design system** — tokens e componentes usados

## Economia de Tokens

- **Lean-CTX:** Ler apenas arquivos necessários
- **Caveman:** Documentação concisa
- **Pre-flight:** Rodar build após cada alteração
