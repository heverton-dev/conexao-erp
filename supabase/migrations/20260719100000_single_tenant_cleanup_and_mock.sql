-- ============================================================
-- MIGRATION: Single-Tenant Cleanup + Mock Data
-- Data: 2026-07-19
-- Empresa: CONEXÃO IMPLANTES (1a00d0fe-0d10-48b2-aff7-68e941967f0f)
-- ============================================================

-- ============================================================
-- PARTE 1: LIMPEZA - Manter apenas profiles, credenciais, usuarios, empresas
-- ============================================================

-- Tabelas do catálogo (DADOS - manter estrutura, limpar dados)
TRUNCATE TABLE catalogo_pedido_itens CASCADE;
TRUNCATE TABLE catalogo_pedidos CASCADE;
TRUNCATE TABLE catalogo_orcamento_itens CASCADE;
TRUNCATE TABLE catalogo_orcamentos CASCADE;
TRUNCATE TABLE catalogo_favoritos CASCADE;
TRUNCATE TABLE catalogo_promocional_itens CASCADE;
TRUNCATE TABLE catalogo_promocionais CASCADE;
TRUNCATE TABLE catalogo_cupons CASCADE;
TRUNCATE TABLE catalogo_cliente_permissoes CASCADE;
TRUNCATE TABLE catalogo_solicitacoes_acesso CASCADE;
TRUNCATE TABLE catalogo_clientes CASCADE;
TRUNCATE TABLE catalogo_grupos_clientes CASCADE;
TRUNCATE TABLE catalogo_kit_opcionais CASCADE;
TRUNCATE TABLE catalogo_kit_fresas CASCADE;
TRUNCATE TABLE catalogo_kit_complementares CASCADE;
TRUNCATE TABLE catalogo_kit_implantes CASCADE;
TRUNCATE TABLE catalogo_kit_chaves CASCADE;
TRUNCATE TABLE catalogo_kits CASCADE;
TRUNCATE TABLE catalogo_implante_kit CASCADE;
TRUNCATE TABLE catalogo_implante_abutment CASCADE;
TRUNCATE TABLE catalogo_implante_chaves CASCADE;
TRUNCATE TABLE catalogo_implantes CASCADE;
TRUNCATE TABLE catalogo_abutments CASCADE;
TRUNCATE TABLE catalogo_componentes CASCADE;
TRUNCATE TABLE catalogo_complementares CASCADE;
TRUNCATE TABLE catalogo_parafusos_retensao CASCADE;
TRUNCATE TABLE catalogo_parafusos CASCADE;
TRUNCATE TABLE catalogo_fresas CASCADE;
TRUNCATE TABLE catalogo_cicatrizadores CASCADE;
TRUNCATE TABLE catalogo_chaves CASCADE;
TRUNCATE TABLE catalogo_opcionais CASCADE;
TRUNCATE TABLE catalogo_imagens_produto CASCADE;
TRUNCATE TABLE catalogo_fretes CASCADE;
TRUNCATE TABLE catalogo_configuracoes CASCADE;
TRUNCATE TABLE catalogo_design_config CASCADE;
TRUNCATE TABLE catalogo_tipos_kits CASCADE;
TRUNCATE TABLE catalogo_tipos_fresas CASCADE;
TRUNCATE TABLE catalogo_tipos_chaves CASCADE;
TRUNCATE TABLE catalogo_tipos_complementares CASCADE;
TRUNCATE TABLE catalogo_tipos_opcionais CASCADE;
TRUNCATE TABLE catalogo_tipos_ossos CASCADE;
TRUNCATE TABLE catalogo_categorias CASCADE;
TRUNCATE TABLE catalogo_protocolo_fresagem CASCADE;
TRUNCATE TABLE catalogo_protocolos_fresagens CASCADE;
TRUNCATE TABLE catalogo_protocolos_fresas_itens CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_workflows CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_reabilitacao_familias CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_reabilitacao CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_parafusos CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_componentes CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_cicatrizadores CASCADE;
TRUNCATE TABLE catalogo_cps_tipos_abutments CASCADE;
TRUNCATE TABLE catalogo_cps_etapas_workflows CASCADE;
TRUNCATE TABLE catalogo_ips_linhas CASCADE;
TRUNCATE TABLE catalogo_ips_familias CASCADE;
TRUNCATE TABLE catalogo_ips_conexoes CASCADE;

