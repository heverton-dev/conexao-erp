# FixPermissionsService - Tarefa Concluída

## Arquivo: `src/core/permissions/services.ts`

| Antes | Depois |
|-------|--------|
| `import { EMPRESA_ID } from "~/config/empresa";` | Removido (sem uso) |
| `empresa_id: EMPRESA_ID,` no upsert | Removido |

## Resultado
A tabela `permissoes` não recebe mais `empresa_id` no upsert de `setModulosAcesso`.
