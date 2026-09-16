-- ============================================================
-- Migration: Reconcilia colunas de `clientes` com o que o código
-- já espera desde 2026-07-14 (aprovarCadastro, import de CSV,
-- pedidos/orçamentos), aditivo e idempotente.
--
-- Contexto: a migration 20260714000003_clientes_unified_table.sql
-- nunca rodou de verdade (ledger marcado `-- pre-applied`), então a
-- tabela real ficou com o shape antigo (9 colunas). Esta migration
-- NÃO recria a tabela nem toca em RLS/empresa_id — só adiciona as
-- colunas nullable que o código de produção realmente usa hoje.
-- ============================================================

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN cadastro_id UUID REFERENCES cadastros(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna cadastro_id já existe em clientes';
END $$;

CREATE INDEX IF NOT EXISTS idx_clientes_cadastro ON clientes(cadastro_id);

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN codigo_cliente TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna codigo_cliente já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN tipo_pessoa TEXT CHECK (tipo_pessoa IN ('PF', 'PJ'));
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna tipo_pessoa já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN cpf_cnpj TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna cpf_cnpj já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN lead_email TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna lead_email já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN lead_whatsapp TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna lead_whatsapp já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN cep TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna cep já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN rua TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna rua já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN numero TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna numero já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN bairro TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna bairro já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN complemento TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna complemento já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN cidade TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna cidade já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN estado TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna estado já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente'));
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna status já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN observacoes TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna observacoes já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN colaborador TEXT;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna colaborador já existe em clientes';
END $$;

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN fonte TEXT DEFAULT 'cadastros' CHECK (fonte IN ('cadastros', 'csv', 'manual', 'crm'));
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna fonte já existe em clientes';
END $$;

NOTIFY pgrst, 'reload schema';
