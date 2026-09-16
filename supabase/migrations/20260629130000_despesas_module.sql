-- ============================================================
-- Migration: Módulo Despesas em Rota
-- ============================================================

-- 1. Tabela: despesas_tipos
CREATE TABLE IF NOT EXISTS despesas_tipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  valor_maximo DECIMAL(10,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- 2. Tabela: despesas_config
CREATE TABLE IF NOT EXISTS despesas_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE UNIQUE,
  frequencia TEXT NOT NULL DEFAULT 'mensal' CHECK (frequencia IN ('semanal', 'quinzenal', 'mensal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela: despesas_periodos
CREATE TABLE IF NOT EXISTS despesas_periodos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, data_inicio, data_fim)
);

-- 4. Tabela: despesas
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES despesas_periodos(id) ON DELETE CASCADE,
  tipo_id UUID NOT NULL REFERENCES despesas_tipos(id) ON DELETE RESTRICT,
  data_despesa DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT DEFAULT '',
  comprovante_url TEXT DEFAULT '',
  comprovante_tipo TEXT DEFAULT 'upload' CHECK (comprovante_tipo IN ('upload', 'link')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'aprovada', 'reprovada', 'paga')),
  comentario_reprovacao TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela: despesas_envios
CREATE TABLE IF NOT EXISTS despesas_envios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES despesas_periodos(id) ON DELETE CASCADE,
  total_despesas INT NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'parcial')),
  aprovador_id UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMPTZ,
  comentario TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, usuario_id, periodo_id)
);

-- 6. Tabela: despesas_pagamentos
CREATE TABLE IF NOT EXISTS despesas_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  envio_id UUID NOT NULL REFERENCES despesas_envios(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('pix', 'transferencia', 'dinheiro')),
  data_pagamento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  comprovante_pagamento TEXT DEFAULT '',
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

DROP TRIGGER IF EXISTS despesas_tipos_set_updated_at ON despesas_tipos;
CREATE TRIGGER despesas_tipos_set_updated_at BEFORE UPDATE ON despesas_tipos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS despesas_config_set_updated_at ON despesas_config;
CREATE TRIGGER despesas_config_set_updated_at BEFORE UPDATE ON despesas_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS despesas_periodos_set_updated_at ON despesas_periodos;
CREATE TRIGGER despesas_periodos_set_updated_at BEFORE UPDATE ON despesas_periodos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS despesas_set_updated_at ON despesas;
CREATE TRIGGER despesas_set_updated_at BEFORE UPDATE ON despesas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS despesas_envios_set_updated_at ON despesas_envios;
CREATE TRIGGER despesas_envios_set_updated_at BEFORE UPDATE ON despesas_envios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS despesas_pagamentos_set_updated_at ON despesas_pagamentos;
CREATE TRIGGER despesas_pagamentos_set_updated_at BEFORE UPDATE ON despesas_pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS despesas_tipos_empresa_idx ON despesas_tipos(empresa_id);
CREATE INDEX IF NOT EXISTS despesas_config_empresa_idx ON despesas_config(empresa_id);
CREATE INDEX IF NOT EXISTS despesas_periodos_empresa_idx ON despesas_periodos(empresa_id);
CREATE INDEX IF NOT EXISTS despesas_periodos_empresa_status_idx ON despesas_periodos(empresa_id, status);
CREATE INDEX IF NOT EXISTS despesas_empresa_idx ON despesas(empresa_id);
CREATE INDEX IF NOT EXISTS despesas_usuario_idx ON despesas(usuario_id);
CREATE INDEX IF NOT EXISTS despesas_empresa_usuario_idx ON despesas(empresa_id, usuario_id);
CREATE INDEX IF NOT EXISTS despesas_envios_empresa_idx ON despesas_envios(empresa_id);
CREATE INDEX IF NOT EXISTS despesas_envios_empresa_status_idx ON despesas_envios(empresa_id, status);
CREATE INDEX IF NOT EXISTS despesas_pagamentos_empresa_idx ON despesas_pagamentos(empresa_id);

-- RLS
ALTER TABLE despesas_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_envios ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_pagamentos ENABLE ROW LEVEL SECURITY;

