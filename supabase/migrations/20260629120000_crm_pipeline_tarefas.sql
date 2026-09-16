-- Migration: CRM Pipeline e Tarefas
-- Data: 2026-06-29

-- 1. Tabela de estágios do pipeline
CREATE TABLE IF NOT EXISTS pipeline_estagios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  cor VARCHAR(7) DEFAULT '#6366f1',
  icone VARCHAR(50) DEFAULT 'Circle',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices para pipeline_estagios
CREATE INDEX idx_pipeline_estagios_empresa ON pipeline_estagios(empresa_id);
CREATE INDEX idx_pipeline_estagios_ordem ON pipeline_estagios(empresa_id, ordem);

-- RLS para pipeline_estagios
ALTER TABLE pipeline_estagios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipeline_estagios_select" ON pipeline_estagios
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "pipeline_estagios_insert" ON pipeline_estagios
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "pipeline_estagios_update" ON pipeline_estagios
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "pipeline_estagios_delete" ON pipeline_estagios
  FOR DELETE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 2. Adicionar coluna estágio na tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS estagio_id UUID REFERENCES pipeline_estagios(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_estagio ON clientes(estagio_id);

-- 3. Tabela de tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  responsavel_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'geral',
  prioridade VARCHAR(20) DEFAULT 'media',
  status VARCHAR(20) DEFAULT 'pendente',
  data_vencimento DATE,
  data_conclusao TIMESTAMPTZ,
  lembrete_enviado BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices para tarefas
CREATE INDEX idx_tarefas_empresa ON tarefas(empresa_id);
CREATE INDEX idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX idx_tarefas_cliente ON tarefas(cliente_id);
CREATE INDEX idx_tarefas_status ON tarefas(empresa_id, status);
CREATE INDEX idx_tarefas_vencimento ON tarefas(data_vencimento) WHERE status = 'pendente';

-- RLS para tarefas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarefas_select" ON tarefas
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "tarefas_insert" ON tarefas
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "tarefas_update" ON tarefas
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "tarefas_delete" ON tarefas
  FOR DELETE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 4. Tabela de templates de mensagem
CREATE TABLE IF NOT EXISTS templates_mensagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
  assunto VARCHAR(255),
  corpo TEXT NOT NULL,
  variaveis JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices para templates_mensagem
CREATE INDEX idx_templates_mensagem_empresa ON templates_mensagem(empresa_id);

-- RLS para templates_mensagem
ALTER TABLE templates_mensagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_mensagem_select" ON templates_mensagem
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "templates_mensagem_insert" ON templates_mensagem
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "templates_mensagem_update" ON templates_mensagem
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "templates_mensagem_delete" ON templates_mensagem
  FOR DELETE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 5. Tabela de metas
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  consultor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  periodo VARCHAR(20) NOT NULL DEFAULT 'mensal',
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'vendas',
  valor_meta DECIMAL(15,2) NOT NULL,
  valor_atingido DECIMAL(15,2) DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices para metas
CREATE INDEX idx_metas_empresa ON metas(empresa_id);
CREATE INDEX idx_metas_consultor ON metas(consultor_id);
CREATE INDEX idx_metas_periodo ON metas(empresa_id, data_inicio, data_fim);

-- RLS para metas
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metas_select" ON metas
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "metas_insert" ON metas
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "metas_update" ON metas
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "metas_delete" ON metas
  FOR DELETE USING (
    empresa_id IN (
      SELECT empresa_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 6. Função para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizado_em
CREATE TRIGGER trigger_pipeline_estagios_atualizado
  BEFORE UPDATE ON pipeline_estagios
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_tarefas_atualizado
  BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_templates_mensagem_atualizado
  BEFORE UPDATE ON templates_mensagem
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_metas_atualizado
  BEFORE UPDATE ON metas
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- 7. Inserir estágios padrão para empresas existentes
INSERT INTO pipeline_estagios (empresa_id, nome, descricao, ordem, cor, icone)
SELECT 
  e.id,
  estagio.nome,
  estagio.descricao,
  estagio.ordem,
  estagio.cor,
  estagio.icone
FROM empresas e
CROSS JOIN (
  VALUES 
    ('Prospecção', 'Cliente em contato inicial', 1, '#3b82f6', 'Search'),
    ('Qualificação', 'Cliente qualificado com interesse', 2, '#8b5cf6', 'UserCheck'),
    ('Proposta', 'Proposta enviada', 3, '#f59e0b', 'FileText'),
    ('Negociação', 'Em negociação', 4, '#f97316', 'MessageSquare'),
    ('Fechamento', 'Pedido fechado', 5, '#10b981', 'CheckCircle'),
    ('Perdido', 'Oportunidade perdida', 6, '#ef4444', 'XCircle')
) AS estagio(nome, descricao, ordem, cor, icone)
WHERE e.ativo = true
ON CONFLICT DO NOTHING;
