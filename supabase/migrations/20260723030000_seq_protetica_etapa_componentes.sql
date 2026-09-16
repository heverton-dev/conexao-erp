-- ============================================================
-- Migration: Tabela pivô Etapa <-> Componentes dentro de Sequência
-- Data: 2026-07-23
-- Cada etapa de uma sequência protética tem seus próprios componentes
-- ============================================================

CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_etapa_componentes (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  etapa_id uuid NOT NULL REFERENCES catalogo_cps_etapas_workflows(id) ON DELETE CASCADE,
  componente_sku text NOT NULL REFERENCES catalogo_componentes(sku) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, etapa_id, componente_sku)
);

ALTER TABLE catalogo_seq_protetica_etapa_componentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS empresa_select_own ON catalogo_seq_protetica_etapa_componentes;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_seq_protetica_etapa_componentes;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_seq_protetica_etapa_componentes;

CREATE POLICY empresa_select_own ON catalogo_seq_protetica_etapa_componentes FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_etapa_componentes FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_etapa_componentes FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
