-- Migration: Módulo Catálogo
-- 27 tabelas multi-tenant com RLS

-- ============================================================
-- HIERARQUIA
-- ============================================================

CREATE TABLE catalogo_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

CREATE TABLE catalogo_conexoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES catalogo_categorias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_familias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  conexao_id UUID NOT NULL REFERENCES catalogo_conexoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor_identificacao TEXT DEFAULT '#c9a655',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_linhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  familia_id UUID NOT NULL REFERENCES catalogo_familias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- IMPLANTES
-- ============================================================

CREATE TABLE catalogo_implantes (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  linha_id UUID NOT NULL REFERENCES catalogo_linhas(id) ON DELETE CASCADE,
  diametro_mm DECIMAL(5,2) NOT NULL,
  comprimento_mm DECIMAL(5,2) NOT NULL,
  rosca_interna TEXT,
  regiao_apical TEXT,
  regiao_cervical TEXT,
  torque_insercao DECIMAL(5,2),
  detalhes_extras JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

CREATE TABLE catalogo_imagens_implante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  implante_sku UUID NOT NULL,
  url_imagem TEXT NOT NULL,
  ordem_exibicao INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (implante_sku, empresa_id) REFERENCES catalogo_implantes(sku, empresa_id) ON DELETE CASCADE
);

