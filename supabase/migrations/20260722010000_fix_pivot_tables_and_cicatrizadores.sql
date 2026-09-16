-- ============================================================
-- MIGRAÇÃO: Corrigir pivot tables e cicatrizadores
-- Data: 2026-07-22
-- Descrição: As tabelas N:M existem como SINGULARES no banco:
--   catalogo_implante_kit, catalogo_implante_abutment,
--   catalogo_implante_chaves, catalogo_kit_chaves.
-- Esta migration:
--   1) Converte chave_id de UUID→TEXT (PK é sku, não id)
--   2) Converte implante_id de UUID→TEXT nas cicatrizadores
--   3) Remove empresa_id das PKs (single-tenant)
--   4) Recria FKs referenciando sku
--   5) Corrige FK familia_id faltante em abutments
--   6) Garante RLS policies (single-tenant)
-- ============================================================

-- ============================================================
-- 1. catalogo_implante_chaves — converter chave_id UUID→TEXT
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_implante_chaves DROP CONSTRAINT IF EXISTS catalogo_implante_chaves_pkey;
  ALTER TABLE catalogo_implante_chaves DROP CONSTRAINT IF EXISTS fk_implante_chaves_chave;
  ALTER TABLE catalogo_implante_chaves DROP COLUMN IF EXISTS empresa_id;
  ALTER TABLE catalogo_implante_chaves ALTER COLUMN chave_id TYPE TEXT;
  ALTER TABLE catalogo_implante_chaves ADD PRIMARY KEY (implante_sku, chave_id);
  ALTER TABLE catalogo_implante_chaves
    ADD CONSTRAINT fk_implante_chaves_chave
    FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'catalogo_implante_chaves: %', SQLERRM;
END $$;

-- ============================================================
-- 2. catalogo_implante_kit (singular — nome correto no banco)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_implante_kit DROP CONSTRAINT IF EXISTS catalogo_implante_kit_pkey;
  ALTER TABLE catalogo_implante_kit DROP COLUMN IF EXISTS empresa_id;
  ALTER TABLE catalogo_implante_kit ADD PRIMARY KEY (implante_sku, kit_sku);
  ALTER TABLE catalogo_implante_kit
    ADD CONSTRAINT fk_implante_kit_kit
    FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'catalogo_implante_kit: %', SQLERRM;
END $$;

