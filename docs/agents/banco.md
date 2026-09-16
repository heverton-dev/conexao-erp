# Banco de dados

Supabase/Postgres. 167 migrations em `supabase/migrations/`. Skill: `criar-migration`.

## Single-tenant — a regra

A empresa é fixa (`VITE_EMPRESA_ID`, via `~/config/empresa`).

- **Não crie** coluna `empresa_id` em tabela nova.
- **Não filtre** por `empresa_id` em código novo.

## ⚠ O banco NÃO corresponde a este diretório de migrations

Medido em 2026-08-03 contra o schema real: a renomeação EN→PT
(`20260705000000`) e a remoção de `empresa_id` (`20260721000000`) **nunca foram
aplicadas**, e **52 tabelas que o código consulta não existem**. Relatório com
evidência: [drift-banco-vs-migrations.md](drift-banco-vs-migrations.md).

Consequências práticas ao escrever código hoje:

- **`empresa_id` existe e é `NOT NULL` em 83 tabelas.** Insert sem o campo falha
  com Postgres `23502`. Não remova o campo de payload existente até a fase 1 rodar.
- **Nomes de tabela no banco estão em inglês**: `hub_materials`, não
  `hub_materiais`; `mapas_distributors`, não `mapas_distribuidores`;
  `api_connectors`, não `conectores_api`. O código usa os nomes em português e
  por isso vários módulos consultam tabela inexistente.
- **Grep na migration não responde nada** sobre o estado do banco. Nem o
  diretório de migrations responde. Só o schema.

Para medir:

```bash
npm run audit:empresa-id     # precisa de acesso direto ao banco
```

Se o acesso direto falhar (hoje falha: senha recusada para `postgres`), o
OpenAPI do PostgREST serve como alternativa read-only:

```bash
curl -s -H "apikey: $KEY" "$VITE_SUPABASE_URL/rest/v1/" | jq '.definitions | keys'
```

## Decisão: `empresa_id` sai de todas as tabelas

Decisão de 2026-08-03 — não haverá uso multi-tenant, sem exceção. Em 152 de 154
definições a coluna era FK para `empresas(id)`, isto é, sempre o discriminador de
tenant.

Não escreva código novo com `empresa_id`. A remoção do código existente é
coordenada com as migrations em `supabase/migrations-pendentes/` (fase 1 → limpeza
do código → fase 2a → fase 2b), e **depende de o banco ser reconciliado primeiro**.
Ordem completa no relatório de drift.

## RLS

Aberta por design (`USING (true)`) — a autorização é na aplicação, via
permissões e guards ([rotas-permissoes.md](rotas-permissoes.md)).

```sql
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;
CREATE POLICY "minha_tabela_select" ON minha_tabela FOR SELECT USING (true);
CREATE POLICY "minha_tabela_insert" ON minha_tabela FOR INSERT WITH CHECK (true);
CREATE POLICY "minha_tabela_update" ON minha_tabela FOR UPDATE USING (true);
CREATE POLICY "minha_tabela_delete" ON minha_tabela FOR DELETE USING (true);
```

## Convenções de schema

| Item | Padrão |
| --- | --- |
| Nome do arquivo | `<timestamp>_<descricao_snake_case>.sql` (`20260726180000_catalogo_pagamentos.sql`) |
| Nome de tabela | `snake_case`, prefixo do módulo (`catalogo_*`, `hub_*`, `funis_*`, `mktg_*`, `nps_*`, `rotas_*`, `despesas_*`, `linktree_*`, `mapas_*`, `gerador_*`) |
| PK | `id UUID DEFAULT gen_random_uuid() PRIMARY KEY` |
| Timestamps | `created_at`/`updated_at TIMESTAMPTZ DEFAULT now()` |
| FK | `REFERENCES pai(id) ON DELETE CASCADE` |
| Dinheiro | `DECIMAL(10,2)` |
| Extras | `metadata JSONB DEFAULT '{}'` |
| Enum | `TEXT` + comentário com os valores válidos (não usar tipo `ENUM`) |

## Template de migration

```sql
-- ============================================================
-- Migration: <título>
-- Data: AAAA-MM-DD
-- Descrição: <o que muda e por quê>
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS minha_tabela ( ... );
CREATE INDEX IF NOT EXISTS idx_minha_tabela_status ON minha_tabela(status);

-- RLS (aberta — single-tenant)
...

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_minha_tabela_updated_at() ...
CREATE TRIGGER minha_tabela_updated_at BEFORE UPDATE ON minha_tabela
  FOR EACH ROW EXECUTE FUNCTION update_minha_tabela_updated_at();

COMMIT;
```

Regras: idempotente (`IF EXISTS` / `IF NOT EXISTS`), dentro de `BEGIN`/`COMMIT`,
índice em toda FK e coluna filtrada. Nunca editar migration já aplicada — criar nova.

## Cache do PostgREST

Alteração de schema exige invalidar o cache, senão o client retorna coluna inexistente:

```sql
NOTIFY pgrst, 'reload schema';
```

## Tipos no TypeScript

`~/core/supabase` exporta `supabase` e `Json`. Não existe `database.types.ts` gerado:
os tipos de linha são declarados à mão em `types.ts` de cada módulo. Ao mexer em
tipagem dinâmica do Supabase, rode `npm run check:types` — o `vite build` não type-checka.

## Scripts auxiliares

Migrations bloqueadas por mudança de código ficam em `supabase/migrations-pendentes/`
(fora do alcance do runner de deploy) — ver o README de lá.

## Scripts auxiliares

`scripts/` tem utilitários de manutenção (`run-migrations.mjs`, `audit-fks.cjs`,
`diagnostico-rls.cjs`, `reload-postgrest-cache.cjs`, `single-tenant-services.cjs`).
São de uso pontual, não parte do build.
