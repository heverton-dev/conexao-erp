-- Migration: Estender seed_catalogo_defaults() para incluir Famílias e Linhas
-- O seed anterior só criava Categorias e Conexões. Famílias e Linhas ficavam vazias
-- para novas empresas, impedindo a criação de implantes.

CREATE OR REPLACE FUNCTION seed_catalogo_defaults(p_empresa_id UUID)
RETURNS VOID AS $$
DECLARE
  v_cat_implantes UUID;
  v_conn_cm UUID;
  v_conn_he UUID;
  v_conn_hi UUID;
  v_fam_np UUID;
  v_fam_gmf UUID;
  v_fam_fit UUID;
  v_fam_slim UUID;
BEGIN
  -- Categorias padrão (4)
  INSERT INTO catalogo_categorias (empresa_id, nome, locked, ativo)
  VALUES
    (p_empresa_id, 'Implantes', true, true),
    (p_empresa_id, 'Componentes', true, true),
    (p_empresa_id, 'Kits', true, true),
    (p_empresa_id, 'Promoções', true, true)
  ON CONFLICT (empresa_id, nome) DO NOTHING;

  SELECT id INTO v_cat_implantes FROM catalogo_categorias WHERE empresa_id = p_empresa_id AND nome = 'Implantes';

  -- Conexões padrão (3) — locked=true
  INSERT INTO catalogo_conexoes (empresa_id, categoria_id, nome, sigla, ativo, locked)
  VALUES
    (p_empresa_id, v_cat_implantes, 'Cone Morse', 'CM', true, true),
    (p_empresa_id, v_cat_implantes, 'Hexágono Externo', 'HE', true, true),
    (p_empresa_id, v_cat_implantes, 'Hexágono Interno', 'HI', true, true)
  ON CONFLICT (empresa_id, categoria_id, nome) DO NOTHING;

  SELECT id INTO v_conn_cm FROM catalogo_conexoes WHERE empresa_id = p_empresa_id AND sigla = 'CM';
  SELECT id INTO v_conn_he FROM catalogo_conexoes WHERE empresa_id = p_empresa_id AND sigla = 'HE';
  SELECT id INTO v_conn_hi FROM catalogo_conexoes WHERE empresa_id = p_empresa_id AND sigla = 'HI';

  -- Famílias padrão (4)
  INSERT INTO catalogo_familias (empresa_id, conexao_id, nome, cor_identificacao)
  VALUES
    (p_empresa_id, v_conn_cm, 'NP', '#3b82f6'),
    (p_empresa_id, v_conn_cm, 'GMF', '#eab308'),
    (p_empresa_id, v_conn_cm, 'FIT', '#22c55e'),
    (p_empresa_id, v_conn_he, 'Slim', '#a855f7')
  ON CONFLICT (empresa_id, conexao_id, nome) DO NOTHING;

  SELECT id INTO v_fam_np FROM catalogo_familias WHERE empresa_id = p_empresa_id AND conexao_id = v_conn_cm AND nome = 'NP';
  SELECT id INTO v_fam_gmf FROM catalogo_familias WHERE empresa_id = p_empresa_id AND conexao_id = v_conn_cm AND nome = 'GMF';
  SELECT id INTO v_fam_fit FROM catalogo_familias WHERE empresa_id = p_empresa_id AND conexao_id = v_conn_cm AND nome = 'FIT';
  SELECT id INTO v_fam_slim FROM catalogo_familias WHERE empresa_id = p_empresa_id AND conexao_id = v_conn_he AND nome = 'Slim';

  -- Linhas padrão (5)
  INSERT INTO catalogo_linhas (empresa_id, familia_id, nome, ativo)
  VALUES
    (p_empresa_id, v_fam_np, 'Flex Gold', true),
    (p_empresa_id, v_fam_np, 'Easy Grip', true),
    (p_empresa_id, v_fam_gmf, 'Flash', true),
    (p_empresa_id, v_fam_fit, 'Premium', true),
    (p_empresa_id, v_fam_slim, 'Standard', true)
  ON CONFLICT (empresa_id, familia_id, nome) DO NOTHING;

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
