-- ============================================================
-- Migration: Create funis_templates and related tables
-- ============================================================

-- 1. Tabela: funis_templates
CREATE TABLE IF NOT EXISTS funis_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela: funis_template_cols (colunas do template)
CREATE TABLE IF NOT EXISTS funis_template_cols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES funis_templates(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  posicao INTEGER NOT NULL DEFAULT 0
);

-- 3. Tabela: funis_template_tasks (tarefas do template)
CREATE TABLE IF NOT EXISTS funis_template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES funis_templates(id) ON DELETE CASCADE,
  template_col_idx INTEGER NOT NULL DEFAULT 0,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade TEXT CHECK (prioridade IN ('low','medium','high','urgent')) DEFAULT 'medium',
  posicao INTEGER NOT NULL DEFAULT 0
);

-- Índices
CREATE INDEX IF NOT EXISTS funis_templates_empresa_idx ON funis_templates(empresa_id);
CREATE INDEX IF NOT EXISTS funis_templates_created_by_idx ON funis_templates(created_by);
CREATE INDEX IF NOT EXISTS funis_template_cols_template_idx ON funis_template_cols(template_id, posicao);
CREATE INDEX IF NOT EXISTS funis_template_tasks_template_idx ON funis_template_tasks(template_id);

-- RLS
ALTER TABLE funis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funis_template_cols ENABLE ROW LEVEL SECURITY;
ALTER TABLE funis_template_tasks ENABLE ROW LEVEL SECURITY;

-- Policies: funis_templates
DROP POLICY IF EXISTS funis_templates_select_auth ON funis_templates;
CREATE POLICY funis_templates_select_auth ON funis_templates
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
    OR empresa_id = get_current_empresa_id()
    OR is_public = true
  );

DROP POLICY IF EXISTS funis_templates_insert_auth ON funis_templates;
CREATE POLICY funis_templates_insert_auth ON funis_templates
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS funis_templates_update_auth ON funis_templates;
CREATE POLICY funis_templates_update_auth ON funis_templates
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS funis_templates_delete_auth ON funis_templates;
CREATE POLICY funis_templates_delete_auth ON funis_templates
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

-- Policies: funis_template_cols (herda do template)
DROP POLICY IF EXISTS funis_template_cols_select_auth ON funis_template_cols;
CREATE POLICY funis_template_cols_select_auth ON funis_template_cols
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM funis_templates WHERE funis_templates.id = funis_template_cols.template_id)
  );

DROP POLICY IF EXISTS funis_template_cols_insert_auth ON funis_template_cols;
CREATE POLICY funis_template_cols_insert_auth ON funis_template_cols
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM funis_templates WHERE funis_templates.id = funis_template_cols.template_id AND funis_templates.created_by = auth.uid())
  );

DROP POLICY IF EXISTS funis_template_cols_delete_auth ON funis_template_cols;
CREATE POLICY funis_template_cols_delete_auth ON funis_template_cols
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM funis_templates WHERE funis_templates.id = funis_template_cols.template_id AND funis_templates.created_by = auth.uid())
  );

-- Policies: funis_template_tasks (herda do template)
DROP POLICY IF EXISTS funis_template_tasks_select_auth ON funis_template_tasks;
CREATE POLICY funis_template_tasks_select_auth ON funis_template_tasks
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM funis_templates WHERE funis_templates.id = funis_template_tasks.template_id)
  );

DROP POLICY IF EXISTS funis_template_tasks_insert_auth ON funis_template_tasks;
CREATE POLICY funis_template_tasks_insert_auth ON funis_template_tasks
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM funis_templates WHERE funis_templates.id = funis_template_tasks.template_id AND funis_templates.created_by = auth.uid())
  );

DROP POLICY IF EXISTS funis_template_tasks_delete_auth ON funis_template_tasks;
CREATE POLICY funis_template_tasks_delete_auth ON funis_template_tasks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM funis_templates WHERE funis_templates.id = funis_template_tasks.template_id AND funis_templates.created_by = auth.uid())
  );

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON funis_templates TO authenticated;
GRANT ALL ON funis_templates TO service_role;

GRANT SELECT, INSERT, DELETE ON funis_template_cols TO authenticated;
GRANT ALL ON funis_template_cols TO service_role;

GRANT SELECT, INSERT, DELETE ON funis_template_tasks TO authenticated;
GRANT ALL ON funis_template_tasks TO service_role;
