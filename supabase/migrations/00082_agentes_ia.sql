-- Migration: Agentes IA
-- Tabelas para sistema de agentes inteligentes por empresa/modulo

-- Tabela principal de agentes
CREATE TABLE IF NOT EXISTS agentes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  modulo_key TEXT NOT NULL,
  route TEXT,
  provedor_url TEXT NOT NULL,
  provedor_api_key TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT 'gpt-4o',
  system_prompt TEXT,
  render_mode TEXT NOT NULL DEFAULT 'floating' CHECK (render_mode IN ('floating', 'header_icon')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos da base de conhecimento
CREATE TABLE IF NOT EXISTS agentes_knowledge_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID NOT NULL REFERENCES agentes_ia(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('documento', 'csv', 'json', 'html', 'pdf')),
  nome_arquivo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabelas do modulo incluidas como contexto
CREATE TABLE IF NOT EXISTS agentes_knowledge_tabelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID NOT NULL REFERENCES agentes_ia(id) ON DELETE CASCADE,
  tabela_nome TEXT NOT NULL,
  incluida BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agente_id, tabela_nome)
);

-- Historico de conversas do playground
CREATE TABLE IF NOT EXISTS agentes_conversas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID NOT NULL REFERENCES agentes_ia(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  mensagens JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agentes_ia_empresa ON agentes_ia(empresa_id);
CREATE INDEX IF NOT EXISTS idx_agentes_ia_modulo ON agentes_ia(modulo_key);
CREATE INDEX IF NOT EXISTS idx_agentes_knowledge_docs_agente ON agentes_knowledge_docs(agente_id);
CREATE INDEX IF NOT EXISTS idx_agentes_knowledge_tabelas_agente ON agentes_knowledge_tabelas(agente_id);
CREATE INDEX IF NOT EXISTS idx_agentes_conversas_agente ON agentes_conversas(agente_id);

-- RLS
ALTER TABLE agentes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes_knowledge_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes_knowledge_tabelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes_conversas ENABLE ROW LEVEL SECURITY;

-- Policies: agentes_ia
CREATE POLICY "agentes_ia_select" ON agentes_ia
  FOR SELECT USING (
    ativo = true
    OR empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_ia_insert" ON agentes_ia
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_ia_update" ON agentes_ia
  FOR UPDATE USING (
    empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_ia_delete" ON agentes_ia
  FOR DELETE USING (
    empresa_id IN (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Policies: agentes_knowledge_docs
CREATE POLICY "agentes_knowledge_docs_select" ON agentes_knowledge_docs
  FOR SELECT USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_knowledge_docs_insert" ON agentes_knowledge_docs
  FOR INSERT WITH CHECK (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_knowledge_docs_delete" ON agentes_knowledge_docs
  FOR DELETE USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Policies: agentes_knowledge_tabelas
CREATE POLICY "agentes_knowledge_tabelas_select" ON agentes_knowledge_tabelas
  FOR SELECT USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_knowledge_tabelas_insert" ON agentes_knowledge_tabelas
  FOR INSERT WITH CHECK (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_knowledge_tabelas_update" ON agentes_knowledge_tabelas
  FOR UPDATE USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_knowledge_tabelas_delete" ON agentes_knowledge_tabelas
  FOR DELETE USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Policies: agentes_conversas
CREATE POLICY "agentes_conversas_select" ON agentes_conversas
  FOR SELECT USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_conversas_insert" ON agentes_conversas
  FOR INSERT WITH CHECK (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "agentes_conversas_delete" ON agentes_conversas
  FOR DELETE USING (
    agente_id IN (
      SELECT id FROM agentes_ia WHERE empresa_id IN (
        SELECT empresa_id FROM profiles WHERE id = auth.uid()
      )
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );
