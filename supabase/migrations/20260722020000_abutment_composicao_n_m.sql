-- ============================================================
-- Migration: Tabelas N:M para composição de abutments
-- Data: 2026-07-22
-- Cria pivot tables: abutment_chaves, abutment_kits, abutment_parafusos
-- ============================================================

-- 1. Abutment <-> Chaves (N:M)
CREATE TABLE IF NOT EXISTS catalogo_abutment_chaves (
  abutment_sku text NOT NULL REFERENCES catalogo_abutments(sku) ON DELETE CASCADE,
  chave_id uuid NOT NULL REFERENCES catalogo_chaves(id) ON DELETE CASCADE,
  PRIMARY KEY (abutment_sku, chave_id)
);
ALTER TABLE catalogo_abutment_chaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS empresa_select_own ON catalogo_abutment_chaves;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_abutment_chaves;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_abutment_chaves;
CREATE POLICY empresa_select_own ON catalogo_abutment_chaves FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_abutment_chaves FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_abutment_chaves FOR DELETE USING (true);

-- 2. Abutment <-> Kits (N:M)
CREATE TABLE IF NOT EXISTS catalogo_abutment_kits (
  abutment_sku text NOT NULL REFERENCES catalogo_abutments(sku) ON DELETE CASCADE,
  kit_sku text NOT NULL REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  PRIMARY KEY (abutment_sku, kit_sku)
);
ALTER TABLE catalogo_abutment_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS empresa_select_own ON catalogo_abutment_kits;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_abutment_kits;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_abutment_kits;
CREATE POLICY empresa_select_own ON catalogo_abutment_kits FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_abutment_kits FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_abutment_kits FOR DELETE USING (true);

-- 3. Abutment <-> Parafusos (N:M)
CREATE TABLE IF NOT EXISTS catalogo_abutment_parafusos (
  abutment_sku text NOT NULL REFERENCES catalogo_abutments(sku) ON DELETE CASCADE,
  parafuso_sku text NOT NULL REFERENCES catalogo_parafusos(sku) ON DELETE CASCADE,
  PRIMARY KEY (abutment_sku, parafuso_sku)
);
ALTER TABLE catalogo_abutment_parafusos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS empresa_select_own ON catalogo_abutment_parafusos;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_abutment_parafusos;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_abutment_parafusos;
CREATE POLICY empresa_select_own ON catalogo_abutment_parafusos FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_abutment_parafusos FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_abutment_parafusos FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
