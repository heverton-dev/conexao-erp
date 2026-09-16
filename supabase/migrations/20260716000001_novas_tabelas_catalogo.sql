-- Migration: Novas tabelas para catálogo
-- Parafusos de Retenção e Cicatrizadores

-- Tabela de Parafusos de Retenção
CREATE TABLE IF NOT EXISTS catalogo_parafusos_retensao (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  torque_ncm NUMERIC,
  vinculo_tipo TEXT NOT NULL CHECK (vinculo_tipo IN ('abutment', 'componente')),
  vinculo_sku TEXT NOT NULL,
  chave_sku TEXT,
  preco NUMERIC DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- Tabela de Cicatrizadores
CREATE TABLE IF NOT EXISTS catalogo_cicatrizadores (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  altura_transmucoso NUMERIC,
  diametro_plataforma TEXT,
  torque_ncm NUMERIC,
  familia_id UUID REFERENCES catalogo_familias(id),
  chave_sku TEXT,
  preco NUMERIC DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- RLS para Parafusos de Retenção
ALTER TABLE catalogo_parafusos_retensao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "_parafusos_select" ON catalogo_parafusos_retensao
  FOR SELECT USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "_parafusos_insert" ON catalogo_parafusos_retensao
  FOR INSERT WITH CHECK (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "_parafusos_update" ON catalogo_parafusos_retensao
  FOR UPDATE USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "parafusos_delete" ON catalogo_parafusos_retensao
  FOR DELETE USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- RLS para Cicatrizadores
ALTER TABLE catalogo_cicatrizadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cicatrizadores_select" ON catalogo_cicatrizadores
  FOR SELECT USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "cicatrizadores_insert" ON catalogo_cicatrizadores
  FOR INSERT WITH CHECK (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "cicatrizadores_update" ON catalogo_cicatrizadores
  FOR UPDATE USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE POLICY "cicatrizadores_delete" ON catalogo_cicatrizadores
  FOR DELETE USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_parafusos_empresa ON catalogo_parafusos_retensao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_parafusos_vinculo ON catalogo_parafusos_retensao(vinculo_tipo, vinculo_sku);
CREATE INDEX IF NOT EXISTS idx_cicatrizadores_empresa ON catalogo_cicatrizadores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cicatrizadores_familia ON catalogo_cicatrizadores(familia_id);
