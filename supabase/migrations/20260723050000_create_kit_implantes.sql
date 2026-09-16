-- ============================================================
-- Pivot table: Kit ↔ Implantes (compatibilidade)
-- ============================================================

CREATE TABLE IF NOT EXISTS catalogo_kit_implantes (
  kit_sku   text NOT NULL REFERENCES catalogo_kits_v2(sku) ON DELETE CASCADE,
  implante_sku text NOT NULL REFERENCES catalogo_implantes(sku) ON DELETE CASCADE,
  PRIMARY KEY (kit_sku, implante_sku)
);

ALTER TABLE catalogo_kit_implantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS empresa_select_kit_implantes ON catalogo_kit_implantes;
DROP POLICY IF EXISTS empresa_insert_kit_implantes ON catalogo_kit_implantes;
DROP POLICY IF EXISTS empresa_update_kit_implantes ON catalogo_kit_implantes;
DROP POLICY IF EXISTS empresa_delete_kit_implantes ON catalogo_kit_implantes;

CREATE POLICY empresa_select_kit_implantes ON catalogo_kit_implantes FOR SELECT USING (true);
CREATE POLICY empresa_insert_kit_implantes ON catalogo_kit_implantes FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_update_kit_implantes ON catalogo_kit_implantes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY empresa_delete_kit_implantes ON catalogo_kit_implantes FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_kit_implantes_kit ON catalogo_kit_implantes(kit_sku);
CREATE INDEX IF NOT EXISTS idx_kit_implantes_implante ON catalogo_kit_implantes(implante_sku);
