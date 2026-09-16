-- ============================================================
-- 20260723010000_add_categoria_tipos_ossos.sql
-- Adiciona coluna categoria (hard/soft) em catalogo_tipos_ossos
-- ============================================================

-- 1. Adicionar coluna categoria
ALTER TABLE catalogo_tipos_ossos ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'hard';

-- 2. Constraint de validação
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_categoria'
  ) THEN
    ALTER TABLE catalogo_tipos_ossos ADD CONSTRAINT chk_categoria CHECK (categoria IN ('hard','soft'));
  END IF;
END $$;

-- 3. Seed: classificar tipos existentes pelas siglas padrão
UPDATE catalogo_tipos_ossos SET categoria = 'hard' WHERE sigla IN ('D1','D2');
UPDATE catalogo_tipos_ossos SET categoria = 'soft' WHERE sigla IN ('D3','D4','D5');
