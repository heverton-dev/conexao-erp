-- Seed: Dados mock para módulo Catálogo
-- Executar APÓS a migration 00078_catalogo.sql

DO $$
DECLARE
  v_empresa_id UUID;
  v_cat_impl UUID;
  v_cat_comp UUID;
  v_cat_kit UUID;
  v_conn_cm UUID;
  v_conn_he UUID;
  v_fam_np UUID;
  v_fam_gmf UUID;
  v_fam_fit UUID;
  v_linha_flex UUID;
  v_linha_easy UUID;
  v_linha_flash UUID;
  v_tipo_reab_unit UUID;
  v_tipo_reab_multi UUID;
  v_tipo_ab_mu UUID;
  v_tipo_ab_ub UUID;
  v_tipo_ab_ec UUID;
  v_cat_acess_cicatrizador UUID;
  v_cat_acess_transfer UUID;
  v_cat_inst_catracas UUID;
  v_cat_inst_caixas UUID;
  v_cat_kit_cirurgico UUID;
  v_cat_kit_protetico UUID;
  v_wf_analogico UUID;
  v_wf_digital UUID;
  v_etapa_1 UUID;
  v_etapa_2 UUID;
  v_etapa_3 UUID;
  v_etapa_4 UUID;
BEGIN
  -- Pegar primeira empresa
  SELECT id INTO v_empresa_id FROM empresas LIMIT 1;
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada';
  END IF;

  -- ============================================================
  -- MÓDULO 1: HIERARQUIA
  -- ============================================================
  INSERT INTO catalogo_categorias (id, empresa_id, nome, locked) VALUES
    (gen_random_uuid(), v_empresa_id, 'Implantes', true),
    (gen_random_uuid(), v_empresa_id, 'Componentes', true),
    (gen_random_uuid(), v_empresa_id, 'Kits', true)
  RETURNING id INTO v_cat_impl, v_cat_comp, v_cat_kit;

  SELECT id INTO v_cat_impl FROM catalogo_categorias WHERE empresa_id = v_empresa_id AND nome = 'Implantes';
  SELECT id INTO v_cat_comp FROM catalogo_categorias WHERE empresa_id = v_empresa_id AND nome = 'Componentes';
  SELECT id INTO v_cat_kit FROM catalogo_categorias WHERE empresa_id = v_empresa_id AND nome = 'Kits';

  INSERT INTO catalogo_conexoes (id, empresa_id, categoria_id, nome, sigla) VALUES
    (gen_random_uuid(), v_empresa_id, v_cat_impl, 'Cone Morse', 'CM'),
    (gen_random_uuid(), v_empresa_id, v_cat_impl, 'Hexágono Externo', 'HE'),
    (gen_random_uuid(), v_empresa_id, v_cat_impl, 'Hexágono Interno', 'HI')
  RETURNING id INTO v_conn_cm;

  SELECT id INTO v_conn_cm FROM catalogo_conexoes WHERE empresa_id = v_empresa_id AND sigla = 'CM';
  SELECT id INTO v_conn_he FROM catalogo_conexoes WHERE empresa_id = v_empresa_id AND sigla = 'HE';

  INSERT INTO catalogo_familias (id, empresa_id, conexao_id, nome, cor_identificacao) VALUES
    (gen_random_uuid(), v_empresa_id, v_conn_cm, 'NP', '#3b82f6'),
    (gen_random_uuid(), v_empresa_id, v_conn_cm, 'GMF', '#eab308'),
    (gen_random_uuid(), v_empresa_id, v_conn_cm, 'FIT', '#22c55e'),
    (gen_random_uuid(), v_empresa_id, v_conn_he, 'Slim', '#a855f7')
  RETURNING id INTO v_fam_np;

  SELECT id INTO v_fam_np FROM catalogo_familias WHERE empresa_id = v_empresa_id AND nome = 'NP';
  SELECT id INTO v_fam_gmf FROM catalogo_familias WHERE empresa_id = v_empresa_id AND nome = 'GMF';
  SELECT id INTO v_fam_fit FROM catalogo_familias WHERE empresa_id = v_empresa_id AND nome = 'FIT';

  INSERT INTO catalogo_linhas (id, empresa_id, familia_id, nome, ativo) VALUES
    (gen_random_uuid(), v_empresa_id, v_fam_np, 'Flex Gold', true),
    (gen_random_uuid(), v_empresa_id, v_fam_np, 'Easy Grip', true),
    (gen_random_uuid(), v_empresa_id, v_fam_gmf, 'Flash', true),
    (gen_random_uuid(), v_empresa_id, v_fam_fit, 'Premium', true),
    (gen_random_uuid(), v_empresa_id, v_fam_gmf, 'Classic', false)
  RETURNING id INTO v_linha_flex;

  SELECT id INTO v_linha_flex FROM catalogo_linhas WHERE empresa_id = v_empresa_id AND nome = 'Flex Gold';
  SELECT id INTO v_linha_easy FROM catalogo_linhas WHERE empresa_id = v_empresa_id AND nome = 'Easy Grip';
  SELECT id INTO v_linha_flash FROM catalogo_linhas WHERE empresa_id = v_empresa_id AND nome = 'Flash';

  -- ============================================================
  -- MÓDULO 2: IMPLANTES
  -- ============================================================
  INSERT INTO catalogo_implantes (sku, empresa_id, linha_id, diametro_mm, comprimento_mm, rosca_interna, regiao_apical, regiao_cervical, torque_insercao, ativo) VALUES
    ('IMP-NP-3508', v_empresa_id, v_linha_flex, 3.50, 8.50, 'M 1.6', 'Cônico', 'Cilíndrico', 45, true),
    ('IMP-NP-3511', v_empresa_id, v_linha_flex, 3.50, 11.50, 'M 1.6', 'Cônico', 'Cilíndrico', 45, true),
    ('IMP-NP-4308', v_empresa_id, v_linha_flex, 4.30, 8.50, 'M 2.0', 'Cônico', 'Cilíndrico', 60, true),
    ('IMP-NP-4311', v_empresa_id, v_linha_flex, 4.30, 11.50, 'M 2.0', 'Cônico', 'Cilíndrico', 60, true),
    ('IMP-GMF-4010', v_empresa_id, v_linha_flash, 4.00, 10.00, 'M 2.0', 'Escalar', 'Hexagonal', 50, true),
    ('IMP-GMF-4513', v_empresa_id, v_linha_flash, 4.50, 13.00, 'M 2.0', 'Escalar', 'Hexagonal', 55, true),
    ('IMP-FIT-37510', v_empresa_id, (SELECT id FROM catalogo_linhas WHERE empresa_id = v_empresa_id AND nome = 'Premium'), 3.75, 10.00, 'M 1.6', 'Tapered', 'Microthread', 40, true);

  -- Fresas
  INSERT INTO catalogo_fresas (sku, empresa_id, nome, diametro_mm, venda_avulsa) VALUES
    ('FRESA-LANCA-20', v_empresa_id, 'Fresa Lança 2.0', 2.00, true),
    ('FRESA-LANCA-28', v_empresa_id, 'Fresa Lança 2.8', 2.80, true),
    ('FRESA-PILOTO', v_empresa_id, 'Fresa Piloto', 1.60, false),
    ('FRESA-STOP-DRILL', v_empresa_id, 'Stop Drill', 3.50, true),
    ('FRESA-REVERSA', v_empresa_id, 'Fresa Reversa', 2.00, true);

  -- Protocolo de Fresagem
  INSERT INTO catalogo_protocolo_fresagem (empresa_id, implante_sku, fresa_sku, tipo_osso, ordem_uso) VALUES
    (v_empresa_id, 'IMP-NP-3508', 'FRESA-PILOTO', 'Soft (III-IV)', 1),
    (v_empresa_id, 'IMP-NP-3508', 'FRESA-LANCA-20', 'Soft (III-IV)', 2),
    (v_empresa_id, 'IMP-NP-3508', 'FRESA-STOP-DRILL', 'Soft (III-IV)', 3),
    (v_empresa_id, 'IMP-NP-3508', 'FRESA-PILOTO', 'Hard (I-II)', 1),
    (v_empresa_id, 'IMP-NP-3508', 'FRESA-LANCA-28', 'Hard (I-II)', 2),
    (v_empresa_id, 'IMP-NP-3508', 'FRESA-STOP-DRILL', 'Hard (I-II)', 3),
    (v_empresa_id, 'IMP-NP-4308', 'FRESA-PILOTO', 'Soft (III-IV)', 1),
    (v_empresa_id, 'IMP-NP-4308', 'FRESA-LANCA-28', 'Soft (III-IV)', 2),
    (v_empresa_id, 'IMP-NP-4308', 'FRESA-STOP-DRILL', 'Soft (III-IV)', 3);

  -- ============================================================
  -- MÓDULO 3: COMPONENTES
  -- ============================================================
  INSERT INTO catalogo_tipos_reabilitacao (id, empresa_id, nome) VALUES
    (gen_random_uuid(), v_empresa_id, 'Unitária'),
    (gen_random_uuid(), v_empresa_id, 'Múltipla'),
    (gen_random_uuid(), v_empresa_id, 'Híbrida')
  RETURNING id INTO v_tipo_reab_unit;

  SELECT id INTO v_tipo_reab_unit FROM catalogo_tipos_reabilitacao WHERE empresa_id = v_empresa_id AND nome = 'Unitária';
  SELECT id INTO v_tipo_reab_multi FROM catalogo_tipos_reabilitacao WHERE empresa_id = v_empresa_id AND nome = 'Múltipla';

  INSERT INTO catalogo_tipos_abutment (id, empresa_id, nome, sigla) VALUES
    (gen_random_uuid(), v_empresa_id, 'Micro Unit', 'MU'),
    (gen_random_uuid(), v_empresa_id, 'TiBase', 'UB'),
    (gen_random_uuid(), v_empresa_id, 'Esteticone', 'EC')
  RETURNING id INTO v_tipo_ab_mu;

  SELECT id INTO v_tipo_ab_mu FROM catalogo_tipos_abutment WHERE empresa_id = v_empresa_id AND sigla = 'MU';
  SELECT id INTO v_tipo_ab_ub FROM catalogo_tipos_abutment WHERE empresa_id = v_empresa_id AND sigla = 'UB';
  SELECT id INTO v_tipo_ab_ec FROM catalogo_tipos_abutment WHERE empresa_id = v_empresa_id AND sigla = 'EC';

  INSERT INTO catalogo_abutments (sku, empresa_id, familia_id, tipo_reabilitacao_id, tipo_abutment_id, diametro_plataforma, angulacao_graus, altura_transmucoso, altura_corpo, torque_ncm) VALUES
    ('ABT-NP-MU-00', v_empresa_id, v_fam_np, v_tipo_reab_unit, v_tipo_ab_mu, 'NP', 0, 1.5, 5.0, 20),
    ('ABT-NP-MU-17', v_empresa_id, v_fam_np, v_tipo_reab_unit, v_tipo_ab_mu, 'NP', 17, 2.0, 5.0, 20),
    ('ABT-NP-UB-00', v_empresa_id, v_fam_np, v_tipo_reab_unit, v_tipo_ab_ub, 'NP', 0, 1.0, 4.0, 25),
    ('ABT-GMF-EC-00', v_empresa_id, v_fam_gmf, v_tipo_reab_multi, v_tipo_ab_ec, 'GMF', 0, 2.5, 6.0, 30),
    ('ABT-GMF-MU-00', v_empresa_id, v_fam_gmf, v_tipo_reab_unit, v_tipo_ab_mu, 'GMF', 0, 1.5, 5.0, 20),
    ('ABT-FIT-UB-00', v_empresa_id, v_fam_fit, v_tipo_reab_unit, v_tipo_ab_ub, 'FIT', 0, 1.0, 4.0, 25);

  -- ============================================================
  -- MÓDULO 4: ACESSÓRIOS
  -- ============================================================
  INSERT INTO catalogo_categorias_acessorio (id, empresa_id, nome) VALUES
    (gen_random_uuid(), v_empresa_id, 'Cicatrizador'),
    (gen_random_uuid(), v_empresa_id, 'Transfer'),
    (gen_random_uuid(), v_empresa_id, 'Scan Body'),
    (gen_random_uuid(), v_empresa_id, 'Análogo'),
    (gen_random_uuid(), v_empresa_id, 'Parafuso')
  RETURNING id INTO v_cat_acess_cicatrizador;

  SELECT id INTO v_cat_acess_cicatrizador FROM catalogo_categorias_acessorio WHERE empresa_id = v_empresa_id AND nome = 'Cicatrizador';
  SELECT id INTO v_cat_acess_transfer FROM catalogo_categorias_acessorio WHERE empresa_id = v_empresa_id AND nome = 'Transfer';

  INSERT INTO catalogo_acessorios (sku, empresa_id, categoria_id, nome, diametro_mm, altura_mm) VALUES
    ('CIC-NP-35-20', v_empresa_id, v_cat_acess_cicatrizador, 'Cicatrizador NP 3.5×2.0', 3.50, 2.00),
    ('CIC-NP-43-30', v_empresa_id, v_cat_acess_cicatrizador, 'Cicatrizador NP 4.3×3.0', 4.30, 3.00),
    ('CIC-GMF-40-20', v_empresa_id, v_cat_acess_cicatrizador, 'Cicatrizador GMF 4.0×2.0', 4.00, 2.00),
    ('TRANS-NP', v_empresa_id, v_cat_acess_transfer, 'Transferente NP', 3.50, null),
    ('TRANS-GMF', v_empresa_id, v_cat_acess_transfer, 'Transferente GMF', 4.00, null),
    ('SCAN-NP', v_empresa_id, (SELECT id FROM catalogo_categorias_acessorio WHERE empresa_id = v_empresa_id AND nome = 'Scan Body'), 'Scan Body NP', 3.50, null),
    ('ANAL-NP', v_empresa_id, (SELECT id FROM catalogo_categorias_acessorio WHERE empresa_id = v_empresa_id AND nome = 'Análogo'), 'Análogo NP', 3.50, null),
    ('PARAF-UNIV', v_empresa_id, (SELECT id FROM catalogo_categorias_acessorio WHERE empresa_id = v_empresa_id AND nome = 'Parafuso'), 'Parafuso Universal', null, null);

  -- Chaves Ferramentais
  INSERT INTO catalogo_chaves_ferramental (sku, empresa_id, nome, tipo_ferramenta) VALUES
    ('CHV-HEX-12', v_empresa_id, 'Chave Hexagonal 1.2', 'Aperto'),
    ('CHV-HEX-09', v_empresa_id, 'Chave Hexagonal 0.9', 'Aperto'),
    ('SONDA-GENG', v_empresa_id, 'Sonda Gengival', 'Medição'),
    ('CHV-CIRURG', v_empresa_id, 'Chave Cirúrgica', 'Cirúrgica');

  -- Cross-sell
  INSERT INTO catalogo_acessorio_ferramental (empresa_id, acessorio_sku, ferramenta_sku, obrigatorio) VALUES
    (v_empresa_id, 'CIC-NP-35-20', 'CHV-HEX-12', true),
    (v_empresa_id, 'CIC-NP-43-30', 'CHV-HEX-12', true),
    (v_empresa_id, 'TRANS-NP', 'CHV-HEX-12', true),
    (v_empresa_id, 'PARAF-UNIV', 'CHV-HEX-09', true);

  -- Categorias Instrumental
  INSERT INTO catalogo_categorias_instrumental (id, empresa_id, nome) VALUES
    (gen_random_uuid(), v_empresa_id, 'Catracas'),
    (gen_random_uuid(), v_empresa_id, 'Caixas'),
    (gen_random_uuid(), v_empresa_id, 'Anilhas')
  RETURNING id INTO v_cat_inst_catracas;

  SELECT id INTO v_cat_inst_catracas FROM catalogo_categorias_instrumental WHERE empresa_id = v_empresa_id AND nome = 'Catracas';
  SELECT id INTO v_cat_inst_caixas FROM catalogo_categorias_instrumental WHERE empresa_id = v_empresa_id AND nome = 'Caixas';

  INSERT INTO catalogo_instrumentais_gerais (sku, empresa_id, categoria_id, nome) VALUES
    ('INST-CATRACA-01', v_empresa_id, v_cat_inst_catracas, 'Catraca Universal'),
    ('INST-CAIXA-ORG', v_empresa_id, v_cat_inst_caixas, 'Caixa Organizadora'),
    ('INST-CAIXA-CIR', v_empresa_id, v_cat_inst_caixas, 'Caixa Cirúrgica');

  -- ============================================================
  -- MÓDULO 5: WORKFLOWS
  -- ============================================================
  INSERT INTO catalogo_workflows (id, empresa_id, nome) VALUES
    (gen_random_uuid(), v_empresa_id, 'Analógico Gesso'),
    (gen_random_uuid(), v_empresa_id, 'Scan Digital inLego')
  RETURNING id INTO v_wf_analogico;

  SELECT id INTO v_wf_analogico FROM catalogo_workflows WHERE empresa_id = v_empresa_id AND nome = 'Analógico Gesso';
  SELECT id INTO v_wf_digital FROM catalogo_workflows WHERE empresa_id = v_empresa_id AND nome = 'Scan Digital inLego';

  INSERT INTO catalogo_etapas_workflow (id, empresa_id, ordem, nome) VALUES
    (gen_random_uuid(), v_empresa_id, 1, 'Cicatrização'),
    (gen_random_uuid(), v_empresa_id, 2, 'Transferência'),
    (gen_random_uuid(), v_empresa_id, 3, 'Análogos'),
    (gen_random_uuid(), v_empresa_id, 4, 'Prova')
  RETURNING id INTO v_etapa_1;

  SELECT id INTO v_etapa_1 FROM catalogo_etapas_workflow WHERE empresa_id = v_empresa_id AND ordem = 1;
  SELECT id INTO v_etapa_2 FROM catalogo_etapas_workflow WHERE empresa_id = v_empresa_id AND ordem = 2;
  SELECT id INTO v_etapa_3 FROM catalogo_etapas_workflow WHERE empresa_id = v_empresa_id AND ordem = 3;
  SELECT id INTO v_etapa_4 FROM catalogo_etapas_workflow WHERE empresa_id = v_empresa_id AND ordem = 4;

  INSERT INTO catalogo_guias_reabilitacao (empresa_id, familia_id, tipo_abutment_id, diametro_plataforma, workflow_id, etapa_id, acessorio_sku) VALUES
    (v_empresa_id, v_fam_np, v_tipo_ab_mu, 'NP', v_wf_analogico, v_etapa_1, 'CIC-NP-35-20'),
    (v_empresa_id, v_fam_np, v_tipo_ab_mu, 'NP', v_wf_analogico, v_etapa_2, 'TRANS-NP'),
    (v_empresa_id, v_fam_np, v_tipo_ab_mu, 'NP', v_wf_analogico, v_etapa_3, 'ANAL-NP'),
    (v_empresa_id, v_fam_np, v_tipo_ab_ub, 'NP', v_wf_digital, v_etapa_1, 'CIC-NP-35-20'),
    (v_empresa_id, v_fam_np, v_tipo_ab_ub, 'NP', v_wf_digital, v_etapa_2, 'SCAN-NP');

  -- ============================================================
  -- MÓDULO 6: KITS
  -- ============================================================
  INSERT INTO catalogo_categorias_kit (id, empresa_id, nome) VALUES
    (gen_random_uuid(), v_empresa_id, 'Cirúrgico'),
    (gen_random_uuid(), v_empresa_id, 'Protético'),
    (gen_random_uuid(), v_empresa_id, 'Guiada')
  RETURNING id INTO v_cat_kit_cirurgico;

  SELECT id INTO v_cat_kit_cirurgico FROM catalogo_categorias_kit WHERE empresa_id = v_empresa_id AND nome = 'Cirúrgico';
  SELECT id INTO v_cat_kit_protetico FROM catalogo_categorias_kit WHERE empresa_id = v_empresa_id AND nome = 'Protético';

  INSERT INTO catalogo_kits (sku, empresa_id, categoria_id, nome, descricao, ativo) VALUES
    ('KIT-CIR-NP', v_empresa_id, v_cat_kit_cirurgico, 'Kit Cirúrgico NP Completo', 'Maleta com brocas, fresas e implantes NP para cirurgia completa.', true),
    ('KIT-CIR-GMF', v_empresa_id, v_cat_kit_cirurgico, 'Kit Cirúrgico GMF Completo', 'Maleta com brocas, fresas e implantes GMF para cirurgia completa.', true),
    ('KIT-PROT-NP', v_empresa_id, v_cat_kit_protetico, 'Kit Protético NP', 'Kit com acessórios protéticos para reabilitação NP.', true);

  -- Kit Famílias
  INSERT INTO catalogo_kit_familias (empresa_id, kit_sku, familia_id) VALUES
    (v_empresa_id, 'KIT-CIR-NP', v_fam_np),
    (v_empresa_id, 'KIT-CIR-GMF', v_fam_gmf),
    (v_empresa_id, 'KIT-PROT-NP', v_fam_np);

  -- Kit Composição (BOM)
  INSERT INTO catalogo_kit_composicao (empresa_id, kit_sku, quantidade, implante_sku) VALUES
    (v_empresa_id, 'KIT-CIR-NP', 6, 'IMP-NP-3508'),
    (v_empresa_id, 'KIT-CIR-NP', 4, 'IMP-NP-4308');
  INSERT INTO catalogo_kit_composicao (empresa_id, kit_sku, quantidade, fresa_sku) VALUES
    (v_empresa_id, 'KIT-CIR-NP', 2, 'FRESA-LANCA-20'),
    (v_empresa_id, 'KIT-CIR-NP', 2, 'FRESA-STOP-DRILL');
  INSERT INTO catalogo_kit_composicao (empresa_id, kit_sku, quantidade, acessorio_sku) VALUES
    (v_empresa_id, 'KIT-CIR-NP', 6, 'CIC-NP-35-20'),
    (v_empresa_id, 'KIT-CIR-NP', 6, 'TRANS-NP');
  INSERT INTO catalogo_kit_composicao (empresa_id, kit_sku, quantidade, chave_sku) VALUES
    (v_empresa_id, 'KIT-CIR-NP', 2, 'CHV-HEX-12');

  -- ============================================================
  -- COMERCIAL
  -- ============================================================
  INSERT INTO catalogo_cupons (empresa_id, codigo, tipo, valor, validade, ativo) VALUES
    (v_empresa_id, 'BEMVINDO10', 'percentual', 10, now() + interval '90 days', true),
    (v_empresa_id, 'FRETEGRATIS', 'fixo', 50, now() + interval '30 days', true),
    (v_empresa_id, 'EXPIRADO', 'percentual', 20, now() - interval '1 day', false);

  INSERT INTO catalogo_fretes (empresa_id, cep_inicio, cep_fim, valor, prazo_dias) VALUES
    (v_empresa_id, '01000000', '09999999', 35.00, 5),
    (v_empresa_id, '10000000', '19999999', 45.00, 7),
    (v_empresa_id, '20000000', '29999999', 55.00, 7),
    (v_empresa_id, '30000000', '99999999', 65.00, 10);

  INSERT INTO catalogo_promocionais (empresa_id, nome, descricao, preco, expira_em, ativo) VALUES
    (v_empresa_id, 'Kit Iniciante NP', 'Kit com 10 implantes NP Flex Gold + brocas + acessórios.', 4500.00, now() + interval '60 days', true),
    (v_empresa_id, 'Pacote Protético GMF', 'Abutments + acessórios para reabilitação GMF.', 2800.00, now() + interval '45 days', true);

  RAISE NOTICE 'Seed do Catálogo concluído com sucesso!';
END $$;
