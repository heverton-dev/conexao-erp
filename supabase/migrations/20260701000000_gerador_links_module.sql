-- ============================================================
-- Migration 20260701000000: Módulo Gerador de Links
-- Tabelas: gerador_links, gerador_templates
-- ============================================================

-- ============================================================
-- 1. gerador_links (links gerados e salvos)
-- ============================================================
CREATE TABLE IF NOT EXISTS gerador_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp','utm','google_review','google_maps','waze')),
  titulo TEXT NOT NULL,
  url_gerada TEXT NOT NULL,
  params JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. gerador_templates (modelos de mensagem / presets UTM)
-- ============================================================
CREATE TABLE IF NOT EXISTS gerador_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp_msg','utm_preset')),
  nome TEXT NOT NULL,
  conteudo JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE gerador_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gerador_templates ENABLE ROW LEVEL SECURITY;

-- gerador_links: select
CREATE POLICY "gerador_links_select_empresa"
  ON gerador_links FOR SELECT
  USING (is_super_admin_session() OR empresa_id = get_current_empresa_id());

-- gerador_links: insert
CREATE POLICY "gerador_links_insert_empresa"
  ON gerador_links FOR INSERT
  WITH CHECK (empresa_id = get_current_empresa_id());

-- gerador_links: update
CREATE POLICY "gerador_links_update_empresa"
  ON gerador_links FOR UPDATE
  USING (is_super_admin_session() OR empresa_id = get_current_empresa_id());

-- gerador_links: delete
CREATE POLICY "gerador_links_delete_empresa"
  ON gerador_links FOR DELETE
  USING (is_super_admin_session() OR empresa_id = get_current_empresa_id());

-- gerador_templates: select
CREATE POLICY "gerador_templates_select_empresa"
  ON gerador_templates FOR SELECT
  USING (is_super_admin_session() OR empresa_id = get_current_empresa_id());

-- gerador_templates: insert
CREATE POLICY "gerador_templates_insert_empresa"
  ON gerador_templates FOR INSERT
  WITH CHECK (empresa_id = get_current_empresa_id());

-- gerador_templates: update
CREATE POLICY "gerador_templates_update_empresa"
  ON gerador_templates FOR UPDATE
  USING (is_super_admin_session() OR empresa_id = get_current_empresa_id());

-- gerador_templates: delete
CREATE POLICY "gerador_templates_delete_empresa"
  ON gerador_templates FOR DELETE
  USING (is_super_admin_session() OR empresa_id = get_current_empresa_id());

-- ============================================================
-- Grants
-- ============================================================
GRANT ALL ON gerador_links TO authenticated, service_role;
GRANT ALL ON gerador_templates TO authenticated, service_role;
