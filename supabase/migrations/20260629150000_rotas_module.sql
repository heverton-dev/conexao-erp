-- ============================================================
-- Migration: Módulo Rotas de Visitas
-- ============================================================

-- 1. Tabela: rotas_config (configuração por empresa)
CREATE TABLE IF NOT EXISTS rotas_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE UNIQUE,
  valor_km_reembolso DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  raio_permitido_metros INT NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela: rotas_clientes_base (base de clientes para rotas)
CREATE TABLE IF NOT EXISTS rotas_clientes_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  bairro TEXT,
  rua TEXT,
  numero TEXT,
  cep TEXT,
  endereco_completo TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  ticket_medio DECIMAL(10,2),
  categoria TEXT,
  ultima_visita DATE,
  fonte TEXT NOT NULL DEFAULT 'csv' CHECK (fonte IN ('csv', 'cadastros', 'crm')),
  fonte_id UUID,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela: rotas (planejamento de rotas)
CREATE TABLE IF NOT EXISTS rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data_rota DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('diaria', 'semanal', 'mensal')),
  status TEXT NOT NULL DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_execucao', 'realizada', 'nao_realizada', 'cancelada')),
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  local_inicio JSONB,
  local_fim JSONB,
  total_visitas INT DEFAULT 0,
  total_km DECIMAL(10,2) DEFAULT 0,
  total_tempo_trajeto_min INT DEFAULT 0,
  valor_reembolso DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela: rotas_clientes (clientes na rota com ordem e status)
CREATE TABLE IF NOT EXISTS rotas_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  rota_id UUID NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
  cliente_base_id UUID NOT NULL REFERENCES rotas_clientes_base(id) ON DELETE CASCADE,
  ordem INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_trajeto', 'em_visita', 'visitado', 'nao_visitado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rota_id, cliente_base_id)
);

-- 5. Tabela: rotas_trajetos (registro de cada trajeto)
CREATE TABLE IF NOT EXISTS rotas_trajetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  rota_id UUID NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
  rota_cliente_id UUID NOT NULL REFERENCES rotas_clientes(id) ON DELETE CASCADE,
  origem_lat DECIMAL(10,7),
  origem_lng DECIMAL(10,7),
  destino_lat DECIMAL(10,7),
  destino_lng DECIMAL(10,7),
  distancia_km DECIMAL(10,2),
  duracao_minutos INT,
  valor_reembolso DECIMAL(10,2),
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela: rotas_visitas (registro de cada visita)
CREATE TABLE IF NOT EXISTS rotas_visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  rota_id UUID NOT NULL REFERENCES rotas(id) ON DELETE CASCADE,
  rota_cliente_id UUID NOT NULL REFERENCES rotas_clientes(id) ON DELETE CASCADE,
  cliente_base_id UUID NOT NULL REFERENCES rotas_clientes_base(id) ON DELETE CASCADE,
  consultor_id UUID NOT NULL REFERENCES auth.users(id),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  duracao_minutos INT,
  local_inicio JSONB,
  local_fim JSONB,
  dentro_raio BOOLEAN DEFAULT true,
  formulario JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabela: rotas_form_perguntas (schema do formulário dinâmico)
CREATE TABLE IF NOT EXISTS rotas_form_perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('texto_curto', 'texto_longo', 'data', 'multipla_escolha', 'selecao', 'radio')),
  opcoes TEXT[] DEFAULT '{}',
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rotas_config_set_updated_at ON rotas_config;
CREATE TRIGGER rotas_config_set_updated_at BEFORE UPDATE ON rotas_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS rotas_clientes_base_set_updated_at ON rotas_clientes_base;
CREATE TRIGGER rotas_clientes_base_set_updated_at BEFORE UPDATE ON rotas_clientes_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS rotas_set_updated_at ON rotas;
CREATE TRIGGER rotas_set_updated_at BEFORE UPDATE ON rotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS rotas_clientes_set_updated_at ON rotas_clientes;
CREATE TRIGGER rotas_clientes_set_updated_at BEFORE UPDATE ON rotas_clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS rotas_form_perguntas_set_updated_at ON rotas_form_perguntas;
CREATE TRIGGER rotas_form_perguntas_set_updated_at BEFORE UPDATE ON rotas_form_perguntas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS rotas_empresa_usuario_idx ON rotas(empresa_id, usuario_id);
CREATE INDEX IF NOT EXISTS rotas_data_rota_idx ON rotas(data_rota);
CREATE INDEX IF NOT EXISTS rotas_status_idx ON rotas(status);
CREATE INDEX IF NOT EXISTS rotas_clientes_rota_idx ON rotas_clientes(rota_id);
CREATE INDEX IF NOT EXISTS rotas_clientes_base_empresa_usuario_idx ON rotas_clientes_base(empresa_id, usuario_id);
CREATE INDEX IF NOT EXISTS rotas_clientes_base_empresa_idx ON rotas_clientes_base(empresa_id);
CREATE INDEX IF NOT EXISTS rotas_trajetos_rota_idx ON rotas_trajetos(rota_id);
CREATE INDEX IF NOT EXISTS rotas_trajetos_cliente_idx ON rotas_trajetos(rota_cliente_id);
CREATE INDEX IF NOT EXISTS rotas_visitas_rota_idx ON rotas_visitas(rota_id);
CREATE INDEX IF NOT EXISTS rotas_visitas_cliente_idx ON rotas_visitas(rota_cliente_id);
CREATE INDEX IF NOT EXISTS rotas_form_perguntas_empresa_idx ON rotas_form_perguntas(empresa_id);