CREATE TABLE catalogo_fresas (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  diametro_mm DECIMAL(5,2),
  venda_avulsa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

CREATE TABLE catalogo_protocolo_fresagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  implante_sku UUID NOT NULL,
  fresa_sku UUID NOT NULL,
  tipo_osso TEXT NOT NULL CHECK (tipo_osso IN ('Soft (III-IV)', 'Hard (I-II)')),
  ordem_uso INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (implante_sku, empresa_id) REFERENCES catalogo_implantes(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (fresa_sku, empresa_id) REFERENCES catalogo_fresas(sku, empresa_id) ON DELETE CASCADE
);

-- ============================================================
-- COMPONENTES PROTÉTICOS
-- ============================================================

CREATE TABLE catalogo_tipos_reabilitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_tipos_abutment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_abutments (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  familia_id UUID NOT NULL REFERENCES catalogo_familias(id) ON DELETE CASCADE,
  tipo_reabilitacao_id UUID NOT NULL REFERENCES catalogo_tipos_reabilitacao(id) ON DELETE CASCADE,
  tipo_abutment_id UUID NOT NULL REFERENCES catalogo_tipos_abutment(id) ON DELETE CASCADE,
  diametro_plataforma TEXT,
  angulacao_graus DECIMAL(5,2),
  altura_transmucoso DECIMAL(5,2),
  altura_corpo DECIMAL(5,2),
  torque_ncm DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- ============================================================
-- ACESSÓRIOS E FERRAMENTAS
-- ============================================================

CREATE TABLE catalogo_categorias_acessorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_acessorios (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES catalogo_categorias_acessorio(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  diametro_mm DECIMAL(5,2),
  altura_mm DECIMAL(5,2),
  caracteristicas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

CREATE TABLE catalogo_chaves_ferramental (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo_ferramenta TEXT NOT NULL CHECK (tipo_ferramenta IN ('Aperto', 'Medição', 'Cirúrgica')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

CREATE TABLE catalogo_acessorio_ferramental (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  acessorio_sku UUID NOT NULL,
  ferramenta_sku UUID NOT NULL,
  obrigatorio BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (empresa_id, acessorio_sku, ferramenta_sku),
  FOREIGN KEY (acessorio_sku, empresa_id) REFERENCES catalogo_acessorios(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (ferramenta_sku, empresa_id) REFERENCES catalogo_chaves_ferramental(sku, empresa_id) ON DELETE CASCADE
);

CREATE TABLE catalogo_categorias_instrumental (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_instrumentais_gerais (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES catalogo_categorias_instrumental(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

-- ============================================================
-- WORKFLOWS
-- ============================================================

CREATE TABLE catalogo_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_etapas_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ordem INT NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_guias_reabilitacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  familia_id UUID NOT NULL REFERENCES catalogo_familias(id) ON DELETE CASCADE,
  tipo_abutment_id UUID NOT NULL REFERENCES catalogo_tipos_abutment(id) ON DELETE CASCADE,
  diametro_plataforma TEXT NOT NULL,
  workflow_id UUID NOT NULL REFERENCES catalogo_workflows(id) ON DELETE CASCADE,
  etapa_id UUID NOT NULL REFERENCES catalogo_etapas_workflow(id) ON DELETE CASCADE,
  acessorio_sku UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (acessorio_sku, empresa_id) REFERENCES catalogo_acessorios(sku, empresa_id) ON DELETE CASCADE
);

-- ============================================================
-- KITS
-- ============================================================

CREATE TABLE catalogo_categorias_kit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_kits (
  sku UUID NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES catalogo_categorias_kit(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (sku, empresa_id)
);

CREATE TABLE catalogo_kit_familias (
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  kit_sku UUID NOT NULL,
  familia_id UUID NOT NULL REFERENCES catalogo_familias(id) ON DELETE CASCADE,
  PRIMARY KEY (empresa_id, kit_sku, familia_id),
  FOREIGN KEY (kit_sku, empresa_id) REFERENCES catalogo_kits(sku, empresa_id) ON DELETE CASCADE
);

CREATE TABLE catalogo_kit_composicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  kit_sku UUID NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  fresa_sku UUID,
  chave_sku UUID,
  acessorio_sku UUID,
  instrumental_sku UUID,
  implante_sku UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (kit_sku, empresa_id) REFERENCES catalogo_kits(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (fresa_sku, empresa_id) REFERENCES catalogo_fresas(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (chave_sku, empresa_id) REFERENCES catalogo_chaves_ferramental(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (acessorio_sku, empresa_id) REFERENCES catalogo_acessorios(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (instrumental_sku, empresa_id) REFERENCES catalogo_instrumentais_gerais(sku, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (implante_sku, empresa_id) REFERENCES catalogo_implantes(sku, empresa_id) ON DELETE CASCADE,
  -- Arco Exclusivo: exatamente 1 FK não-nula
  CONSTRAINT arco_exclusivo CHECK (
    (fresa_sku IS NOT NULL)::int +
    (chave_sku IS NOT NULL)::int +
    (acessorio_sku IS NOT NULL)::int +
    (instrumental_sku IS NOT NULL)::int +
    (implante_sku IS NOT NULL)::int = 1
  )
);

-- ============================================================
-- COMERCIAL
-- ============================================================

CREATE TABLE catalogo_cupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('percentual', 'fixo')),
  valor DECIMAL(10,2) NOT NULL,
  validade TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, codigo)
);

CREATE TABLE catalogo_fretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cep_inicio TEXT NOT NULL,
  cep_fim TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  prazo_dias INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_promocionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  expira_em TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_promocional_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  promocional_id UUID NOT NULL REFERENCES catalogo_promocionais(id) ON DELETE CASCADE,
  sku UUID NOT NULL,
  tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE catalogo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_conexoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_linhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_implantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_imagens_implante ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_fresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_protocolo_fresagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_tipos_reabilitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_tipos_abutment ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_abutments ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_categorias_acessorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_acessorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_chaves_ferramental ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_acessorio_ferramental ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_categorias_instrumental ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_instrumentais_gerais ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_etapas_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_guias_reabilitacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_categorias_kit ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_kit_familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_kit_composicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_promocionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_promocional_itens ENABLE ROW LEVEL SECURITY;

-- Policies: usuários autenticados veem dados da própria empresa
CREATE POLICY catalogo_categorias_empresa ON catalogo_categorias FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_conexoes_empresa ON catalogo_conexoes FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_familias_empresa ON catalogo_familias FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_linhas_empresa ON catalogo_linhas FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_implantes_empresa ON catalogo_implantes FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_imagens_empresa ON catalogo_imagens_implante FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_fresas_empresa ON catalogo_fresas FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_fresagem_empresa ON catalogo_protocolo_fresagem FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_tipos_reab_empresa ON catalogo_tipos_reabilitacao FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_tipos_abut_empresa ON catalogo_tipos_abutment FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_abutments_empresa ON catalogo_abutments FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_cat_acess_empresa ON catalogo_categorias_acessorio FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_acessorios_empresa ON catalogo_acessorios FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_chaves_empresa ON catalogo_chaves_ferramental FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_acess_ferr_empresa ON catalogo_acessorio_ferramental FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_cat_inst_empresa ON catalogo_categorias_instrumental FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_inst_empresa ON catalogo_instrumentais_gerais FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_workflows_empresa ON catalogo_workflows FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_etapas_empresa ON catalogo_etapas_workflow FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_guias_empresa ON catalogo_guias_reabilitacao FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_cat_kit_empresa ON catalogo_categorias_kit FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_kits_empresa ON catalogo_kits FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_kit_fam_empresa ON catalogo_kit_familias FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_kit_comp_empresa ON catalogo_kit_composicao FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_cupons_empresa ON catalogo_cupons FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_fretes_empresa ON catalogo_fretes FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_promocionais_empresa ON catalogo_promocionais FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));
CREATE POLICY catalogo_promo_itens_empresa ON catalogo_promocional_itens FOR ALL USING (empresa_id = auth.uid()::uuid OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_catalogo_implantes_linha ON catalogo_implantes(linha_id, empresa_id);
CREATE INDEX idx_catalogo_implantes_ativo ON catalogo_implantes(empresa_id, ativo);
CREATE INDEX idx_catalogo_linhas_familia ON catalogo_linhas(familia_id, empresa_id);
CREATE INDEX idx_catalogo_abutments_familia ON catalogo_abutments(familia_id, empresa_id);
CREATE INDEX idx_catalogo_kits_categoria ON catalogo_kits(categoria_id, empresa_id);
CREATE INDEX idx_catalogo_guias_workflow ON catalogo_guias_reabilitacao(workflow_id, empresa_id);
CREATE INDEX idx_catalogo_fresagem_implante ON catalogo_protocolo_fresagem(implante_sku, empresa_id);
