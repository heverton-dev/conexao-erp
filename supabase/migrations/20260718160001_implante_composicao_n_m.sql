-- ============================================================
-- Migration: Tabelas N:M para composição de implantes
-- Data: 2026-07-18
-- Nota: Tabelas já existem (criadas em migrations anteriores).
--       empresa_id já foi removido (sistema single-tenant).
--       Esta migration garante que RLS esteja configurado.
-- ============================================================

-- 1. Implante <-> Kit (N:M) — tabela já existe, garante RLS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='catalogo_implante_kit') THEN
    ALTER TABLE catalogo_implante_kit ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS empresa_select_own ON catalogo_implante_kit;
    DROP POLICY IF EXISTS empresa_insert_own ON catalogo_implante_kit;
    DROP POLICY IF EXISTS empresa_delete_own ON catalogo_implante_kit;
    CREATE POLICY empresa_select_own ON catalogo_implante_kit FOR SELECT USING (true);
    CREATE POLICY empresa_insert_own ON catalogo_implante_kit FOR INSERT WITH CHECK (true);
    CREATE POLICY empresa_delete_own ON catalogo_implante_kit FOR DELETE USING (true);
  END IF;
END $$;

-- 2. Implante <-> Abutment (N:M) — tabela já existe, garante RLS
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='catalogo_implante_abutment') THEN
    ALTER TABLE catalogo_implante_abutment ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS empresa_select_own ON catalogo_implante_abutment;
    DROP POLICY IF EXISTS empresa_insert_own ON catalogo_implante_abutment;
    DROP POLICY IF EXISTS empresa_delete_own ON catalogo_implante_abutment;
    CREATE POLICY empresa_select_own ON catalogo_implante_abutment FOR SELECT USING (true);
    CREATE POLICY empresa_insert_own ON catalogo_implante_abutment FOR INSERT WITH CHECK (true);
    CREATE POLICY empresa_delete_own ON catalogo_implante_abutment FOR DELETE USING (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