-- RLS
ALTER TABLE rotas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_clientes_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_trajetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_form_perguntas ENABLE ROW LEVEL SECURITY;

-- Policies: rotas_config
DROP POLICY IF EXISTS rotas_config_select_auth ON rotas_config;
CREATE POLICY rotas_config_select_auth ON rotas_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_config_insert_auth ON rotas_config;
CREATE POLICY rotas_config_insert_auth ON rotas_config FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_config_update_auth ON rotas_config;
CREATE POLICY rotas_config_update_auth ON rotas_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_config_delete_auth ON rotas_config;
CREATE POLICY rotas_config_delete_auth ON rotas_config FOR DELETE TO authenticated USING (true);

-- Policies: rotas_clientes_base
DROP POLICY IF EXISTS rotas_clientes_base_select_auth ON rotas_clientes_base;
CREATE POLICY rotas_clientes_base_select_auth ON rotas_clientes_base FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_clientes_base_insert_auth ON rotas_clientes_base;
CREATE POLICY rotas_clientes_base_insert_auth ON rotas_clientes_base FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_clientes_base_update_auth ON rotas_clientes_base;
CREATE POLICY rotas_clientes_base_update_auth ON rotas_clientes_base FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_clientes_base_delete_auth ON rotas_clientes_base;
CREATE POLICY rotas_clientes_base_delete_auth ON rotas_clientes_base FOR DELETE TO authenticated USING (true);

-- Policies: rotas
DROP POLICY IF EXISTS rotas_select_auth ON rotas;
CREATE POLICY rotas_select_auth ON rotas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_insert_auth ON rotas;
CREATE POLICY rotas_insert_auth ON rotas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_update_auth ON rotas;
CREATE POLICY rotas_update_auth ON rotas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_delete_auth ON rotas;
CREATE POLICY rotas_delete_auth ON rotas FOR DELETE TO authenticated USING (true);

-- Policies: rotas_clientes
DROP POLICY IF EXISTS rotas_clientes_select_auth ON rotas_clientes;
CREATE POLICY rotas_clientes_select_auth ON rotas_clientes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_clientes_insert_auth ON rotas_clientes;
CREATE POLICY rotas_clientes_insert_auth ON rotas_clientes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_clientes_update_auth ON rotas_clientes;
CREATE POLICY rotas_clientes_update_auth ON rotas_clientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_clientes_delete_auth ON rotas_clientes;
CREATE POLICY rotas_clientes_delete_auth ON rotas_clientes FOR DELETE TO authenticated USING (true);

-- Policies: rotas_trajetos
DROP POLICY IF EXISTS rotas_trajetos_select_auth ON rotas_trajetos;
CREATE POLICY rotas_trajetos_select_auth ON rotas_trajetos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_trajetos_insert_auth ON rotas_trajetos;
CREATE POLICY rotas_trajetos_insert_auth ON rotas_trajetos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_trajetos_update_auth ON rotas_trajetos;
CREATE POLICY rotas_trajetos_update_auth ON rotas_trajetos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_trajetos_delete_auth ON rotas_trajetos;
CREATE POLICY rotas_trajetos_delete_auth ON rotas_trajetos FOR DELETE TO authenticated USING (true);

-- Policies: rotas_visitas
DROP POLICY IF EXISTS rotas_visitas_select_auth ON rotas_visitas;
CREATE POLICY rotas_visitas_select_auth ON rotas_visitas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_visitas_insert_auth ON rotas_visitas;
CREATE POLICY rotas_visitas_insert_auth ON rotas_visitas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_visitas_update_auth ON rotas_visitas;
CREATE POLICY rotas_visitas_update_auth ON rotas_visitas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_visitas_delete_auth ON rotas_visitas;
CREATE POLICY rotas_visitas_delete_auth ON rotas_visitas FOR DELETE TO authenticated USING (true);

-- Policies: rotas_form_perguntas
DROP POLICY IF EXISTS rotas_form_perguntas_select_auth ON rotas_form_perguntas;
CREATE POLICY rotas_form_perguntas_select_auth ON rotas_form_perguntas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS rotas_form_perguntas_insert_auth ON rotas_form_perguntas;
CREATE POLICY rotas_form_perguntas_insert_auth ON rotas_form_perguntas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS rotas_form_perguntas_update_auth ON rotas_form_perguntas;
CREATE POLICY rotas_form_perguntas_update_auth ON rotas_form_perguntas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rotas_form_perguntas_delete_auth ON rotas_form_perguntas;
CREATE POLICY rotas_form_perguntas_delete_auth ON rotas_form_perguntas FOR DELETE TO authenticated USING (true);

-- Grants
GRANT ALL ON rotas_config TO authenticated;
GRANT ALL ON rotas_config TO service_role;
GRANT ALL ON rotas_clientes_base TO authenticated;
GRANT ALL ON rotas_clientes_base TO service_role;
GRANT ALL ON rotas TO authenticated;
GRANT ALL ON rotas TO service_role;
GRANT ALL ON rotas_clientes TO authenticated;
GRANT ALL ON rotas_clientes TO service_role;
GRANT ALL ON rotas_trajetos TO authenticated;
GRANT ALL ON rotas_trajetos TO service_role;
GRANT ALL ON rotas_visitas TO authenticated;
GRANT ALL ON rotas_visitas TO service_role;
GRANT ALL ON rotas_form_perguntas TO authenticated;
GRANT ALL ON rotas_form_perguntas TO service_role;
