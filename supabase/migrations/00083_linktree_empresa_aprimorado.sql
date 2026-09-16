-- ============================================================
-- Migration 00083: Linktree Empresa — Aprimoramento
-- ============================================================

-- 1. Adicionar avatar_url na config da empresa
ALTER TABLE linktree_empresa_config
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Adicionar novas colunas nos links
ALTER TABLE linktree_empresa_links
  ADD COLUMN IF NOT EXISTS descricao TEXT,
  ADD COLUMN IF NOT EXISTS imagem_url TEXT,
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;

-- 3. Adicionar imagem_url nas secoes
ALTER TABLE linktree_empresa_sections
  ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 4. Constraint para tipo valido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'linktree_empresa_links_tipo_check'
  ) THEN
    ALTER TABLE linktree_empresa_links
      ADD CONSTRAINT linktree_empresa_links_tipo_check
      CHECK (tipo IN ('link', 'image', 'inline_image'));
  END IF;
END $$;
