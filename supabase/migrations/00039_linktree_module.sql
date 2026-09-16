-- ============================================================
-- Migration 00039: Módulo LinkTree Corporativo
-- ============================================================

-- 1. Tabela: linktree_colaboradores
CREATE TABLE IF NOT EXISTS linktree_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  telefone_fixo TEXT,
  foto_url TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela: linktree_tema_config
CREATE TABLE IF NOT EXISTS linktree_tema_config (
  id TEXT PRIMARY KEY,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS linktree_colaboradores_set_updated_at ON linktree_colaboradores;
CREATE TRIGGER linktree_colaboradores_set_updated_at
  BEFORE UPDATE ON linktree_colaboradores FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS linktree_tema_config_set_updated_at ON linktree_tema_config;
CREATE TRIGGER linktree_tema_config_set_updated_at
  BEFORE UPDATE ON linktree_tema_config FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS linktree_colaboradores_empresa_idx ON linktree_colaboradores(empresa_id);
CREATE INDEX IF NOT EXISTS linktree_colaboradores_created_by_idx ON linktree_colaboradores(created_by);
CREATE INDEX IF NOT EXISTS linktree_colaboradores_status_idx ON linktree_colaboradores(status);
CREATE INDEX IF NOT EXISTS linktree_tema_config_empresa_idx ON linktree_tema_config(empresa_id);

-- RLS
ALTER TABLE linktree_colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE linktree_tema_config ENABLE ROW LEVEL SECURITY;

-- Policies: linktree_colaboradores
DROP POLICY IF EXISTS linktree_colaboradores_select_auth ON linktree_colaboradores;
CREATE POLICY linktree_colaboradores_select_auth ON linktree_colaboradores
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS linktree_colaboradores_insert_auth ON linktree_colaboradores;
CREATE POLICY linktree_colaboradores_insert_auth ON linktree_colaboradores
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS linktree_colaboradores_update_auth ON linktree_colaboradores;
CREATE POLICY linktree_colaboradores_update_auth ON linktree_colaboradores
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS linktree_colaboradores_delete_auth ON linktree_colaboradores;
CREATE POLICY linktree_colaboradores_delete_auth ON linktree_colaboradores
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

-- Policies: linktree_tema_config (público para leitura, admin para escrita)
DROP POLICY IF EXISTS linktree_tema_config_select_public ON linktree_tema_config;
CREATE POLICY linktree_tema_config_select_public ON linktree_tema_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS linktree_tema_config_insert_auth ON linktree_tema_config;
CREATE POLICY linktree_tema_config_insert_auth ON linktree_tema_config
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS linktree_tema_config_update_auth ON linktree_tema_config;
CREATE POLICY linktree_tema_config_update_auth ON linktree_tema_config
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policies: linktree_colaboradores (acesso anônico para página pública)
DROP POLICY IF EXISTS linktree_colaboradores_select_anon ON linktree_colaboradores;
CREATE POLICY linktree_colaboradores_select_anon ON linktree_colaboradores
  FOR SELECT USING (status = 'ativo');

-- Grants
GRANT SELECT ON linktree_colaboradores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON linktree_colaboradores TO authenticated;
GRANT ALL ON linktree_colaboradores TO service_role;

GRANT SELECT ON linktree_tema_config TO anon;
GRANT SELECT, INSERT, UPDATE ON linktree_tema_config TO authenticated;
GRANT ALL ON linktree_tema_config TO service_role;
