---
name: criar-migration
description: >
  Cria migration SQL do Supabase seguindo os padrões reais do projeto ERP Odonto:
  nomenclatura por timestamp, colunas padrão, RLS single-tenant (aberta), tabelas
  de relacionamento N:N com PK composta, blocos idempotentes e reload de schema.
  Sistema é single-tenant — NÃO adicionar empresa_id.
  Trigger: "criar migration", "nova migration", "criar tabela", "migration supabase"
---

# Criar Migration — ERP Odonto

Gera migration SQL consistente com o padrão real do banco (verificado em `supabase/migrations/*`, jul/2026).

## Pré-requisito

Sistema é **single-tenant** desde `20260721000000_remove_empresa_id_all_tables.sql`. Não incluir `empresa_id` em tabelas novas, exceto se o usuário pedir explicitamente algo equivalente a `agentes_usage_log` (billing/uso por empresa — caso isolado e deliberado).

## Workflow

### Step 1: Nome do arquivo

```
supabase/migrations/YYYYMMDDHHMMSS_descricao_snake_case.sql
```

- Timestamp: data atual + bloco de 10000 se houver mais de uma migration no mesmo dia (`_000000`, `_010000`, `_020000`...)
- Prefixo semântico: `create_`, `add_`, `fix_`, `seq_`

### Step 2: Tabela simples

```sql
CREATE TABLE IF NOT EXISTS <schema>_<entidade> (
  sku text PRIMARY KEY,               -- ou: id uuid PRIMARY KEY DEFAULT gen_random_uuid()
  nome text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

- Use `sku text PRIMARY KEY` quando a entidade já tem um identificador de negócio natural (padrão do catálogo). Use `id uuid` para entidades sem chave natural.
- Não há trigger de `updated_at` no projeto — é atualizado manualmente pela aplicação. Não inventar um trigger a menos que peçam.

### Step 3: Tabela de relacionamento N:N (pivot)

```sql
CREATE TABLE IF NOT EXISTS <a>_<b> (
  a_sku text NOT NULL REFERENCES <a>(sku) ON DELETE CASCADE,
  b_sku text NOT NULL REFERENCES <b>(sku) ON DELETE CASCADE,
  PRIMARY KEY (a_sku, b_sku)
);
```

- PK composta pelas próprias FKs — sem coluna `id` própria
- `ON DELETE CASCADE` para relações obrigatórias, `ON DELETE SET NULL` para opcionais
- Serviço correspondente no app deve salvar via **delete-then-insert** (apagar tudo pelo lado fixo e reinserir a lista nova) — não fazer diff/merge

### Step 4: RLS (padrão atual — aberta)

```sql
DROP POLICY IF EXISTS <tabela>_select ON <tabela>;
DROP POLICY IF EXISTS <tabela>_insert ON <tabela>;
DROP POLICY IF EXISTS <tabela>_update ON <tabela>;
DROP POLICY IF EXISTS <tabela>_delete ON <tabela>;

ALTER TABLE <tabela> ENABLE ROW LEVEL SECURITY;

CREATE POLICY <tabela>_select ON <tabela> FOR SELECT USING (true);
CREATE POLICY <tabela>_insert ON <tabela> FOR INSERT WITH CHECK (true);
CREATE POLICY <tabela>_update ON <tabela> FOR UPDATE USING (true);
CREATE POLICY <tabela>_delete ON <tabela> FOR DELETE USING (true);
```

Sempre `DROP POLICY IF EXISTS` antes de recriar — migrations devem ser idempotentes/re-executáveis.

### Step 5: Índices e ALTER tolerante a erro

```sql
CREATE INDEX IF NOT EXISTS idx_<tabela>_<coluna> ON <tabela>(<coluna>);

DO $$
BEGIN
  ALTER TABLE <tabela> ADD CONSTRAINT <nome> ...;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'constraint já existe ou não aplicável: %', SQLERRM;
END $$;
```

### Step 6: Fechar a migration

```sql
NOTIFY pgrst, 'reload schema';
```

Toda migration do catálogo termina assim — sem isso o PostgREST não enxerga o novo schema imediatamente.

### Step 7: Aplicar

- Via MCP: `supabase_apply_migration`
- Rodar `npm run build` depois de qualquer mudança de tipos gerados a partir do schema

## Regras obrigatórias

1. **Sem `empresa_id`** — sistema é single-tenant
2. **Idempotência** — `IF NOT EXISTS` / `DROP ... IF EXISTS` sempre
3. **`NOTIFY pgrst, 'reload schema'`** no final
4. **PK composta** em pivots N:N, sem `id` supérfluo
5. **RLS habilitada** mesmo quando a policy é aberta (`USING (true)`) — nunca deixar a tabela sem RLS

## Economia de Tokens

- **Lean-CTX:** ler só a migration mais recente que toca a mesma tabela/domínio antes de escrever a nova
- **Pre-flight:** aplicar via MCP e validar com uma query de smoke-test antes de seguir para o código da app