-- ============================================================
-- 3. catalogo_implante_abutment (singular — nome correto no banco)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_implante_abutment DROP CONSTRAINT IF EXISTS catalogo_implante_abutment_pkey;
  ALTER TABLE catalogo_implante_abutment DROP COLUMN IF EXISTS empresa_id;
  ALTER TABLE catalogo_implante_abutment ADD PRIMARY KEY (implante_sku, abutment_sku);
  ALTER TABLE catalogo_implante_abutment
    ADD CONSTRAINT fk_implante_abutment_abutment
    FOREIGN KEY (abutment_sku) REFERENCES catalogo_abutments(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'catalogo_implante_abutment: %', SQLERRM;
END $$;

-- 3b. FK familia_id faltante em abutments (PostgREST precisa dela para embeds)
DO $$ BEGIN
  ALTER TABLE catalogo_abutments
    ADD CONSTRAINT fk_abutments_familia
    FOREIGN KEY (familia_id) REFERENCES catalogo_ips_familias(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'fk_abutments_familia: %', SQLERRM;
END $$;

-- ============================================================
-- 4. catalogo_kit_chaves — converter chave_id UUID→TEXT
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_kit_chaves DROP CONSTRAINT IF EXISTS catalogo_kit_chaves_pkey;
  ALTER TABLE catalogo_kit_chaves DROP COLUMN IF EXISTS empresa_id;
  ALTER TABLE catalogo_kit_chaves ALTER COLUMN chave_id TYPE TEXT;
  ALTER TABLE catalogo_kit_chaves ADD PRIMARY KEY (kit_sku, chave_id);
  ALTER TABLE catalogo_kit_chaves
    ADD CONSTRAINT fk_kit_chaves_chave
    FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE CASCADE;
  ALTER TABLE catalogo_kit_chaves
    ADD CONSTRAINT fk_kit_chaves_kit
    FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'catalogo_kit_chaves: %', SQLERRM;
END $$;

-- ============================================================
-- 5. catalogo_cicatrizadores — converter implante_id e chave_id
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_cicatrizadores ALTER COLUMN implante_id TYPE TEXT;
  ALTER TABLE catalogo_cicatrizadores ALTER COLUMN chave_id TYPE TEXT;

  ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS fk_cicatrizadores_implante;
  ALTER TABLE catalogo_cicatrizadores
    ADD CONSTRAINT fk_cicatrizadores_implante
    FOREIGN KEY (implante_id) REFERENCES catalogo_implantes(sku) ON DELETE SET NULL;

  ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS fk_cicatrizadores_chave;
  ALTER TABLE catalogo_cicatrizadores
    ADD CONSTRAINT fk_cicatrizadores_chave
    FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'catalogo_cicatrizadores: %', SQLERRM;
END $$;

-- ============================================================
-- 6. RLS policies (single-tenant: policies abertas)
-- ============================================================
DO $$ BEGIN
  -- implante_chaves
  ALTER TABLE catalogo_implante_chaves ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS empresa_select_own ON catalogo_implante_chaves;
  DROP POLICY IF EXISTS empresa_insert_own ON catalogo_implante_chaves;
  DROP POLICY IF EXISTS empresa_delete_own ON catalogo_implante_chaves;
  CREATE POLICY empresa_select_implante_chaves ON catalogo_implante_chaves FOR SELECT USING (true);
  CREATE POLICY empresa_insert_implante_chaves ON catalogo_implante_chaves FOR INSERT WITH CHECK (true);
  CREATE POLICY empresa_delete_implante_chaves ON catalogo_implante_chaves FOR DELETE USING (true);

  -- implante_kit
  ALTER TABLE catalogo_implante_kit ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS empresa_select_own ON catalogo_implante_kit;
  DROP POLICY IF EXISTS empresa_insert_own ON catalogo_implante_kit;
  DROP POLICY IF EXISTS empresa_delete_own ON catalogo_implante_kit;
  DROP POLICY IF EXISTS empresa_select_implante_kits ON catalogo_implante_kit;
  CREATE POLICY empresa_select_implante_kit ON catalogo_implante_kit FOR SELECT USING (true);
  CREATE POLICY empresa_insert_implante_kit ON catalogo_implante_kit FOR INSERT WITH CHECK (true);
  CREATE POLICY empresa_delete_implante_kit ON catalogo_implante_kit FOR DELETE USING (true);

  -- implante_abutment
  ALTER TABLE catalogo_implante_abutment ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS empresa_select_own ON catalogo_implante_abutment;
  DROP POLICY IF EXISTS empresa_insert_own ON catalogo_implante_abutment;
  DROP POLICY IF EXISTS empresa_delete_own ON catalogo_implante_abutment;
  DROP POLICY IF EXISTS empresa_select_implante_abutments ON catalogo_implante_abutment;
  CREATE POLICY empresa_select_implante_abutment ON catalogo_implante_abutment FOR SELECT USING (true);
  CREATE POLICY empresa_insert_implante_abutment ON catalogo_implante_abutment FOR INSERT WITH CHECK (true);
  CREATE POLICY empresa_delete_implante_abutment ON catalogo_implante_abutment FOR DELETE USING (true);

  -- kit_chaves
  ALTER TABLE catalogo_kit_chaves ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS empresa_select_own ON catalogo_kit_chaves;
  DROP POLICY IF EXISTS empresa_insert_own ON catalogo_kit_chaves;
  DROP POLICY IF EXISTS empresa_delete_own ON catalogo_kit_chaves;
  CREATE POLICY empresa_select_kit_chaves ON catalogo_kit_chaves FOR SELECT USING (true);
  CREATE POLICY empresa_insert_kit_chaves ON catalogo_kit_chaves FOR INSERT WITH CHECK (true);
  CREATE POLICY empresa_delete_kit_chaves ON catalogo_kit_chaves FOR DELETE USING (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'RLS: %', SQLERRM;
END $$;

-- ============================================================
-- 7. RELOAD SCHEMA CACHE
-- ============================================================
NOTIFY pgrst, 'reload schema';
