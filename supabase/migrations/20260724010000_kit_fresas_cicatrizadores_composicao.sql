-- ============================================================
-- Migration: Composição Kit x Fresa/Cicatrizador
-- Data: 2026-07-24
-- Descrição:
--   1) Corrige catalogo_kit_fresas (fresa_id ainda era UUID sem FK
--      válida, criada assim em 20260717000001 e nunca corrigida —
--      mesma correção já aplicada a catalogo_kit_chaves em
--      20260722010000_fix_pivot_tables_and_cicatrizadores.sql)
--   2) Cria catalogo_kit_cicatrizadores (não existia nenhuma
--      relação N:M entre Kit e Cicatrizador)
-- ============================================================

-- ============================================================
-- 1. catalogo_kit_fresas — converter fresa_id UUID→TEXT + FKs
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_kit_fresas DROP CONSTRAINT IF EXISTS catalogo_kit_fresas_pkey;
  ALTER TABLE catalogo_kit_fresas DROP COLUMN IF EXISTS empresa_id;
  ALTER TABLE catalogo_kit_fresas ALTER COLUMN fresa_id TYPE TEXT;
  ALTER TABLE catalogo_kit_fresas ADD PRIMARY KEY (kit_sku, fresa_id);
  ALTER TABLE catalogo_kit_fresas
    ADD CONSTRAINT fk_kit_fresas_fresa
    FOREIGN KEY (fresa_id) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE;
  ALTER TABLE catalogo_kit_fresas
    ADD CONSTRAINT fk_kit_fresas_kit
    FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'catalogo_kit_fresas: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE catalogo_kit_fresas ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS empresa_select_own ON catalogo_kit_fresas;
  DROP POLICY IF EXISTS empresa_insert_own ON catalogo_kit_fresas;
  DROP POLICY IF EXISTS empresa_delete_own ON catalogo_kit_fresas;
  DROP POLICY IF EXISTS empresa_select_kit_fresas ON catalogo_kit_fresas;
  DROP POLICY IF EXISTS empresa_insert_kit_fresas ON catalogo_kit_fresas;
  DROP POLICY IF EXISTS empresa_delete_kit_fresas ON catalogo_kit_fresas;
  CREATE POLICY empresa_select_kit_fresas ON catalogo_kit_fresas FOR SELECT USING (true);
  CREATE POLICY empresa_insert_kit_fresas ON catalogo_kit_fresas FOR INSERT WITH CHECK (true);
  CREATE POLICY empresa_delete_kit_fresas ON catalogo_kit_fresas FOR DELETE USING (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS catalogo_kit_fresas: %', SQLERRM;
END $$;

-- ============================================================
-- 2. catalogo_kit_cicatrizadores (nova)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_kit_cicatrizadores (
  kit_sku TEXT NOT NULL REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  cicatrizador_sku TEXT NOT NULL REFERENCES catalogo_cicatrizadores(sku) ON DELETE CASCADE,
  PRIMARY KEY (kit_sku, cicatrizador_sku)
);
ALTER TABLE catalogo_kit_cicatrizadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS empresa_select_kit_cicatrizadores ON catalogo_kit_cicatrizadores;
DROP POLICY IF EXISTS empresa_insert_kit_cicatrizadores ON catalogo_kit_cicatrizadores;
DROP POLICY IF EXISTS empresa_delete_kit_cicatrizadores ON catalogo_kit_cicatrizadores;
CREATE POLICY empresa_select_kit_cicatrizadores ON catalogo_kit_cicatrizadores FOR SELECT USING (true);
CREATE POLICY empresa_insert_kit_cicatrizadores ON catalogo_kit_cicatrizadores FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_kit_cicatrizadores ON catalogo_kit_cicatrizadores FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
