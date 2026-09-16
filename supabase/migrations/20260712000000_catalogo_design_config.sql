-- Migration: catalogo_design_config
-- Cria tabela para personalização de design do catálogo por empresa

CREATE TABLE IF NOT EXISTS catalogo_design_config (
  empresa_id UUID PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE catalogo_design_config ENABLE ROW LEVEL SECURITY;

-- Empresa vê apenas sua própria config
CREATE POLICY "empresa_select_own" ON catalogo_design_config
  FOR SELECT USING (empresa_id = (
    SELECT empresa_id FROM profiles WHERE id = auth.uid()
  ));

-- Empresa pode inserir/atualizar sua própria config
CREATE POLICY "empresa_upsert_own" ON catalogo_design_config
  FOR ALL USING (empresa_id = (
    SELECT empresa_id FROM profiles WHERE id = auth.uid()
  ));

-- Super admin pode tudo
CREATE POLICY "super_admin_all" ON catalogo_design_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );
