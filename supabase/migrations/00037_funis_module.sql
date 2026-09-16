-- ============================================================
-- Migration 00037: Módulo Funis (Kanban)
-- ============================================================

-- 1. Tabela: funis (boards)
CREATE TABLE IF NOT EXISTS funis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela: funis_colunas
CREATE TABLE IF NOT EXISTS funis_colunas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funil_id UUID NOT NULL REFERENCES funis(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  posicao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela: funis_tarefas
CREATE TABLE IF NOT EXISTS funis_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funil_id UUID NOT NULL REFERENCES funis(id) ON DELETE CASCADE,
  coluna_id UUID NOT NULL REFERENCES funis_colunas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  posicao INTEGER NOT NULL DEFAULT 0,
  prioridade TEXT CHECK (prioridade IN ('low','medium','high','urgent')) DEFAULT 'medium',
  atribuido_para UUID REFERENCES auth.users(id),
  tools TEXT[] DEFAULT '{}',
  data_inicio DATE,
  data_fim DATE,
  depende_tarefa_id UUID REFERENCES funis_tarefas(id),
  parent_task_id UUID REFERENCES funis_tarefas(id),
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela: funis_permissoes (acesso granular por funil)
CREATE TABLE IF NOT EXISTS funis_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funil_id UUID NOT NULL REFERENCES funis(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  nivel TEXT CHECK (nivel IN ('view','edit')) NOT NULL DEFAULT 'view',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(funil_id, user_id)
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS funis_set_updated_at ON funis;
CREATE TRIGGER funis_set_updated_at
  BEFORE UPDATE ON funis FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS funis_tarefas_set_updated_at ON funis_tarefas;
CREATE TRIGGER funis_tarefas_set_updated_at
  BEFORE UPDATE ON funis_tarefas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: auto-criar 4 colunas padrão no INSERT de funil
CREATE OR REPLACE FUNCTION criar_colunas_padrao_funil()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO funis_colunas (funil_id, titulo, posicao) VALUES
    (NEW.id, 'Backlog', 0),
    (NEW.id, 'Em andamento', 1),
    (NEW.id, 'Revisão', 2),
    (NEW.id, 'Concluído', 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_funis_colunas_padrao ON funis;
CREATE TRIGGER trg_funis_colunas_padrao
  AFTER INSERT ON funis
  FOR EACH ROW EXECUTE FUNCTION criar_colunas_padrao_funil();

-- Índices
CREATE INDEX IF NOT EXISTS funis_empresa_idx ON funis(empresa_id);
CREATE INDEX IF NOT EXISTS funis_created_by_idx ON funis(created_by);
CREATE INDEX IF NOT EXISTS funis_colunas_funil_idx ON funis_colunas(funil_id, posicao);
CREATE INDEX IF NOT EXISTS funis_tarefas_coluna_idx ON funis_tarefas(coluna_id, posicao);
CREATE INDEX IF NOT EXISTS funis_tarefas_funil_idx ON funis_tarefas(funil_id);
CREATE INDEX IF NOT EXISTS funis_permissoes_funil_idx ON funis_permissoes(funil_id);
CREATE INDEX IF NOT EXISTS funis_permissoes_user_idx ON funis_permissoes(user_id);

-- RLS
ALTER TABLE funis ENABLE ROW LEVEL SECURITY;
ALTER TABLE funis_colunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funis_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funis_permissoes ENABLE ROW LEVEL SECURITY;

-- Policies: funis
DROP POLICY IF EXISTS funis_select_auth ON funis;
CREATE POLICY funis_select_auth ON funis
  FOR SELECT TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
    OR empresa_id = get_current_empresa_id()
  );

DROP POLICY IF EXISTS funis_insert_auth ON funis;
CREATE POLICY funis_insert_auth ON funis
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS funis_update_auth ON funis;
CREATE POLICY funis_update_auth ON funis
  FOR UPDATE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  ) WITH CHECK (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS funis_delete_auth ON funis;
CREATE POLICY funis_delete_auth ON funis
  FOR DELETE TO authenticated USING (
    is_super_admin_session()
    OR created_by = auth.uid()
  );

-- Policies: funis_colunas (herda do funil)
DROP POLICY IF EXISTS funis_colunas_select_auth ON funis_colunas;
CREATE POLICY funis_colunas_select_auth ON funis_colunas
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_colunas.funil_id)
  );

