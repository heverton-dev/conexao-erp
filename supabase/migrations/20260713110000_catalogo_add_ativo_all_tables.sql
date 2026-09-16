-- Adicionar coluna ativo em todas as tabelas de catálogo que ainda não têm

-- Famílias
ALTER TABLE catalogo_familias ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_familias.ativo IS 'Se falso, a família está oculta para esta empresa';

-- Fresas
ALTER TABLE catalogo_fresas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_fresas.ativo IS 'Se falso, a fresa está oculta para esta empresa';

-- Tipos de Reabilitação
ALTER TABLE catalogo_tipos_reabilitacao ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_tipos_reabilitacao.ativo IS 'Se falso, o tipo está oculta para esta empresa';

-- Tipos de Abutment
ALTER TABLE catalogo_tipos_abutment ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_tipos_abutment.ativo IS 'Se falso, o tipo está oculta para esta empresa';

-- Categorias de Acessório
ALTER TABLE catalogo_categorias_acessorio ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_categorias_acessorio.ativo IS 'Se falso, a categoria está oculta para esta empresa';

-- Acessórios
ALTER TABLE catalogo_acessorios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_acessorios.ativo IS 'Se falso, o acessório está oculto para esta empresa';

-- Chaves Ferramental
ALTER TABLE catalogo_chaves_ferramental ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_chaves_ferramental.ativo IS 'Se falso, a chave está oculta para esta empresa';

-- Categorias Instrumental
ALTER TABLE catalogo_categorias_instrumental ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_categorias_instrumental.ativo IS 'Se falso, a categoria está oculta para esta empresa';

-- Categorias Kit
ALTER TABLE catalogo_categorias_kit ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_categorias_kit.ativo IS 'Se falso, a categoria está oculta para esta empresa';

-- Workflows
ALTER TABLE catalogo_workflows ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_workflows.ativo IS 'Se falso, o workflow está oculto para esta empresa';

-- Etapas de Workflow
ALTER TABLE catalogo_etapas_workflow ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
COMMENT ON COLUMN catalogo_etapas_workflow.ativo IS 'Se falso, a etapa está oculta para esta empresa';
