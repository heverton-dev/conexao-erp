-- Migration: Adicionar coluna locked em catalogo_conexoes
-- Permite que as 3 conexões padrão (CM, HE, HI) sejam protegidas contra edição/exclusão por Admin

ALTER TABLE catalogo_conexoes ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;

COMMENT ON COLUMN catalogo_conexoes.locked IS 'Se true, apenas Super Admin pode editar/excluir esta conexão';

-- Marcar as 3 conexões padrão como locked para todas as empresas
UPDATE catalogo_conexoes
SET locked = true
WHERE nome IN ('Cone Morse', 'Hexágono Externo', 'Hexágono Interno')
  AND sigla IN ('CM', 'HE', 'HI');

-- Atualizar a função seed para marcar conexões padrão como locked
CREATE OR REPLACE FUNCTION seed_catalogo_defaults(p_empresa_id UUID)
RETURNS VOID AS $$
DECLARE
  v_cat_implantes UUID;
BEGIN
  -- Categorias padrão (4)
  INSERT INTO catalogo_categorias (empresa_id, nome, locked, ativo)
  VALUES
    (p_empresa_id, 'Implantes', true, true),
    (p_empresa_id, 'Componentes', true, true),
    (p_empresa_id, 'Kits', true, true),
    (p_empresa_id, 'Promoções', true, true)
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  -- Buscar ID da categoria Implantes
  SELECT id INTO v_cat_implantes FROM catalogo_categorias WHERE empresa_id = p_empresa_id AND nome = 'Implantes';

  -- Conexões padrão para Implantes (3) — locked=true
  INSERT INTO catalogo_conexoes (empresa_id, categoria_id, nome, sigla, ativo, locked)
  VALUES
    (p_empresa_id, v_cat_implantes, 'Cone Morse', 'CM', true, true),
    (p_empresa_id, v_cat_implantes, 'Hexágono Externo', 'HE', true, true),
    (p_empresa_id, v_cat_implantes, 'Hexágono Interno', 'HI', true, true)
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