DROP POLICY IF EXISTS funis_colunas_insert_auth ON funis_colunas;
CREATE POLICY funis_colunas_insert_auth ON funis_colunas
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_colunas.funil_id AND funis.created_by = auth.uid())
  );

DROP POLICY IF EXISTS funis_colunas_update_auth ON funis_colunas;
CREATE POLICY funis_colunas_update_auth ON funis_colunas
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_colunas.funil_id AND funis.created_by = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_colunas.funil_id AND funis.created_by = auth.uid())
  );

DROP POLICY IF EXISTS funis_colunas_delete_auth ON funis_colunas;
CREATE POLICY funis_colunas_delete_auth ON funis_colunas
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_colunas.funil_id AND funis.created_by = auth.uid())
  );

-- Policies: funis_tarefas (herda do funil via coluna)
DROP POLICY IF EXISTS funis_tarefas_select_auth ON funis_tarefas;
CREATE POLICY funis_tarefas_select_auth ON funis_tarefas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM funis_colunas fc
      JOIN funis f ON f.id = fc.funil_id
      WHERE fc.id = funis_tarefas.coluna_id
    )
  );

DROP POLICY IF EXISTS funis_tarefas_insert_auth ON funis_tarefas;
CREATE POLICY funis_tarefas_insert_auth ON funis_tarefas
  FOR INSERT TO authenticated WITH CHECK (
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS funis_tarefas_update_auth ON funis_tarefas;
CREATE POLICY funis_tarefas_update_auth ON funis_tarefas
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM funis_colunas fc
      JOIN funis f ON f.id = fc.funil_id
      WHERE fc.id = funis_tarefas.coluna_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM funis_colunas fc
      JOIN funis f ON f.id = fc.funil_id
      WHERE fc.id = funis_tarefas.coluna_id
    )
  );

DROP POLICY IF EXISTS funis_tarefas_delete_auth ON funis_tarefas;
CREATE POLICY funis_tarefas_delete_auth ON funis_tarefas
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM funis_colunas fc
      JOIN funis f ON f.id = fc.funil_id
      WHERE fc.id = funis_tarefas.coluna_id
      AND f.created_by = auth.uid()
    )
  );

-- Policies: funis_permissoes (apenas owner do funil)
DROP POLICY IF EXISTS funis_permissoes_select_auth ON funis_permissoes;
CREATE POLICY funis_permissoes_select_auth ON funis_permissoes
  FOR SELECT TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_permissoes.funil_id AND funis.created_by = auth.uid())
    OR is_super_admin_session()
  );

DROP POLICY IF EXISTS funis_permissoes_insert_auth ON funis_permissoes;
CREATE POLICY funis_permissoes_insert_auth ON funis_permissoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_permissoes.funil_id AND funis.created_by = auth.uid())
  );

DROP POLICY IF EXISTS funis_permissoes_delete_auth ON funis_permissoes;
CREATE POLICY funis_permissoes_delete_auth ON funis_permissoes
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM funis WHERE funis.id = funis_permissoes.funil_id AND funis.created_by = auth.uid())
  );

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON funis TO authenticated;
GRANT ALL ON funis TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON funis_colunas TO authenticated;
GRANT ALL ON funis_colunas TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON funis_tarefas TO authenticated;
GRANT ALL ON funis_tarefas TO service_role;

GRANT SELECT, INSERT, DELETE ON funis_permissoes TO authenticated;
GRANT ALL ON funis_permissoes TO service_role;
