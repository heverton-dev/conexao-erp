-- ============================================================
-- MIGRAÇÃO: Restruuturação Completa do Módulo Catálogo
-- Data: 2026-07-17
-- Descrição: Renomeação de tabelas, criação de novas tabelas,
--            migração de dados, correção de FKs, pivot tables N:M
-- ============================================================

-- ============================================================
-- 1.1 ADICIONAR COLUNAS FALTANTES EM TABELAS EXISTENTES
-- ============================================================

-- catalogo_categorias: adicionar sigla
ALTER TABLE catalogo_categorias ADD COLUMN IF NOT EXISTS sigla TEXT;

-- ============================================================
-- 1.2 CRIAR TABELAS DE HIERARQUIA (RENOMEADAS)
-- ============================================================

-- catalogo_ips_conexoes (substitui catalogo_conexoes)
CREATE TABLE IF NOT EXISTS catalogo_ips_conexoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES catalogo_categorias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL DEFAULT '',
  locked BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- Migrar dados de catalogo_conexoes → catalogo_ips_conexoes
INSERT INTO catalogo_ips_conexoes (id, empresa_id, categoria_id, nome, sigla, locked, ativo, created_at, updated_at)
SELECT id, empresa_id, categoria_id, nome, COALESCE(sigla, ''), locked, ativo, created_at, updated_at
FROM catalogo_conexoes
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- catalogo_ips_familias (substitui catalogo_familias)
CREATE TABLE IF NOT EXISTS catalogo_ips_familias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conexao_id UUID NOT NULL REFERENCES catalogo_ips_conexoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor_identificacao TEXT DEFAULT '#c9a655',
  locked BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- Migrar dados de catalogo_familias → catalogo_ips_familias
INSERT INTO catalogo_ips_familias (id, empresa_id, conexao_id, nome, cor_identificacao, ativo, created_at, updated_at)
SELECT f.id, f.empresa_id, f.conexao_id, f.nome, COALESCE(f.cor_identificacao, '#c9a655'), f.ativo, f.created_at, f.updated_at
FROM catalogo_familias f
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- catalogo_ips_linhas (substitui catalogo_linhas)
CREATE TABLE IF NOT EXISTS catalogo_ips_linhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  familia_id UUID NOT NULL REFERENCES catalogo_ips_familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- Migrar dados de catalogo_linhas → catalogo_ips_linhas
INSERT INTO catalogo_ips_linhas (id, empresa_id, familia_id, nome, ativo, created_at, updated_at)
SELECT l.id, l.empresa_id, l.familia_id, l.nome, l.ativo, l.created_at, l.updated_at
FROM catalogo_linhas l
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- ============================================================
-- 1.3 TABELAS DE TIPOS (ESTRUTURA)
-- ============================================================

-- catalogo_cps_tipos_reabilitacao (substitui catalogo_tipos_reabilitacao)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_reabilitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