-- Tabelas de módulos auxiliares (limpar dados)
TRUNCATE TABLE agentes_conversas CASCADE;
TRUNCATE TABLE agentes_knowledge_docs CASCADE;
TRUNCATE TABLE agentes_knowledge_tabelas CASCADE;
TRUNCATE TABLE api_connectors CASCADE;
TRUNCATE TABLE atividades CASCADE;
TRUNCATE TABLE cadastros_enderecos CASCADE;
TRUNCATE TABLE cadastros_pf CASCADE;
TRUNCATE TABLE cadastros_pj CASCADE;
TRUNCATE TABLE cadastros CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE convites_acesso CASCADE;
TRUNCATE TABLE design_sistema_global CASCADE;
TRUNCATE TABLE design_sistema_modulo CASCADE;
TRUNCATE TABLE design_system_presets CASCADE;
TRUNCATE TABLE despesas_envios CASCADE;
TRUNCATE TABLE despesas_pagamentos CASCADE;
TRUNCATE TABLE despesas_periodos CASCADE;
TRUNCATE TABLE despesas_tipos CASCADE;
TRUNCATE TABLE despesas CASCADE;
TRUNCATE TABLE documentos CASCADE;
TRUNCATE TABLE empresa_design_system CASCADE;
TRUNCATE TABLE empresa_modulo_limits CASCADE;
TRUNCATE TABLE empresa_modulos CASCADE;
TRUNCATE TABLE empresa_role_limits CASCADE;
TRUNCATE TABLE form_schema CASCADE;
TRUNCATE TABLE funis_colunas CASCADE;
TRUNCATE TABLE funis_permissoes CASCADE;
TRUNCATE TABLE funis_tarefas CASCADE;
TRUNCATE TABLE funis_template_cols CASCADE;
TRUNCATE TABLE funis_template_tasks CASCADE;
TRUNCATE TABLE funis_templates CASCADE;
TRUNCATE TABLE funis CASCADE;
TRUNCATE TABLE gerador_link_cliques CASCADE;
TRUNCATE TABLE gerador_links CASCADE;
TRUNCATE TABLE gerador_templates CASCADE;
TRUNCATE TABLE hub_access_logs CASCADE;
TRUNCATE TABLE hub_badges CASCADE;
TRUNCATE TABLE hub_chatbot_config CASCADE;
TRUNCATE TABLE hub_collection_items CASCADE;
TRUNCATE TABLE hub_collection_progress CASCADE;
TRUNCATE TABLE hub_collections CASCADE;
TRUNCATE TABLE hub_gamification_levels CASCADE;
TRUNCATE TABLE hub_invite_tokens CASCADE;
TRUNCATE TABLE hub_material_assets CASCADE;
TRUNCATE TABLE hub_materials CASCADE;
TRUNCATE TABLE hub_system_config CASCADE;
TRUNCATE TABLE hub_system_integrations CASCADE;
TRUNCATE TABLE hub_user_badges CASCADE;
TRUNCATE TABLE hub_user_progress CASCADE;
TRUNCATE TABLE hub_user_roles CASCADE;
TRUNCATE TABLE integracoes_config CASCADE;
TRUNCATE TABLE links_testes CASCADE;
TRUNCATE TABLE linktree_colaboradores CASCADE;
TRUNCATE TABLE linktree_empresa_clicks CASCADE;
TRUNCATE TABLE linktree_empresa_config CASCADE;
TRUNCATE TABLE linktree_empresa_links CASCADE;
TRUNCATE TABLE linktree_empresa_sections CASCADE;
TRUNCATE TABLE linktree_tema_config CASCADE;
TRUNCATE TABLE logs_transferencia CASCADE;
TRUNCATE TABLE logs_transferencia_consultor CASCADE;
TRUNCATE TABLE mapas_consultants CASCADE;
TRUNCATE TABLE mapas_distributors CASCADE;
TRUNCATE TABLE metas CASCADE;
TRUNCATE TABLE mktg_calendario CASCADE;
TRUNCATE TABLE mktg_campanhas_email CASCADE;
TRUNCATE TABLE mktg_criativos CASCADE;
TRUNCATE TABLE mktg_disparos_email CASCADE;
TRUNCATE TABLE mktg_eventos CASCADE;
TRUNCATE TABLE mktg_landing_pages_versoes CASCADE;
TRUNCATE TABLE mktg_landing_pages CASCADE;
TRUNCATE TABLE mktg_leads CASCADE;
TRUNCATE TABLE mktg_meta_campanhas CASCADE;
TRUNCATE TABLE mktg_meta_contas CASCADE;
TRUNCATE TABLE mktg_meta_insights CASCADE;
TRUNCATE TABLE mktg_meta_posts CASCADE;
TRUNCATE TABLE mktg_pixels CASCADE;
TRUNCATE TABLE mktg_utms CASCADE;
TRUNCATE TABLE mktg_whatsapp_campanhas CASCADE;
TRUNCATE TABLE mock_credentials CASCADE;
TRUNCATE TABLE modelos_ia_versoes CASCADE;
TRUNCATE TABLE modelos_ia CASCADE;
TRUNCATE TABLE modulos_manutencao CASCADE;
TRUNCATE TABLE notificacoes_templates CASCADE;
TRUNCATE TABLE notificacoes CASCADE;
TRUNCATE TABLE nps_perguntas CASCADE;
TRUNCATE TABLE nps_relatorios_envio CASCADE;
TRUNCATE TABLE nps_respostas CASCADE;
TRUNCATE TABLE nps_webhook_config CASCADE;
TRUNCATE TABLE pacientes_backup CASCADE;
TRUNCATE TABLE permissoes CASCADE;
TRUNCATE TABLE pipeline_estagios CASCADE;
TRUNCATE TABLE rotas_clientes_base CASCADE;
TRUNCATE TABLE rotas_clientes CASCADE;
TRUNCATE TABLE rotas_config CASCADE;
TRUNCATE TABLE rotas_form_perguntas CASCADE;
TRUNCATE TABLE rotas_trajetos CASCADE;
TRUNCATE TABLE rotas_visitas CASCADE;
TRUNCATE TABLE rotas CASCADE;
TRUNCATE TABLE tarefas CASCADE;
TRUNCATE TABLE templates_mensagem CASCADE;
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE webhook_logs CASCADE;
TRUNCATE TABLE webhooks CASCADE;
TRUNCATE TABLE app_config CASCADE;
TRUNCATE TABLE demo_credentials CASCADE;

