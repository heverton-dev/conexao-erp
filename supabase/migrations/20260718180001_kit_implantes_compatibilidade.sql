-- ============================================================
-- 20260718180000_kit_implantes_compatibilidade.sql
-- Pivot table: Kit ↔ Implantes (compatibilidade)
-- Nota: Tabela já existe. empresa_id removido (single-tenant).
-- ============================================================

-- 1. Kit ↔ Implantes — garante RLS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='catalogo_kit_implantes') THEN
    ALTER TABLE catalogo_kit_implantes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS empresa_select_kit_implantes ON catalogo_kit_implantes;
    DROP POLICY IF EXISTS empresa_insert_kit_implantes ON catalogo_kit_implantes;
    DROP POLICY IF EXISTS empresa_update_kit_implantes ON catalogo_kit_implantes;
    DROP POLICY IF EXISTS empresa_delete_kit_implantes ON catalogo_kit_implantes;
    CREATE POLICY empresa_select_kit_implantes ON catalogo_kit_implantes FOR SELECT USING (true);
    CREATE POLICY empresa_insert_kit_implantes ON catalogo_kit_implantes FOR INSERT WITH CHECK (true);
    CREATE POLICY empresa_update_kit_implantes ON catalogo_kit_implantes FOR UPDATE USING (true) WITH CHECK (true);
    CREATE POLICY empresa_delete_kit_implantes ON catalogo_kit_implantes FOR DELETE USING (true);
  END IF;
END $$;

-- 2. Índices (empresa_id já removido, só índice de kit_sku)
CREATE INDEX IF NOT EXISTS idx_kit_implantes_kit ON catalogo_kit_implantes(kit_sku);
