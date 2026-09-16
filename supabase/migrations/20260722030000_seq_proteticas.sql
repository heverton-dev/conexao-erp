-- ============================================================
-- Migration: Tabelas para Sequências Protéticas
-- Data: 2026-07-22
-- Tabela principal + pivots N:M (abutments, etapas, componentes)
-- ============================================================

-- 1. Tabela principal
CREATE TABLE IF NOT EXISTS catalogo_seq_proteticas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sigla text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE catalogo_seq_proteticas ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresa_select_own ON catalogo_seq_proteticas FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_proteticas FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_update_own ON catalogo_seq_proteticas FOR UPDATE USING (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_proteticas FOR DELETE USING (true);

-- 2. Seq Protetica <-> Abutments (N:M)
CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_abutments (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  abutment_sku text NOT NULL REFERENCES catalogo_abutments(sku) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, abutment_sku)
);
ALTER TABLE catalogo_seq_protetica_abutments ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresa_select_own ON catalogo_seq_protetica_abutments FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_abutments FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_abutments FOR DELETE USING (true);

-- 3. Seq Protetica <-> Etapas Workflow (N:M)
CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_etapas (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  etapa_id uuid NOT NULL REFERENCES catalogo_cps_etapas_workflows(id) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, etapa_id)
);
ALTER TABLE catalogo_seq_protetica_etapas ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresa_select_own ON catalogo_seq_protetica_etapas FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_etapas FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_etapas FOR DELETE USING (true);

-- 4. Seq Protetica <-> Componentes (N:M via SKU)
CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_componentes (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  componente_sku text NOT NULL REFERENCES catalogo_componentes(sku) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, componente_sku)
);
ALTER TABLE catalogo_seq_protetica_componentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY empresa_select_own ON catalogo_seq_protetica_componentes FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_componentes FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_componentes FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