-- ============================================================
-- PARTE 2: DADOS MOCK - CONEXÃO IMPLANTES
-- ============================================================

-- UUID fixo da empresa
-- 1a00d0fe-0d10-48b2-aff7-68e941967f0f

-- --- CONEXÕES (famílias de implantes) ---
INSERT INTO catalogo_ips_conexoes (id, empresa_id, nome, slug, ativo, ordem) VALUES
  ('c0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Conexão Hexagonal', 'hexagonal', true, 1),
  ('c0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Conexão Octogonal', 'octogonal', true, 2),
  ('c0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Conexão Retangular', 'retangular', true, 3);

-- --- FAMÍLIAS ---
INSERT INTO catalogo_ips_familias (id, empresa_id, conexao_id, nome, slug, ativo, ordem) VALUES
  ('f0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Família Standard', 'standard', true, 1),
  ('f0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000001', 'Família Premium', 'premium', true, 2),
  ('f0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'c0000001-0000-0000-0000-000000000002', 'Família Compact', 'compact', true, 1);

-- --- LINHAS ---
INSERT INTO catalogo_ips_linhas (id, empresa_id, familia_id, nome, slug, ativo, ordem) VALUES
  ('l0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'f0000001-0000-0000-0000-000000000001', 'Linha 3.5mm', '3-5mm', true, 1),
  ('l0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'f0000001-0000-0000-0000-000000000001', 'Linha 4.0mm', '4-0mm', true, 2),
  ('l0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'f0000001-0000-0000-0000-000000000002', 'Linha 4.5mm Premium', '4-5mm-premium', true, 1);

-- --- IMPLANTES ---
INSERT INTO catalogo_implantes (id, empresa_id, sku, nome, linha_id, diametro_mm, comprimento_mm, preco, ativo) VALUES
  ('i0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'IMP-3510', 'Implante Hex 3.5x10', 'l0000001-0000-0000-0000-000000000001', 3.5, 10, 189.90, true),
  ('i0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'IMP-4012', 'Implante Hex 4.0x12', 'l0000001-0000-0000-0000-000000000002', 4.0, 12, 219.90, true),
  ('i0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'IMP-4514', 'Implante Premium 4.5x14', 'l0000001-0000-0000-0000-000000000003', 4.5, 14, 299.90, true);

-- --- ABUTMENTS ---
INSERT INTO catalogo_abutments (id, empresa_id, sku, nome, diametro_mm, altura_mm, angulo, preco, ativo) VALUES
  ('a0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ABT-35H', 'Abutment Hex 3.5', 3.5, 8, 0, 89.90, true),
  ('a0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ABT-40A', 'Abutment Angulado 4.0', 4.0, 10, 15, 129.90, true),
  ('a0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'ABT-45H', 'Abutment Hex 4.5', 4.5, 8, 0, 99.90, true);

-- --- COMPONENTES (parafusos, etc) ---
INSERT INTO catalogo_componentes (id, empresa_id, sku, nome, descricao, preco, ativo) VALUES
  ('cp000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'CMP-PAR35', 'Parafuso de Fixação 3.5mm', 'Parafuso hexagonal para fixação de abutment', 29.90, true),
  ('cp000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'CMP-PAR40', 'Parafuso de Fixação 4.0mm', 'Parafuso hexagonal para fixação de abutment', 34.90, true),
  ('cp000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'CMP-TORQ', 'Chave de Torque', 'Chave calibrada para aperto de parafusos', 149.90, true);

-- --- TIPOS DE KIT ---
INSERT INTO catalogo_tipos_kits (id, empresa_id, nome, slug, ativo, ordem) VALUES
  ('tk000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kit Cirúrgico', 'cirurgico', true, 1),
  ('tk000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kit Prótese', 'protese', true, 2),
  ('tk000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kit Completo', 'completo', true, 3);

-- --- KITS ---
INSERT INTO catalogo_kits (id, empresa_id, tipo_kit_id, sku, nome, descricao, preco, ativo) VALUES
  ('k0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'tk000001-0000-0000-0000-000000000001', 'KIT-CIR01', 'Kit Cirúrgico Básico', 'Kit completo para cirurgia de implante', 899.90, true),
  ('k0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'tk000001-0000-0000-0000-000000000002', 'KIT-PRO01', 'Kit Prótese Standard', 'Kit para reabilitação protética', 1299.90, true),
  ('k0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'tk000001-0000-0000-0000-000000000003', 'KIT-CMP01', 'Kit Completo Premium', 'Kit全套 completo com implantes e acessórios', 2499.90, true);

-- --- PROMOCIONAIS ---
INSERT INTO catalogo_promocionais (id, empresa_id, titulo, descricao, preco_original, preco_promocional, percentual_desconto, ativo, data_inicio, data_fim) VALUES
  ('p0000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kit Cirúrgico com 15% OFF', 'Aproveite 15% de desconto no Kit Cirúrgico Básico', 899.90, 764.92, 15, true, '2026-07-01', '2026-08-31'),
  ('p0000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Combo Implante + Abutment', 'Compre implante e ganhe desconto no abutment', 319.80, 269.90, 16, true, '2026-07-01', '2026-07-31'),
  ('p0000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Frete Grátis Acima de R$ 500', 'Frete grátis para pedidos acima de R$ 500,00', 0, 0, 0, true, '2026-07-01', '2026-12-31');

-- --- CATEGORIAS ---
INSERT INTO catalogo_categorias (id, empresa_id, nome, slug, ativo, ordem) VALUES
  ('cat00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Implantes', 'implantes', true, 1),
  ('cat00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Componentes', 'componentes', true, 2),
  ('cat00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Kits', 'kits', true, 3);

-- --- GRUPOS DE CLIENTES ---
INSERT INTO catalogo_grupos_clientes (id, empresa_id, nome, descricao, ativo) VALUES
  ('gc000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Clínicas Parceiras', 'Clínicas com contrato ativo', true),
  ('gc000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Distribuidores', 'Revendedores autorizados', true),
  ('gc000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Profissionais Autônomos', 'Dentistas independentes', true);

-- --- CLIENTES ---
INSERT INTO catalogo_clientes (id, empresa_id, nome, email, telefone, grupo_id, ativo) VALUES
  ('cl000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dr. João Silva', 'joao.silva@clinica.com.br', '(11) 99999-1111', 'gc000001-0000-0000-0000-000000000001', true),
  ('cl000001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dra. Maria Santos', 'maria.santos@odonto.com.br', '(21) 98888-2222', 'gc000001-0000-0000-0000-000000000001', true),
  ('cl000001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'Dental Store LTDA', 'contato@dentalstore.com.br', '(31) 97777-3333', 'gc000001-0000-0000-0000-000000000002', true);

-- --- DESIGN CONFIG ---
INSERT INTO catalogo_design_config (id, empresa_id, accent, accent_hover, accent_fg, bg, surface, surface_hover, card, text_main, text_muted, border_subtle) VALUES
  ('dc000001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', '#c1a655', '#d4b96a', '#ffffff', '#0a0f1a', '#111827', '#1e293b', '#1e293b', '#ffffff', '#94a3b8', '#1e293b');

-- --- CONFIGURAÇÕES ---
INSERT INTO catalogo_configuracoes (id, empresa_id, chave, valor) VALUES
  ('cfg00001-0000-0000-0000-000000000001', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'moeda', 'BRL'),
  ('cfg00001-0000-0000-0000-000000000002', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'idioma', 'pt-BR'),
  ('cfg00001-0000-0000-0000-000000000003', '1a00d0fe-0d10-48b2-aff7-68e941967f0f', 'frete_gratis_acima', '500');

-- ============================================================
-- FIM
-- ============================================================
