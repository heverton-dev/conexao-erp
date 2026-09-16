---
name: gerenciar-nav-items
description: >
  Gerencia nav items (itens de navegação lateral) de módulos do ERP Odonto.
  Adiciona, renomeia, reordena ou remove nav items com validação de rotas,
  permissões e consistência. Trigger: "adicionar nav item", "remover nav item",
  "reorganizar menu", "alterar navegação"
---

# Gerenciar Nav Items — ERP Odonto

Gerencia navegação lateral com validação completa.

## Pré-requisitos

- Módulo deve existir em `src/features/<modulo>/`
- `module.ts` deve estar registrado

## Workflow

### Step 1: Mapear nav items atuais

```typescript
// src/features/<modulo>/module.ts
setup: () => {
  registerNavItem({
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/{{MODULO_KEY}}/dashboard",
    permissionCheck: (perms) => perms?.{{MODULO_KEY}}_ver === true,
    order: 1,
    moduloKey: "{{MODULO_KEY}}",
  });
}
```

### Step 2: Receber solicitação do usuário

Formato esperado:
```
Adicionar: /modulo/nova-rota → Nova Rota → permissao_ver
Remover: /modulo/rota-antiga
Reordenar: mover "Config" para posição 3
```

### Step 3: Validar consistência

| Check | Descrição |
|-------|-----------|
| Path único | Não pode haver outro nav item com mesmo path no módulo |
| Label único | Não pode haver outro nav item com mesmo label no módulo |
| Rota existe | Path deve ter rota correspondente em `src/routes/` |
| Permissão existe | `permissionCheck` deve usar permissão válida |
| Ícone válido | Deve ser um Lucide icon importado |

### Step 4: Atualizar module.ts

```typescript
setup: () => {
  // ═══ NAV ITEMS ATUAIS ═══
  registerNavItem({
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/{{MODULO_KEY}}/dashboard",
    permissionCheck: (perms) => perms?.{{MODULO_KEY}}_ver === true,
    order: 1,
    moduloKey: "{{MODULO_KEY}}",
  });

  // ═══ NOVO NAV ITEM ═══
  registerNavItem({
    id: "nova-rota",
    label: "Nova Rota",
    icon: FileText,
    to: "/{{MODULO_KEY}}/nova-rota",
    permissionCheck: (perms) => perms?.{{MODULO_KEY}}_ver === true,
    order: 2,
    moduloKey: "{{MODULO_KEY}}",
  });
}
```

### Step 5: Verificar rotas

```bash
# Verificar se rotas existem
ls src/routes/<modulo>*
```

Se não existirem, usar skill `criar-rota`.

### Step 6: Verificar permissões

```bash
# Verificar se permissões existem
grep -q "permissao_chave" src/registry/permissions-registry.ts
```

Se não existirem, usar skill `adicionar-permissao`.

### Step 7: Validar

```bash
npm run build   # deve passar sem erros
```

### Step 8: Commit

```bash
git add src/features/<modulo>/module.ts
git commit -m "feat(<modulo>): atualizar nav items"
```

## Padrão de Nav Item

```typescript
registerNavItem({
  id: string,           // único no módulo
  label: string,        // único no módulo
  icon: LucideIcon,     // importado de lucide-react
  to: string,           // path kebab-case
  permissionCheck: (perms) => boolean,  // obrigatório
  order: number,        // ordem de exibição
  moduloKey: string,    // chave do módulo
  noChildMatch?: boolean,  // opcional
  matchPaths?: string[],   // opcional
});
```

## Regras Obrigatórias

1. **ID único** — não pode repetir no módulo
2. **Label único** — não pode repetir no módulo
3. **Path único** — não pode repetir no módulo
4. **Rota existente** — path deve ter rota
5. **Permissão existente** — permissionCheck deve usar permissão válida
6. **Ícone importado** — sempre importar de lucide-react
7. **Order** — sempre definir ordem explícita

## Economia de Tokens

- **Lean-CTX:** Ler apenas module.ts
- **Caveman:** Alterações cirúrgicas
- **Pre-flight:** Rodar build após cada alteração