INSERT INTO catalogo_cps_tipos_reabilitacao (id, empresa_id, nome, sigla, ativo, created_at, updated_at)
SELECT id, empresa_id, nome, sigla, ativo, created_at, updated_at
FROM catalogo_tipos_reabilitacao
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- Pivot: tipo_reabilitacao <-> familias (N:M)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_reabilitacao_familias (
  tipo_reabilitacao_id UUID NOT NULL REFERENCES catalogo_cps_tipos_reabilitacao(id) ON DELETE CASCADE,
  familia_id UUID NOT NULL REFERENCES catalogo_ips_familias(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  PRIMARY KEY (tipo_reabilitacao_id, familia_id)
);

-- catalogo_cps_tipos_abutments (substitui catalogo_tipos_abutment)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_abutments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  tipo_reabilitacao_id UUID REFERENCES catalogo_cps_tipos_reabilitacao(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

INSERT INTO catalogo_cps_tipos_abutments (id, empresa_id, nome, sigla, ativo, created_at, updated_at)
SELECT id, empresa_id, nome, sigla, ativo, created_at, updated_at
FROM catalogo_tipos_abutment
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- catalogo_cps_tipos_componentes (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_componentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  categoria_id UUID REFERENCES catalogo_categorias(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_cps_tipos_parafusos (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_parafusos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_cps_tipos_cicatrizadores (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_cicatrizadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_tipos_chaves (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_tipos_chaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_tipos_fresas (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_tipos_fresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_tipos_complementares (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_tipos_complementares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_tipos_opcionais (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_tipos_opcionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_tipos_fresagens (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_tipos_fresagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- catalogo_tipos_kits (substitui catalogo_categorias_kit)
CREATE TABLE IF NOT EXISTS catalogo_tipos_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

INSERT INTO catalogo_tipos_kits (id, empresa_id, nome, ativo, created_at, updated_at)
SELECT id, empresa_id, nome, ativo, created_at, updated_at
FROM catalogo_categorias_kit
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- catalogo_cps_tipos_workflows (substitui catalogo_workflows)
CREATE TABLE IF NOT EXISTS catalogo_cps_tipos_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

INSERT INTO catalogo_cps_tipos_workflows (id, empresa_id, nome, ativo, created_at, updated_at)
SELECT id, empresa_id, nome, ativo, created_at, updated_at
FROM catalogo_workflows
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- catalogo_cps_etapas_workflows (substitui catalogo_etapas_workflow)
CREATE TABLE IF NOT EXISTS catalogo_cps_etapas_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_workflow_id UUID NOT NULL REFERENCES catalogo_cps_tipos_workflows(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ordem INT NOT NULL DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO catalogo_cps_etapas_workflows (id, empresa_id, tipo_workflow_id, nome, sigla, ordem, ativo, created_at, updated_at)
SELECT e.id, e.empresa_id, COALESCE(
  (SELECT w2.id FROM catalogo_cps_tipos_workflows w2 WHERE w2.empresa_id = e.empresa_id AND w2.nome = (SELECT w.nome FROM catalogo_workflows w WHERE w.id = e.id LIMIT 1)),
  (SELECT id FROM catalogo_cps_tipos_workflows LIMIT 1)
), e.nome, NULL, e.ordem, e.ativo, e.created_at, e.updated_at
FROM catalogo_etapas_workflow e
ON CONFLICT DO NOTHING;

-- ============================================================
-- 1.4 TABELAS DE PRODUTOS (REESCRITAS)
-- ============================================================

-- catalogo_protocolos_fresagens (substitui catalogo_protocolo_fresagem)
CREATE TABLE IF NOT EXISTS catalogo_protocolos_fresagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo_osso TEXT NOT NULL,
  sigla TEXT,
  diametro_mm_aplicavel DECIMAL(5,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- catalogo_protocolos_fresas_itens (PIVOT com ordenação)
CREATE TABLE IF NOT EXISTS catalogo_protocolos_fresas_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  protocolo_id UUID NOT NULL REFERENCES catalogo_protocolos_fresagens(id) ON DELETE CASCADE,
  fresa_id TEXT NOT NULL,
  ordem INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- catalogo_implantes: adicionar novas colunas
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT '';
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS sigla TEXT;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS conexao_id UUID;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS familia_id UUID;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS categoria_id UUID;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS osso_soft UUID;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS osso_hard UUID;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS macrogeometria TEXT;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS superficie TEXT;

-- catalogo_implante_chaves (PIVOT N:M)
CREATE TABLE IF NOT EXISTS catalogo_implante_chaves (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  implante_sku TEXT NOT NULL,
  chave_id UUID NOT NULL,
  PRIMARY KEY (empresa_id, implante_sku, chave_id)
);

-- catalogo_abutments: adicionar novas colunas
ALTER TABLE catalogo_abutments ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL DEFAULT '';
ALTER TABLE catalogo_abutments ADD COLUMN IF NOT EXISTS sigla TEXT;
ALTER TABLE catalogo_abutments ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE catalogo_abutments ADD COLUMN IF NOT EXISTS parafuso_id TEXT;
ALTER TABLE catalogo_abutments ADD COLUMN IF NOT EXISTS chave_id UUID;

-- catalogo_componentes (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_componentes (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_componente_id UUID REFERENCES catalogo_cps_tipos_componentes(id) ON DELETE SET NULL,
  tipo_abutment_id UUID REFERENCES catalogo_cps_tipos_abutments(id) ON DELETE SET NULL,
  parafuso_id TEXT,
  chave_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  diametro_plataforma_mm DECIMAL(5,2),
  altura_transmucoso_mm DECIMAL(5,2),
  altura_corpo_mm DECIMAL(5,2),
  angulacao_graus DECIMAL(5,2),
  tipo TEXT,
  tipo_travamento TEXT,
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- catalogo_parafusos (NOVA - substitui catalogo_parafusos_retensao com FK corrigida)
CREATE TABLE IF NOT EXISTS catalogo_parafusos (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_parafuso_id UUID REFERENCES catalogo_cps_tipos_parafusos(id) ON DELETE SET NULL,
  chave_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  torque_ncm DECIMAL(5,2),
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- Migrar dados de catalogo_parafusos_retensao → catalogo_parafusos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalogo_parafusos_retensao') THEN
    INSERT INTO catalogo_parafusos (sku, empresa_id, nome, torque_ncm, chave_id, preco, ativo, created_at, updated_at)
    SELECT p.sku, p.empresa_id, p.nome, p.torque_ncm, NULL, p.preco, p.ativo, p.created_at, p.updated_at
    FROM catalogo_parafusos_retensao p
    ON CONFLICT (sku, empresa_id) DO NOTHING;
  END IF;
END $$;

-- catalogo_cicatrizadores (REESCRITA com FK corrigida)
-- Criar tabela nova, migrar dados, dropar antiga
CREATE TABLE IF NOT EXISTS catalogo_cicatrizadores_v2 (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  implante_id UUID,
  chave_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  diametro_plataforma_mm DECIMAL(5,2),
  altura_transmucoso_mm DECIMAL(5,2),
  altura_corpo_mm DECIMAL(5,2),
  torque_ncm DECIMAL(5,2),
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- Migrar dados se tabela antiga existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalogo_cicatrizadores') THEN
    INSERT INTO catalogo_cicatrizadores_v2 (sku, empresa_id, nome, diametro_plataforma_mm, altura_transmucoso_mm, torque_ncm, preco, ativo, created_at, updated_at)
    SELECT c.sku, c.empresa_id, c.nome, NULL, c.altura_transmucoso, c.torque_ncm, c.preco, c.ativo, c.created_at, c.updated_at
    FROM catalogo_cicatrizadores c
    ON CONFLICT (sku, empresa_id) DO NOTHING;
  END IF;
END $$;

-- catalogo_chaves (NOVA - substitui catalogo_chaves_ferramental)
CREATE TABLE IF NOT EXISTS catalogo_chaves (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_chave_id UUID REFERENCES catalogo_tipos_chaves(id) ON DELETE SET NULL,
  kit_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  tipo TEXT,
  comprimento TEXT,
  diametro_mm DECIMAL(5,2),
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- Migrar dados de catalogo_chaves_ferramental → catalogo_chaves
INSERT INTO catalogo_chaves (sku, empresa_id, nome, tipo, preco, ativo, created_at, updated_at)
SELECT sku, empresa_id, nome, tipo_ferramenta, preco, ativo, created_at, updated_at
FROM catalogo_chaves_ferramental
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- catalogo_fresas (REESCRITA)
CREATE TABLE IF NOT EXISTS catalogo_fresas_v2 (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_fresa_id UUID REFERENCES catalogo_tipos_fresas(id) ON DELETE SET NULL,
  kit_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  tipo TEXT,
  comprimento TEXT,
  diametro_mm DECIMAL(5,2),
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

INSERT INTO catalogo_fresas_v2 (sku, empresa_id, nome, diametro_mm, preco, ativo, created_at, updated_at)
SELECT sku, empresa_id, nome, diametro_mm, preco, ativo, created_at, updated_at
FROM catalogo_fresas
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- catalogo_complementares (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_complementares (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_complementar_id UUID REFERENCES catalogo_tipos_complementares(id) ON DELETE SET NULL,
  kit_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  tipo TEXT,
  comprimento TEXT,
  diametro_mm DECIMAL(5,2),
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- catalogo_opcionais (NOVA)
CREATE TABLE IF NOT EXISTS catalogo_opcionais (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_opcional_id UUID REFERENCES catalogo_tipos_opcionais(id) ON DELETE SET NULL,
  kit_id UUID,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  tipo TEXT,
  comprimento TEXT,
  diametro_mm DECIMAL(5,2),
  material TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- catalogo_kits (REESCRITA)
CREATE TABLE IF NOT EXISTS catalogo_kits_v2 (
  sku TEXT NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_kit_id UUID REFERENCES catalogo_tipos_kits(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  sigla TEXT,
  descricao TEXT,
  preco DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

INSERT INTO catalogo_kits_v2 (sku, empresa_id, nome, descricao, preco, ativo, created_at, updated_at)
SELECT sku, empresa_id, nome, descricao, preco, ativo, created_at, updated_at
FROM catalogo_kits
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- Pivot tables para composição de Kit
CREATE TABLE IF NOT EXISTS catalogo_kit_chaves (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  kit_sku TEXT NOT NULL,
  chave_id UUID NOT NULL,
  PRIMARY KEY (empresa_id, kit_sku, chave_id)
);

CREATE TABLE IF NOT EXISTS catalogo_kit_fresas (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  kit_sku TEXT NOT NULL,
  fresa_id TEXT NOT NULL,
  PRIMARY KEY (empresa_id, kit_sku, fresa_id)
);

CREATE TABLE IF NOT EXISTS catalogo_kit_complementares (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  kit_sku TEXT NOT NULL,
  complementar_id TEXT NOT NULL,
  PRIMARY KEY (empresa_id, kit_sku, complementar_id)
);

CREATE TABLE IF NOT EXISTS catalogo_kit_opcionais (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  kit_sku TEXT NOT NULL,
  opcional_id TEXT NOT NULL,
  PRIMARY KEY (empresa_id, kit_sku, opcional_id)
);

-- ============================================================
-- 1.5 EXPANDIR catalogo_imagens_produto CHECK
-- ============================================================

DO $$
BEGIN
  -- Remover CHECK constraint antigo se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'catalogo_imagens_produto_produto_tipo_check'
    AND conrelid = 'catalogo_imagens_produto'::regclass
  ) THEN
    ALTER TABLE catalogo_imagens_produto DROP CONSTRAINT catalogo_imagens_produto_produto_tipo_check;
  END IF;
END $$;

ALTER TABLE catalogo_imagens_produto ADD CONSTRAINT catalogo_imagens_produto_produto_tipo_check
  CHECK (produto_tipo IN (
    'implante', 'abutment', 'kit', 'parafuso', 'cicatrizador',
    'chave', 'fresa', 'complementar', 'opcional', 'componente'
  ));

-- ============================================================
-- 1.6 RLS POLICIES (padrão correto para todas tabelas novas)
-- ============================================================

-- Helper function: retorna empresa_id do usuario logado
CREATE OR REPLACE FUNCTION get_current_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: verifica se é super admin
CREATE OR REPLACE FUNCTION is_super_admin_session()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Template: aplicar RLS em tabela
DO $$
DECLARE
  tbl TEXT;
  tables_to_rls TEXT[] := ARRAY[
    'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas',
    'catalogo_cps_tipos_reabilitacao', 'catalogo_cps_tipos_reabilitacao_familias',
    'catalogo_cps_tipos_abutments', 'catalogo_cps_tipos_componentes',
    'catalogo_cps_tipos_parafusos', 'catalogo_cps_tipos_cicatrizadores',
    'catalogo_tipos_chaves', 'catalogo_tipos_fresas', 'catalogo_tipos_complementares',
    'catalogo_tipos_opcionais', 'catalogo_tipos_fresagens', 'catalogo_tipos_kits',
    'catalogo_cps_tipos_workflows', 'catalogo_cps_etapas_workflows',
    'catalogo_protocolos_fresagens', 'catalogo_protocolos_fresas_itens',
    'catalogo_componentes', 'catalogo_parafusos', 'catalogo_chaves',
    'catalogo_complementares', 'catalogo_opcionais',
    'catalogo_implante_chaves',
    'catalogo_kit_chaves', 'catalogo_kit_fresas',
    'catalogo_kit_complementares', 'catalogo_kit_opcionais'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_to_rls LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    -- Drop existing policies if any
    EXECUTE format('DROP POLICY IF EXISTS empresa_select_own ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS empresa_insert_own ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS empresa_update_own ON %I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS empresa_delete_own ON %I', tbl);

    -- Create policies
    EXECUTE format('
      CREATE POLICY empresa_select_own ON %I
        FOR SELECT USING (empresa_id = get_current_empresa_id() OR is_super_admin_session())', tbl);
    EXECUTE format('
      CREATE POLICY empresa_insert_own ON %I
        FOR INSERT WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session())', tbl);
    EXECUTE format('
      CREATE POLICY empresa_update_own ON %I
        FOR UPDATE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session())', tbl);
    EXECUTE format('
      CREATE POLICY empresa_delete_own ON %I
        FOR DELETE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session())', tbl);
  END LOOP;
END $$;

-- ============================================================
-- 1.7 TRIGGERS DE updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_catalogo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
  tables_with_updated_at TEXT[] := ARRAY[
    'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas',
    'catalogo_cps_tipos_reabilitacao', 'catalogo_cps_tipos_abutments',
    'catalogo_cps_tipos_componentes', 'catalogo_cps_tipos_parafusos',
    'catalogo_cps_tipos_cicatrizadores',
    'catalogo_tipos_chaves', 'catalogo_tipos_fresas', 'catalogo_tipos_complementares',
    'catalogo_tipos_opcionais', 'catalogo_tipos_fresagens', 'catalogo_tipos_kits',
    'catalogo_cps_tipos_workflows', 'catalogo_cps_etapas_workflows',
    'catalogo_protocolos_fresagens',
    'catalogo_componentes', 'catalogo_parafusos', 'catalogo_chaves',
    'catalogo_fresas_v2', 'catalogo_complementares', 'catalogo_opcionais',
    'catalogo_kits_v2'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_updated_at LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_timestamp ON %I;
      CREATE TRIGGER update_timestamp
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_catalogo_timestamp()', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================
-- 1.8 DROPAR TABELAS ANTIGAS (somente após verificação)
-- ============================================================

-- Primeiro dropar tabelas que referenciam tabelas antigas
DROP TABLE IF EXISTS catalogo_acessorio_ferramental CASCADE;
DROP TABLE IF EXISTS catalogo_kit_composicao CASCADE;
DROP TABLE IF EXISTS catalogo_kit_familias CASCADE;
DROP TABLE IF EXISTS catalogo_guias_reabilitacao CASCADE;
DROP TABLE IF EXISTS catalogo_sequencia_protetica CASCADE;

-- Agora dropar tabelas principais antigas
DROP TABLE IF EXISTS catalogo_conexoes CASCADE;
DROP TABLE IF EXISTS catalogo_familias CASCADE;
DROP TABLE IF EXISTS catalogo_linhas CASCADE;
DROP TABLE IF EXISTS catalogo_tipos_abutment CASCADE;
DROP TABLE IF EXISTS catalogo_workflows CASCADE;
DROP TABLE IF EXISTS catalogo_etapas_workflow CASCADE;
DROP TABLE IF EXISTS catalogo_protocolo_fresagem CASCADE;
DROP TABLE IF EXISTS catalogo_tipos_reabilitacao CASCADE;
DROP TABLE IF EXISTS catalogo_chaves_ferramental CASCADE;
DROP TABLE IF EXISTS catalogo_categorias_kit CASCADE;
DROP TABLE IF EXISTS catalogo_parafusos_retensao CASCADE;
DROP TABLE IF EXISTS catalogo_categorias_acessorio CASCADE;
DROP TABLE IF EXISTS catalogo_categorias_instrumental CASCADE;
DROP TABLE IF EXISTS catalogo_acessorios CASCADE;
DROP TABLE IF EXISTS catalogo_instrumentais_gerais CASCADE;
DROP TABLE IF EXISTS catalogo_imagens_implante CASCADE;

-- Trocar tabelas _v2 pelas finais
DROP TABLE IF EXISTS catalogo_fresas CASCADE;
ALTER TABLE IF EXISTS catalogo_fresas_v2 RENAME TO catalogo_fresas;

DROP TABLE IF EXISTS catalogo_cicatrizadores CASCADE;
ALTER TABLE IF EXISTS catalogo_cicatrizadores_v2 RENAME TO catalogo_cicatrizadores;

DROP TABLE IF EXISTS catalogo_kits CASCADE;
ALTER TABLE IF EXISTS catalogo_kits_v2 RENAME TO catalogo_kits;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================
