-- ============================================================
-- MIGRAÇÃO: Restaurar PKs e FKs do módulo Catálogo
-- Data: 2026-07-22
-- Descrição: Após 20260720020000 (drop empresa_id) e
--            20260721162600 (convert FKs para TEXT),
--            as PKs compostas (sku, empresa_id) foram quebradas
--            e as FK constraints nunca foram re-adicionadas.
--            Sem FK constraints, o PostgREST não resolve joins
--            como `parafuso:catalogo_parafusos(*)`, causando
--            queries vazias no frontend.
-- ============================================================

-- ============================================================
-- 1. PKs em sku (empresa_id foi removido, PKs quebradas)
-- ============================================================
ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS catalogo_abutments_pkey;
ALTER TABLE catalogo_abutments ADD PRIMARY KEY (sku);

ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS catalogo_componentes_pkey;
ALTER TABLE catalogo_componentes ADD PRIMARY KEY (sku);

ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS catalogo_cicatrizadores_pkey;
ALTER TABLE catalogo_cicatrizadores ADD PRIMARY KEY (sku);

ALTER TABLE catalogo_chaves DROP CONSTRAINT IF EXISTS catalogo_chaves_pkey;
ALTER TABLE catalogo_chaves ADD PRIMARY KEY (sku);

ALTER TABLE catalogo_implantes DROP CONSTRAINT IF EXISTS catalogo_implantes_pkey;
ALTER TABLE catalogo_implantes ADD PRIMARY KEY (sku);

ALTER TABLE catalogo_kits DROP CONSTRAINT IF EXISTS catalogo_kits_pkey;
ALTER TABLE catalogo_kits ADD PRIMARY KEY (sku);

-- catalogo_parafusos: PK em id (adicionado em 20260718150000)
-- Mantém PK(id) + UNIQUE(sku) para compatibilidade

-- ============================================================
-- 2. UNIQUE indexes em sku (PostgREST usa para joins)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_abutments_sku ON catalogo_abutments(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_componentes_sku ON catalogo_componentes(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_parafusos_sku ON catalogo_parafusos(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cicatrizadores_sku ON catalogo_cicatrizadores(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chaves_sku ON catalogo_chaves(sku);
CREATE UNIQUE INDEX IF NOT EXISTS idx_implantes_sku ON catalogo_implantes(sku);

-- ============================================================
-- 3. FKs TEXT → sku (parafuso_id, chave_id, implante_id)
-- ============================================================

-- Abutments
ALTER TABLE catalogo_abutments
  ADD CONSTRAINT fk_abutments_parafuso
  FOREIGN KEY (parafuso_id) REFERENCES catalogo_parafusos(sku) ON DELETE SET NULL;

ALTER TABLE catalogo_abutments
  ADD CONSTRAINT fk_abutments_chave
  FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL;

-- Componentes
ALTER TABLE catalogo_componentes
  ADD CONSTRAINT fk_componentes_parafuso
  FOREIGN KEY (parafuso_id) REFERENCES catalogo_parafusos(sku) ON DELETE SET NULL;

ALTER TABLE catalogo_componentes
  ADD CONSTRAINT fk_componentes_chave
  FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL;

-- Parafusos
ALTER TABLE catalogo_parafusos
  ADD CONSTRAINT fk_parafusos_chave
  FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL;

-- Cicatrizadores
ALTER TABLE catalogo_cicatrizadores
  ADD CONSTRAINT fk_cicatrizadores_chave
  FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL;

ALTER TABLE catalogo_cicatrizadores
  ADD CONSTRAINT fk_cicatrizadores_implante
  FOREIGN KEY (implante_id) REFERENCES catalogo_implantes(sku) ON DELETE SET NULL;

-- ============================================================
-- 4. FKs UUID → id (tipos, apenas se não existirem)
-- ============================================================
DO $$ BEGIN
  ALTER TABLE catalogo_abutments ADD CONSTRAINT fk_abutments_tipo_abutment
    FOREIGN KEY (tipo_abutment_id) REFERENCES catalogo_cps_tipos_abutments(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN END $$;

DO $$ BEGIN
  ALTER TABLE catalogo_componentes ADD CONSTRAINT fk_componentes_tipo_componente
    FOREIGN KEY (tipo_componente_id) REFERENCES catalogo_cps_tipos_componentes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN END $$;

DO $$ BEGIN
  ALTER TABLE catalogo_componentes ADD CONSTRAINT fk_componentes_tipo_abutment
    FOREIGN KEY (tipo_abutment_id) REFERENCES catalogo_cps_tipos_abutments(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN END $$;

DO $$ BEGIN
  ALTER TABLE catalogo_parafusos ADD CONSTRAINT fk_parafusos_tipo
    FOREIGN KEY (tipo_parafuso_id) REFERENCES catalogo_cps_tipos_parafusos(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN END $$;

-- ============================================================
-- 5. RELOAD SCHEMA CACHE
-- ============================================================
NOTIFY pgrst, 'reload schema';
