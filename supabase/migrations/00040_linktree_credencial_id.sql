-- ============================================================
-- Migration 00040: LinkTree - vincular a credenciais existentes
-- ============================================================

-- Adiciona vinculo com credencial
ALTER TABLE linktree_colaboradores
  ADD COLUMN IF NOT EXISTS credencial_id UUID REFERENCES credenciais(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS linktree_colaboradores_credencial_idx ON linktree_colaboradores(credencial_id);

-- Torna created_by nullable (preenche via trigger ou app)
ALTER TABLE linktree_colaboradores
  ALTER COLUMN created_by DROP NOT NULL;

-- Unique constraint: uma credencial so pode ter um linktree
CREATE UNIQUE INDEX IF NOT EXISTS linktree_colaboradores_credencial_unique
  ON linktree_colaboradores(credencial_id)
  WHERE credencial_id IS NOT NULL;