-- Policies: despesas_tipos (empresa vê/edita seus tipos)
DROP POLICY IF EXISTS despesas_tipos_select_auth ON despesas_tipos;
CREATE POLICY despesas_tipos_select_auth ON despesas_tipos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS despesas_tipos_insert_auth ON despesas_tipos;
CREATE POLICY despesas_tipos_insert_auth ON despesas_tipos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS despesas_tipos_update_auth ON despesas_tipos;
CREATE POLICY despesas_tipos_update_auth ON despesas_tipos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS despesas_tipos_delete_auth ON despesas_tipos;
CREATE POLICY despesas_tipos_delete_auth ON despesas_tipos FOR DELETE TO authenticated USING (true);

-- Policies: despesas_config
DROP POLICY IF EXISTS despesas_config_select_auth ON despesas_config;
CREATE POLICY despesas_config_select_auth ON despesas_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS despesas_config_insert_auth ON despesas_config;
CREATE POLICY despesas_config_insert_auth ON despesas_config FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS despesas_config_update_auth ON despesas_config;
CREATE POLICY despesas_config_update_auth ON despesas_config FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policies: despesas_periodos
DROP POLICY IF EXISTS despesas_periodos_select_auth ON despesas_periodos;
CREATE POLICY despesas_periodos_select_auth ON despesas_periodos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS despesas_periodos_insert_auth ON despesas_periodos;
CREATE POLICY despesas_periodos_insert_auth ON despesas_periodos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS despesas_periodos_update_auth ON despesas_periodos;
CREATE POLICY despesas_periodos_update_auth ON despesas_periodos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS despesas_periodos_delete_auth ON despesas_periodos;
CREATE POLICY despesas_periodos_delete_auth ON despesas_periodos FOR DELETE TO authenticated USING (true);

-- Policies: despesas (usuário vê/edita/exclui apenas suas)
DROP POLICY IF EXISTS despesas_select_auth ON despesas;
CREATE POLICY despesas_select_auth ON despesas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS despesas_insert_auth ON despesas;
CREATE POLICY despesas_insert_auth ON despesas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS despesas_update_auth ON despesas;
CREATE POLICY despesas_update_auth ON despesas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS despesas_delete_auth ON despesas;
CREATE POLICY despesas_delete_auth ON despesas FOR DELETE TO authenticated USING (true);

-- Policies: despesas_envios
DROP POLICY IF EXISTS despesas_envios_select_auth ON despesas_envios;
CREATE POLICY despesas_envios_select_auth ON despesas_envios FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS despesas_envios_insert_auth ON despesas_envios;
CREATE POLICY despesas_envios_insert_auth ON despesas_envios FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS despesas_envios_update_auth ON despesas_envios;
CREATE POLICY despesas_envios_update_auth ON despesas_envios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS despesas_envios_delete_auth ON despesas_envios;
CREATE POLICY despesas_envios_delete_auth ON despesas_envios FOR DELETE TO authenticated USING (true);

-- Policies: despesas_pagamentos
DROP POLICY IF EXISTS despesas_pagamentos_select_auth ON despesas_pagamentos;
CREATE POLICY despesas_pagamentos_select_auth ON despesas_pagamentos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS despesas_pagamentos_insert_auth ON despesas_pagamentos;
CREATE POLICY despesas_pagamentos_insert_auth ON despesas_pagamentos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS despesas_pagamentos_update_auth ON despesas_pagamentos;
CREATE POLICY despesas_pagamentos_update_auth ON despesas_pagamentos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS despesas_pagamentos_delete_auth ON despesas_pagamentos;
CREATE POLICY despesas_pagamentos_delete_auth ON despesas_pagamentos FOR DELETE TO authenticated USING (true);

-- Grants
GRANT ALL ON despesas_tipos TO authenticated;
GRANT ALL ON despesas_tipos TO service_role;
GRANT ALL ON despesas_config TO authenticated;
GRANT ALL ON despesas_config TO service_role;
GRANT ALL ON despesas_periodos TO authenticated;
GRANT ALL ON despesas_periodos TO service_role;
GRANT ALL ON despesas TO authenticated;
GRANT ALL ON despesas TO service_role;
GRANT ALL ON despesas_envios TO authenticated;
GRANT ALL ON despesas_envios TO service_role;
GRANT ALL ON despesas_pagamentos TO authenticated;
GRANT ALL ON despesas_pagamentos TO service_role;
