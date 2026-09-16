---
name: validar-modulo
description: >
  Valida integridade completa de um módulo do ERP Odonto incluindo:
  estrutura, registro, rotas, tipos, eventos, permissões, design system,
  mobile-first, acessibilidade e build. Oferece auto-correção para problemas comuns.
  Trigger: "validar módulo", "verificar módulo", "checar módulo"
---

# Validar Módulo — ERP Odonto

Validação completa e auto-correção de módulos.

## Workflow

### Step 1: Executar checks

```bash
# Estrutura
ls src/features/<modulo>/

# Registro
grep -q "<modulo>" src/registry/modules.ts

# Rotas
ls src/routes/<modulo>*

# Build
npm run build
```

### Step 2: Verificar estrutura

| Item | Obrigatório | Status |
|------|-------------|--------|
| `module.ts` | ✅ | |
| `permissions.ts` | ✅ | |
| `types.ts` | ✅ | |
| `index.ts` | ✅ | |
| `services/` | ✅ | |
| `hooks/` | ✅ | |
| `components/` | ⚠️ | Pode ser vazio |
| `pages/` | ⚠️ | Pode ser vazio |
| `__tests__/` | ⚠️ | Recomendado |

### Step 3: Verificar registro

| Item | Check |
|------|-------|
| `module.ts` em `src/registry/modules.ts` | |
| `registerModule()` no `main.tsx` | |
| Permissões em `permissions-registry.ts` | |
| `registerPermission()` no `setup()` | |
| `registerPermissionDefaults()` no `setup()` | |

### Step 4: Verificar eventos

| Item | Check |
|------|-------|
| Mínimo 2 eventos no `module.ts` | |
| Formato `entidade.acao` | |
| `dispararEventoModulo()` nos services | |
| `.catch(() => {})` obrigatório | |
| Aba `eventos` no array `abas` | |

### Step 5: Verificar permissões

| Item | Check |
|------|-------|
| Permissões em snake_case | |
| Sem acentos | |
| Grupo vinculado ao módulo | |
| Defaults por ambiente | |
| `RequirePermission` nas rotas | |

### Step 6: Verificar design system

| Item | Check |
|------|-------|
| `hasDesignConfig` no module.ts | |
| `designRoute` configurada | |
| CSS tokens usados | |
| Componentes UI do DS | |

### Step 7: Verificar mobile-first

| Item | Check |
|------|-------|
| Grids começam em 1 coluna | |
| Touch targets min-h-[44px] | |
| Font-size >= 16px em inputs | |
| safe-area-inset para PWA | |

### Step 8: Verificar build

```bash
npm run build   # deve passar sem erros
npm run lint    # deve passar
npx tsc --noEmit  # deve passar sem erros
```

### Step 9: Gerar relatório

```markdown
# Relatório de Validação — {{MODULO_NOME}}

## ✅ Checks que passaram
- Estrutura de diretórios
- Registro no modules.ts
- Eventos configurados
- Permissões validadas

## ❌ Checks que falharam
- Build com erros (corrigir antes de commitar)

## ⚠️ Warnings
- Pasta components/ vazia
- Pasta pages/ vazia
- Sem testes

## 📊 Score
- Checks: 8/10
- Warnings: 2
- Status: ⚠️ Aprovado com ressalvas
```

### Step 10: Auto-correção (opcional)

Se o usuário solicitar, corrigir problemas comuns:

| Problema | Correção |
|----------|----------|
| Falta `events[]` | Adicionar eventos padrão |
| Falta aba `eventos` | Adicionar no array `abas` |
| Falta `hasDesignConfig` | Adicionar ao module.ts |
| Falta `RequirePermission` | Adicionar nas rotas |
| Query com `empresa_id` (schema single-tenant não tem mais essa coluna) | Remover filtro |

## Output

Relatório de validação com:
- ✅ Checks que passaram
- ❌ Checks que falharam
- ⚠️ Warnings
- 📊 Score de integridade
- 🔧 Auto-correções disponíveis

## Economia de Tokens

- **Lean-CTX:** Ler apenas arquivos necessários
- **Caveman:** Relatório conciso
- **Pre-flight:** Rodar build após cada correção
