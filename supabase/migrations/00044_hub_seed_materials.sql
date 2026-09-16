-- ============================================================
-- Migration 00044: Seed de Materiais e Trilhas
-- ============================================================

DO $$
DECLARE
  v_empresa UUID;
  v_user UUID;
BEGIN
  SELECT id INTO v_empresa FROM empresas LIMIT 1;
  SELECT id INTO v_user FROM auth.users LIMIT 1;

  IF v_empresa IS NULL OR v_user IS NULL THEN
    RAISE NOTICE 'Empresa ou Usuário não encontrado, pulando seed';
    RETURN;
  END IF;

  -- CLIENTES (6 materiais)
  INSERT INTO hub_materials (title, type, tags, category, points, allowed_roles, active, empresa_id, created_by) VALUES
    ('{"pt-br":"Guia de Cuidados com Implantes","en-us":"Implant Care Guide","es-es":"Guia de Cuidados con Implantes"}', 'pdf', '{implante,cuidados,saude}', 'odontologia', 15, '{client}', true, v_empresa, v_user),
    ('{"pt-br":"Tutorial de Higiene Bucal","en-us":"Oral Hygiene Tutorial","es-es":"Tutorial de Higiene Bucal"}', 'video', '{higiene,tutorial,prevencao}', 'odontologia', 20, '{client}', true, v_empresa, v_user),
    ('{"pt-br":"Como Escolher seu Protetor Bucal","en-us":"How to Choose Your Mouthguard","es-es":"Como Elegir tu Protector Bucal"}', 'pdf', '{protetor,escolha,dicas}', 'odontologia', 10, '{client}', true, v_empresa, v_user),
    ('{"pt-br":"Apresentacao da Clinica","en-us":"Clinic Presentation","es-es":"Presentacion de la Clinica"}', 'video', '{apresentacao,clinica,institucional}', 'institucional', 5, '{client}', true, v_empresa, v_user),
    ('{"pt-br":"Depoimentos de Pacientes","en-us":"Patient Testimonials","es-es":"Testimonios de Pacientes"}', 'video', '{depoimento,paciente,confianca}', 'marketing', 10, '{client}', true, v_empresa, v_user),
    ('{"pt-br":"Perguntas Frequentes sobre Implantes","en-us":"FAQ about Implants","es-es":"Preguntas Frecuentes sobre Implantes"}', 'html', '{faq,implante,duvidas}', 'odontologia', 10, '{client}', true, v_empresa, v_user);

  -- CONSULTORES (7 materiais)
  INSERT INTO hub_materials (title, type, tags, category, points, allowed_roles, active, empresa_id, created_by) VALUES
    ('{"pt-br":"Manual do Consultor Tecnico","en-us":"Technical Consultant Manual","es-es":"Manual del Consultor Tecnico"}', 'pdf', '{consultor,manual,tecnico}', 'gestao', 50, '{consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Tecnicas de Vendas Consultivas","en-us":"Consultative Sales Techniques","es-es":"Tecnicas de Ventas Consultivas"}', 'video', '{vendas,consultivo,tecnica}', 'vendas', 30, '{consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Apresentacao Comercial Padrao","en-us":"Standard Sales Presentation","es-es":"Presentacion Comercial Estandar"}', 'pdf', '{apresentacao,comercial,vendas}', 'vendas', 25, '{consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Catalogo de Produtos 2024","en-us":"2024 Product Catalog","es-es":"Catalogo de Productos 2024"}', 'pdf', '{catalogo,produtos,2024}', 'odontologia', 20, '{consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Gestao de Relacionamento com Cliente","en-us":"Customer Relationship Management","es-es":"Gestion de Relacion con el Cliente"}', 'video', '{crm,relacionamento,gestao}', 'gestao', 35, '{consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Planilha de Metas e Comissoes","en-us":"Goals and Commissions Spreadsheet","es-es":"Hoja de Metas y Comisiones"}', 'pdf', '{metas,comissoes,planilha}', 'gestao', 15, '{consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Treinamento de Novos Consultores","en-us":"New Consultant Training","es-es":"Capacitacion de Nuevos Consultores"}', 'video', '{treinamento,novo,onboarding}', 'treinamento', 40, '{consultant}', true, v_empresa, v_user);

  -- DISTRIBUIDORES (6 materiais)
  INSERT INTO hub_materials (title, type, tags, category, points, allowed_roles, active, empresa_id, created_by) VALUES
    ('{"pt-br":"Manual do Distribuidor","en-us":"Distributor Manual","es-es":"Manual del Distribuidor"}', 'pdf', '{distribuidor,manual,operacoes}', 'gestao', 40, '{distributor}', true, v_empresa, v_user),
    ('{"pt-br":"Estrategias de Marketing para Parceiros","en-us":"Partner Marketing Strategies","es-es":"Estrategias de Marketing para Socios"}', 'video', '{marketing,parceiro,estrategia}', 'marketing', 30, '{distributor}', true, v_empresa, v_user),
    ('{"pt-br":"Kit de Materiais para Revenda","en-us":"Resale Material Kit","es-es":"Kit de Materiales para Reventa"}', 'pdf', '{kit,revenda,materiais}', 'marketing', 20, '{distributor}', true, v_empresa, v_user),
    ('{"pt-br":"Politica de Precos e Condicoes Comerciais","en-us":"Pricing and Commercial Terms","es-es":"Politica de Precios y Condiciones Comerciales"}', 'pdf', '{preco,comercial,politica}', 'comercial', 15, '{distributor}', true, v_empresa, v_user),
    ('{"pt-br":"Treinamento de Produto - Linha Premium","en-us":"Product Training - Premium Line","es-es":"Capacitacion de Producto - Linea Premium"}', 'video', '{treinamento,premium,produto}', 'treinamento', 35, '{distributor}', true, v_empresa, v_user),
    ('{"pt-br":"Dashboard de Vendas do Parceiro","en-us":"Partner Sales Dashboard","es-es":"Panel de Ventas del Socio"}', 'html', '{dashboard,vendas,analytics}', 'gestao', 25, '{distributor}', true, v_empresa, v_user);

  -- GESTORES (6 materiais)
  INSERT INTO hub_materials (title, type, tags, category, points, allowed_roles, active, empresa_id, created_by) VALUES
    ('{"pt-br":"Gestao de Clinica Completa","en-us":"Complete Clinic Management","es-es":"Gestion de Clinica Completa"}', 'video', '{gestao,clinica,completo}', 'gestao', 60, '{manager}', true, v_empresa, v_user),
    ('{"pt-br":"KPIs e Metricas para Odontologia","en-us":"KPIs and Metrics for Dentistry","es-es":"KPIs y Metricas para Odontologia"}', 'pdf', '{kpi,metrica,analytics}', 'gestao', 45, '{manager}', true, v_empresa, v_user),
    ('{"pt-br":"Lideranca e Gestao de Equipe","en-us":"Leadership and Team Management","es-es":"Liderazgo y Gestion de Equipo"}', 'video', '{lideranca,equipe,gestao}', 'gestao', 50, '{manager}', true, v_empresa, v_user),
    ('{"pt-br":"Financeiro da Clinica - Controle Completo","en-us":"Clinic Financial - Full Control","es-es":"Financiero de la Clinica - Control Total"}', 'pdf', '{financeiro,controle,orcamento}', 'gestao', 40, '{manager}', true, v_empresa, v_user),
    ('{"pt-br":"Marketing Digital para Clinicas","en-us":"Digital Marketing for Clinics","es-es":"Marketing Digital para Clinicas"}', 'video', '{marketing,digital,clinica}', 'marketing', 35, '{manager}', true, v_empresa, v_user),
    ('{"pt-br":"Compliance e Regulamentacao Odontologica","en-us":"Dental Compliance and Regulation","es-es":"Cumplimiento y Regulacion Odontologica"}', 'pdf', '{compliance,regulamentacao,legal}', 'juridico', 30, '{manager}', true, v_empresa, v_user);

  -- TRILHAS (3 trilhas)
  INSERT INTO hub_collections (title, description, points, allowed_roles, active, empresa_id, created_by) VALUES
    ('{"pt-br":"Trilha Bem-Vindo ao Hub","en-us":"Welcome to Hub Trail","es-es":"Bienvenido al Hub Trail"}',
     '{"pt-br":"Primeiros passos no Conexao Hub","en-us":"First steps in Conexao Hub","es-es":"Primeros pasos en Conexao Hub"}',
     100, '{client,distributor,consultant}', true, v_empresa, v_user),
    ('{"pt-br":"Trilha Vendas e Comercial","en-us":"Sales and Commercial Trail","es-es":"Ventas y Comercial Trail"}',
     '{"pt-br":"Aprenda tecnicas de vendas e relacionamento","en-us":"Learn sales and relationship techniques","es-es":"Aprende tecnicas de ventas y relacion"}',
     200, '{consultant,distributor}', true, v_empresa, v_user),
    ('{"pt-br":"Trilha Gestao e Lideranca","en-us":"Management and Leadership Trail","es-es":"Gestion y Liderazgo Trail"}',
     '{"pt-br":"Gestao completa de clinica e equipe","en-us":"Complete clinic and team management","es-es":"Gestion completa de clinica y equipo"}',
     300, '{manager}', true, v_empresa, v_user);

  RAISE NOTICE 'Seed concluido: 25 materiais + 3 trilhas';
END $$;
