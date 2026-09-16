-- ============================================================
-- Migration 00053: Linktree Empresa (Bio Instagram)
-- ============================================================

-- 1. Config da empresa
CREATE TABLE IF NOT EXISTS linktree_empresa_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  banner_url TEXT,
  theme JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Seções
CREATE TABLE IF NOT EXISTS linktree_empresa_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Links
CREATE TABLE IF NOT EXISTS linktree_empresa_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES linktree_empresa_sections(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  icone TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  agendado_inicio TIMESTAMPTZ,
  agendado_fim TIMESTAMPTZ,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Analytics de cliques
CREATE TABLE IF NOT EXISTS linktree_empresa_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES linktree_empresa_links(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT,
  user_agent TEXT
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS linktree_empresa_config_set_updated_at ON linktree_empresa_config;
CREATE TRIGGER linktree_empresa_config_set_updated_at
  BEFORE UPDATE ON linktree_empresa_config FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_lt_empresa_config_slug ON linktree_empresa_config(slug);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_config_empresa ON linktree_empresa_config(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_sections_empresa ON linktree_empresa_sections(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_links_empresa ON linktree_empresa_links(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_links_section ON linktree_empresa_links(section_id);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_links_ativo ON linktree_empresa_links(empresa_id, ativo);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_clicks_link ON linktree_empresa_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_clicks_empresa ON linktree_empresa_clicks(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lt_empresa_clicks_data ON linktree_empresa_clicks(empresa_id, clicked_at);

-- RLS
ALTER TABLE linktree_empresa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE linktree_empresa_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE linktree_empresa_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE linktree_empresa_clicks ENABLE ROW LEVEL SECURITY;

-- Policies: config (público SELECT para página pública)
DROP POLICY IF EXISTS lt_empresa_config_select ON linktree_empresa_config;
CREATE POLICY lt_empresa_config_select ON linktree_empresa_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS lt_empresa_config_insert ON linktree_empresa_config;
CREATE POLICY lt_empresa_config_insert ON linktree_empresa_config
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS lt_empresa_config_update ON linktree_empresa_config;
CREATE POLICY lt_empresa_config_update ON linktree_empresa_config
  FOR UPDATE TO authenticated USING (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  ) WITH CHECK (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

-- Policies: sections (público SELECT)
DROP POLICY IF EXISTS lt_empresa_sections_select ON linktree_empresa_sections;
CREATE POLICY lt_empresa_sections_select ON linktree_empresa_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS lt_empresa_sections_insert ON linktree_empresa_sections;
CREATE POLICY lt_empresa_sections_insert ON linktree_empresa_sections
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS lt_empresa_sections_update ON linktree_empresa_sections;
CREATE POLICY lt_empresa_sections_update ON linktree_empresa_sections
  FOR UPDATE TO authenticated USING (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS lt_empresa_sections_delete ON linktree_empresa_sections;
CREATE POLICY lt_empresa_sections_delete ON linktree_empresa_sections
  FOR DELETE TO authenticated USING (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

-- Policies: links (público SELECT)
DROP POLICY IF EXISTS lt_empresa_links_select ON linktree_empresa_links;
CREATE POLICY lt_empresa_links_select ON linktree_empresa_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS lt_empresa_links_insert ON linktree_empresa_links;
CREATE POLICY lt_empresa_links_insert ON linktree_empresa_links
  FOR INSERT TO authenticated WITH CHECK (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS lt_empresa_links_update ON linktree_empresa_links;
CREATE POLICY lt_empresa_links_update ON linktree_empresa_links
  FOR UPDATE TO authenticated USING (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS lt_empresa_links_delete ON linktree_empresa_links;
CREATE POLICY lt_empresa_links_delete ON linktree_empresa_links
  FOR DELETE TO authenticated USING (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

-- Policies: clicks (INSERT público, SELECT autenticado)
DROP POLICY IF EXISTS lt_empresa_clicks_select ON linktree_empresa_clicks;
CREATE POLICY lt_empresa_clicks_select ON linktree_empresa_clicks
  FOR SELECT TO authenticated USING (
    is_super_admin_session() OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS lt_empresa_clicks_insert ON linktree_empresa_clicks;
CREATE POLICY lt_empresa_clicks_insert ON linktree_empresa_clicks
  FOR INSERT WITH CHECK (true);

-- Grants
GRANT SELECT ON linktree_empresa_config TO anon;
GRANT SELECT, INSERT, UPDATE ON linktree_empresa_config TO authenticated;
GRANT ALL ON linktree_empresa_config TO service_role;

GRANT SELECT ON linktree_empresa_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON linktree_empresa_sections TO authenticated;
GRANT ALL ON linktree_empresa_sections TO service_role;

GRANT SELECT ON linktree_empresa_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON linktree_empresa_links TO authenticated;
GRANT ALL ON linktree_empresa_links TO service_role;

GRANT SELECT, INSERT ON linktree_empresa_clicks TO anon;
GRANT SELECT, INSERT ON linktree_empresa_clicks TO authenticated;
GRANT ALL ON linktree_empresa_clicks TO service_role;
