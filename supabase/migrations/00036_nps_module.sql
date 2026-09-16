-- ============================================================
-- Migration 00036: Módulo NPS Conexão
-- ============================================================

-- 1. Tabela: nps_perguntas
CREATE TABLE IF NOT EXISTS nps_perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('nps','single_choice','multi_choice','text','matrix')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  required BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, key)
);

-- 2. Tabela: nps_respostas
CREATE TABLE IF NOT EXISTS nps_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nps_score INT,
  nps_comment TEXT DEFAULT '',
  csat TEXT DEFAULT '',
  atendimento_comercial TEXT DEFAULT '',
  entendimento_consultor TEXT DEFAULT '',
  melhoria_atendimento TEXT DEFAULT '',
  experiencia_compra TEXT DEFAULT '',
  matrix_facilidade_pedido INT DEFAULT 0,
  matrix_clareza_condicoes INT DEFAULT 0,
  matrix_prazo_entrega INT DEFAULT 0,
  matrix_disponibilidade_produtos INT DEFAULT 0,
  matrix_comunicacao INT DEFAULT 0,
  expansao_produtos TEXT DEFAULT '',
  oportunidade TEXT DEFAULT '',
  pergunta_final TEXT DEFAULT '',
  order_id TEXT,
  client_id TEXT,
  source TEXT,
  client_name TEXT,
  vendor_name TEXT,
  dynamic_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela: nps_webhook_config
CREATE TABLE IF NOT EXISTS nps_webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela: nps_relatorios_envio
CREATE TABLE IF NOT EXISTS nps_relatorios_envio (
  id BIGSERIAL PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  data_envio DATE NOT NULL,
  total_processado INT NOT NULL DEFAULT 0,
  enviados_sucesso INT NOT NULL DEFAULT 0,
  sem_whatsapp INT NOT NULL DEFAULT 0,
  nps_menor_30 INT NOT NULL DEFAULT 0,
  clientes_detalhes TEXT,
  html_relatorio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS nps_perguntas_set_updated_at ON nps_perguntas;
CREATE TRIGGER nps_perguntas_set_updated_at
  BEFORE UPDATE ON nps_perguntas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS nps_perguntas_empresa_idx ON nps_perguntas(empresa_id);
CREATE INDEX IF NOT EXISTS nps_perguntas_empresa_active_idx ON nps_perguntas(empresa_id, active);
CREATE INDEX IF NOT EXISTS nps_respostas_empresa_idx ON nps_respostas(empresa_id);
CREATE INDEX IF NOT EXISTS nps_respostas_created_idx ON nps_respostas(created_at);
CREATE INDEX IF NOT EXISTS nps_respostas_empresa_created_idx ON nps_respostas(empresa_id, created_at);
CREATE INDEX IF NOT EXISTS nps_webhook_config_empresa_idx ON nps_webhook_config(empresa_id);
CREATE INDEX IF NOT EXISTS nps_relatorios_empresa_idx ON nps_relatorios_envio(empresa_id);

-- RLS
ALTER TABLE nps_perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_webhook_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_relatorios_envio ENABLE ROW LEVEL SECURITY;

-- Policies: SELECT público (survey público precisa ler perguntas ativas)
DROP POLICY IF EXISTS nps_perguntas_select_public ON nps_perguntas;
CREATE POLICY nps_perguntas_select_public ON nps_perguntas
  FOR SELECT USING (active = true);

-- Policies: autenticados (dashboard, admin)
DROP POLICY IF EXISTS nps_perguntas_insert_auth ON nps_perguntas;
CREATE POLICY nps_perguntas_insert_auth ON nps_perguntas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS nps_perguntas_update_auth ON nps_perguntas;
CREATE POLICY nps_perguntas_update_auth ON nps_perguntas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS nps_perguntas_delete_auth ON nps_perguntas;
CREATE POLICY nps_perguntas_delete_auth ON nps_perguntas FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS nps_respostas_insert_auth ON nps_respostas;
CREATE POLICY nps_respostas_insert_auth ON nps_respostas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS nps_respostas_insert_anon ON nps_respostas;
CREATE POLICY nps_respostas_insert_anon ON nps_respostas FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS nps_respostas_select_auth ON nps_respostas;
CREATE POLICY nps_respostas_select_auth ON nps_respostas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS nps_respostas_delete_auth ON nps_respostas;
CREATE POLICY nps_respostas_delete_auth ON nps_respostas FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS nps_webhook_config_insert_auth ON nps_webhook_config;
CREATE POLICY nps_webhook_config_insert_auth ON nps_webhook_config FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS nps_webhook_config_select_auth ON nps_webhook_config;
CREATE POLICY nps_webhook_config_select_auth ON nps_webhook_config FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS nps_webhook_config_update_auth ON nps_webhook_config;
CREATE POLICY nps_webhook_config_update_auth ON nps_webhook_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS nps_webhook_config_delete_auth ON nps_webhook_config;
CREATE POLICY nps_webhook_config_delete_auth ON nps_webhook_config FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS nps_relatorios_insert_auth ON nps_relatorios_envio;
CREATE POLICY nps_relatorios_insert_auth ON nps_relatorios_envio FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS nps_relatorios_select_auth ON nps_relatorios_envio;
CREATE POLICY nps_relatorios_select_auth ON nps_relatorios_envio FOR SELECT TO authenticated USING (true);

-- Grants
GRANT SELECT ON nps_perguntas TO anon, authenticated;
GRANT ALL ON nps_perguntas TO authenticated;
GRANT ALL ON nps_perguntas TO service_role;

GRANT INSERT ON nps_respostas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON nps_respostas TO authenticated;
GRANT ALL ON nps_respostas TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON nps_webhook_config TO authenticated;
GRANT ALL ON nps_webhook_config TO service_role;

GRANT SELECT, INSERT ON nps_relatorios_envio TO authenticated;
GRANT ALL ON nps_relatorios_envio TO service_role;
