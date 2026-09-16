# FixPermissionsService - Concluído

## Arquivo corrigido: `src/core/permissions/services.ts`

### Alterações:
1. **Linha 3 removida:** `import { EMPRESA_ID } from "~/config/empresa"` — não mais usado
2. **Linha 80 removida:** `empresa_id: EMPRESA_ID,` do objeto do upsert em `setModulosAcesso`

### Antes:
```ts
const { error } = await supabase.from("permissoes").upsert(
  {
    usuario_id: usuarioId,
    modulos_acesso: modulosAcesso as any,
    empresa_id: EMPRESA_ID,       // ← REMOVIDO
    updated_by: user.user?.id || null,
  },
  { onConflict: "usuario_id" },
);
```

### Depois:
```ts
const { error } = await supabase.from("permissoes").upsert(
  {
    usuario_id: usuarioId,
    modulos_acesso: modulosAcesso as any,
    updated_by: user.user?.id || null,
  },
  { onConflict: "usuario_id" },
);
```

## Status: ✅ Completo
