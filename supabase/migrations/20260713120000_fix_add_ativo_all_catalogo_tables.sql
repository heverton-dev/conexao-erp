-- ============================================================
-- ADICIONAR COLUNA 'ativo' EM TODAS AS TABELAS DO CATÁLOGO
-- que ainda não possuem (conforme CREATE TABLE original 00078)
-- ============================================================

-- Hierarquia
ALTER TABLE catalogo_categorias ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_conexoes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_familias ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- linhas já tem (criada com ativo)

-- Cirúrgico
ALTER TABLE catalogo_fresas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Protético
ALTER TABLE catalogo_tipos_reabilitacao ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_tipos_abutment ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_abutments ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Acessórios & Ferramentas
ALTER TABLE catalogo_categorias_acessorio ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_acessorios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_chaves_ferramental ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Instrumentais
ALTER TABLE catalogo_categorias_instrumental ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_instrumentais_gerais ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- Kits & Workflows
ALTER TABLE catalogo_categorias_kit ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_workflows ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_etapas_workflow ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
