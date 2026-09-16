-- Migration: Dados mock padrão para todas as empresas
-- Categorias: Implantes, Componentes, Kits, Promoções
-- Conexões: CM, HE, HI (apenas para Implantes)
-- Super Admin pode editar tudo, Admin pode ativar/desativar

-- ============================================================
-- 1. Adicionar coluna ativo nas tabelas de hierarquia
-- ============================================================

ALTER TABLE catalogo_categorias ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE catalogo_conexoes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

COMMENT ON COLUMN catalogo_categorias.ativo IS 'Se falso, a categoria está oculta para esta empresa';
COMMENT ON COLUMN catalogo_conexoes.ativo IS 'Se falso, a conexão está oculta para esta empresa';

-- ============================================================
-- 2. Função para criar dados padrão em uma empresa
-- ============================================================

CREATE OR REPLACE FUNCTION seed_catalogo_defaults(p_empresa_id UUID)
RETURNS VOID AS $$
DECLARE
  v_cat_implantes UUID;
  v_cat_componentes UUID;
  v_cat_kits UUID;
  v_cat_promocionais UUID;
BEGIN
  -- Categorias padrão (4)
  INSERT INTO catalogo_categorias (empresa_id, nome, locked, ativo)
  VALUES
    (p_empresa_id, 'Implantes', true, true),
    (p_empresa_id, 'Componentes', true, true),
    (p_empresa_id, 'Kits', true, true),
    (p_empresa_id, 'Promoções', true, true)
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  -- Buscar IDs das categorias
  SELECT id INTO v_cat_implantes FROM catalogo_categorias WHERE empresa_id = p_empresa_id AND nome = 'Implantes';
  SELECT id INTO v_cat_componentes FROM catalogo_categorias WHERE empresa_id = p_empresa_id AND nome = 'Componentes';
  SELECT id INTO v_cat_kits FROM catalogo_categorias WHERE empresa_id = p_empresa_id AND nome = 'Kits';
  SELECT id INTO v_cat_promocionais FROM catalogo_categorias WHERE empresa_id = p_empresa_id AND nome = 'Promoções';

  -- Conexões padrão para Implantes (3)
  INSERT INTO catalogo_conexoes (empresa_id, categoria_id, nome, sigla, ativo)
  VALUES
    (p_empresa_id, v_cat_implantes, 'Cone Morse', 'CM', true),
    (p_empresa_id, v_cat_implantes, 'Hexágono Externo', 'HE', true),
    (p_empresa_id, v_cat_implantes, 'Hexágono Interno', 'HI', true)
  ON CONFLICT (empresa_id, categoria_id, nome) DO NOTHING;

  -- Categorias de acessório padrão
  INSERT INTO catalogo_categorias_acessorio (empresa_id, nome)
  VALUES
    (p_empresa_id, 'Scan Body'),
    (p_empresa_id, 'Análogo'),
    (p_empresa_id, 'Parafuso'),
    (p_empresa_id, 'Cicatrizador'),
    (p_empresa_id, 'Transfer')
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  -- Categorias de kit padrão
  INSERT INTO catalogo_categorias_kit (empresa_id, nome)
  VALUES
    (p_empresa_id, 'Cirúrgico'),
    (p_empresa_id, 'Protético')
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  -- Categorias de instrumental padrão
  INSERT INTO catalogo_categorias_instrumental (empresa_id, nome)
  VALUES
    (p_empresa_id, 'Catracas'),
    (p_empresa_id, 'Caixas')
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  -- Tipos de reabilitação padrão
  INSERT INTO catalogo_tipos_reabilitacao (empresa_id, nome)
  VALUES
    (p_empresa_id, 'Unitária'),
    (p_empresa_id, 'Múltipla')
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  -- Tipos de abutment padrão
  INSERT INTO catalogo_tipos_abutment (empresa_id, nome, sigla)
  VALUES
    (p_empresa_id, 'Múltipla', 'MU'),
    (p_empresa_id, 'Unidade', 'UN'),
    (p_empresa_id, 'Estilo Emergência', 'EC')
  ON CONFLICT (empresa_id, nome) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. Rodar para TODAS as empresas existentes
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM empresas WHERE ativo = true
  LOOP
    PERFORM seed_catalogo_defaults(r.id);
  END LOOP;
END;
$$;

-- ============================================================
-- 4. Trigger: auto-seed para novas empresas
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_seed_catalogo_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ativo = true THEN
    PERFORM seed_catalogo_defaults(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger na tabela empresas (se não existir)
DROP TRIGGER IF EXISTS trg_seed_catalogo ON empresas;
CREATE TRIGGER trg_seed_catalogo
  AFTER INSERT ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_catalogo_defaults();

-- ============================================================
-- 5. Comentários nas colunas
-- ============================================================

COMMENT ON FUNCTION seed_catalogo_defaults(UUID) IS 'Cria categorias, conexões e dados padrão do catálogo para uma empresa';
COMMENT ON FUNCTION trigger_seed_catalogo_defaults() IS 'Trigger que auto-seed dados do catálogo ao criar nova empresa';
