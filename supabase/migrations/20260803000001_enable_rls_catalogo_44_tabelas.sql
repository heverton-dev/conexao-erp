-- ============================================================
-- Migration: habilita RLS + policies abertas nas 44 tabelas catalogo_* sem RLS
-- Data: 2026-08-03
-- Descrição: achado B3 de docs/agents/varredura-2026-08-03.md — 44 tabelas
--   catalogo_* estavam sem ENABLE ROW LEVEL SECURITY, contra a convenção do
--   projeto (RLS aberta por design, USING (true) nos 4 verbos, autorização na
--   aplicação). Duas delas guardam dado de acesso/permissão:
--   catalogo_cliente_permissoes e catalogo_solicitacoes_acesso.
--   Risco baixo: USING (true) é equivalente a sem RLS para anon/authenticated,
--   só fecha a lacuna de convenção. Independente da reconciliação de drift.
-- ============================================================

BEGIN;

ALTER TABLE catalogo_abutments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_abutments_select" ON catalogo_abutments;
CREATE POLICY "catalogo_abutments_select" ON catalogo_abutments FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_abutments_insert" ON catalogo_abutments;
CREATE POLICY "catalogo_abutments_insert" ON catalogo_abutments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_abutments_update" ON catalogo_abutments;
CREATE POLICY "catalogo_abutments_update" ON catalogo_abutments FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_abutments_delete" ON catalogo_abutments;
CREATE POLICY "catalogo_abutments_delete" ON catalogo_abutments FOR DELETE USING (true);

ALTER TABLE catalogo_categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_categorias_select" ON catalogo_categorias;
CREATE POLICY "catalogo_categorias_select" ON catalogo_categorias FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_categorias_insert" ON catalogo_categorias;
CREATE POLICY "catalogo_categorias_insert" ON catalogo_categorias FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_categorias_update" ON catalogo_categorias;
CREATE POLICY "catalogo_categorias_update" ON catalogo_categorias FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_categorias_delete" ON catalogo_categorias;
CREATE POLICY "catalogo_categorias_delete" ON catalogo_categorias FOR DELETE USING (true);

ALTER TABLE catalogo_chaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_chaves_select" ON catalogo_chaves;
CREATE POLICY "catalogo_chaves_select" ON catalogo_chaves FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_chaves_insert" ON catalogo_chaves;
CREATE POLICY "catalogo_chaves_insert" ON catalogo_chaves FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_chaves_update" ON catalogo_chaves;
CREATE POLICY "catalogo_chaves_update" ON catalogo_chaves FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_chaves_delete" ON catalogo_chaves;
CREATE POLICY "catalogo_chaves_delete" ON catalogo_chaves FOR DELETE USING (true);

ALTER TABLE catalogo_cicatrizadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cicatrizadores_select" ON catalogo_cicatrizadores;
CREATE POLICY "catalogo_cicatrizadores_select" ON catalogo_cicatrizadores FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cicatrizadores_insert" ON catalogo_cicatrizadores;
CREATE POLICY "catalogo_cicatrizadores_insert" ON catalogo_cicatrizadores FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cicatrizadores_update" ON catalogo_cicatrizadores;
CREATE POLICY "catalogo_cicatrizadores_update" ON catalogo_cicatrizadores FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cicatrizadores_delete" ON catalogo_cicatrizadores;
CREATE POLICY "catalogo_cicatrizadores_delete" ON catalogo_cicatrizadores FOR DELETE USING (true);

ALTER TABLE catalogo_cliente_permissoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cliente_permissoes_select" ON catalogo_cliente_permissoes;
CREATE POLICY "catalogo_cliente_permissoes_select" ON catalogo_cliente_permissoes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cliente_permissoes_insert" ON catalogo_cliente_permissoes;
CREATE POLICY "catalogo_cliente_permissoes_insert" ON catalogo_cliente_permissoes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cliente_permissoes_update" ON catalogo_cliente_permissoes;
CREATE POLICY "catalogo_cliente_permissoes_update" ON catalogo_cliente_permissoes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cliente_permissoes_delete" ON catalogo_cliente_permissoes;
CREATE POLICY "catalogo_cliente_permissoes_delete" ON catalogo_cliente_permissoes FOR DELETE USING (true);

ALTER TABLE catalogo_complementares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_complementares_select" ON catalogo_complementares;
CREATE POLICY "catalogo_complementares_select" ON catalogo_complementares FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_complementares_insert" ON catalogo_complementares;
CREATE POLICY "catalogo_complementares_insert" ON catalogo_complementares FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_complementares_update" ON catalogo_complementares;
CREATE POLICY "catalogo_complementares_update" ON catalogo_complementares FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_complementares_delete" ON catalogo_complementares;
CREATE POLICY "catalogo_complementares_delete" ON catalogo_complementares FOR DELETE USING (true);

ALTER TABLE catalogo_componentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_componentes_select" ON catalogo_componentes;
CREATE POLICY "catalogo_componentes_select" ON catalogo_componentes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_componentes_insert" ON catalogo_componentes;
CREATE POLICY "catalogo_componentes_insert" ON catalogo_componentes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_componentes_update" ON catalogo_componentes;
CREATE POLICY "catalogo_componentes_update" ON catalogo_componentes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_componentes_delete" ON catalogo_componentes;
CREATE POLICY "catalogo_componentes_delete" ON catalogo_componentes FOR DELETE USING (true);

ALTER TABLE catalogo_configuracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_configuracoes_select" ON catalogo_configuracoes;
CREATE POLICY "catalogo_configuracoes_select" ON catalogo_configuracoes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_configuracoes_insert" ON catalogo_configuracoes;
CREATE POLICY "catalogo_configuracoes_insert" ON catalogo_configuracoes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_configuracoes_update" ON catalogo_configuracoes;
CREATE POLICY "catalogo_configuracoes_update" ON catalogo_configuracoes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_configuracoes_delete" ON catalogo_configuracoes;
CREATE POLICY "catalogo_configuracoes_delete" ON catalogo_configuracoes FOR DELETE USING (true);

ALTER TABLE catalogo_cps_etapas_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_etapas_workflows_select" ON catalogo_cps_etapas_workflows;
CREATE POLICY "catalogo_cps_etapas_workflows_select" ON catalogo_cps_etapas_workflows FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_etapas_workflows_insert" ON catalogo_cps_etapas_workflows;
CREATE POLICY "catalogo_cps_etapas_workflows_insert" ON catalogo_cps_etapas_workflows FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_etapas_workflows_update" ON catalogo_cps_etapas_workflows;
CREATE POLICY "catalogo_cps_etapas_workflows_update" ON catalogo_cps_etapas_workflows FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_etapas_workflows_delete" ON catalogo_cps_etapas_workflows;
CREATE POLICY "catalogo_cps_etapas_workflows_delete" ON catalogo_cps_etapas_workflows FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_abutments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_abutments_select" ON catalogo_cps_tipos_abutments;
CREATE POLICY "catalogo_cps_tipos_abutments_select" ON catalogo_cps_tipos_abutments FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_abutments_insert" ON catalogo_cps_tipos_abutments;
CREATE POLICY "catalogo_cps_tipos_abutments_insert" ON catalogo_cps_tipos_abutments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_abutments_update" ON catalogo_cps_tipos_abutments;
CREATE POLICY "catalogo_cps_tipos_abutments_update" ON catalogo_cps_tipos_abutments FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_abutments_delete" ON catalogo_cps_tipos_abutments;
CREATE POLICY "catalogo_cps_tipos_abutments_delete" ON catalogo_cps_tipos_abutments FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_cicatrizadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_cicatrizadores_select" ON catalogo_cps_tipos_cicatrizadores;
CREATE POLICY "catalogo_cps_tipos_cicatrizadores_select" ON catalogo_cps_tipos_cicatrizadores FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_cicatrizadores_insert" ON catalogo_cps_tipos_cicatrizadores;
CREATE POLICY "catalogo_cps_tipos_cicatrizadores_insert" ON catalogo_cps_tipos_cicatrizadores FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_cicatrizadores_update" ON catalogo_cps_tipos_cicatrizadores;
CREATE POLICY "catalogo_cps_tipos_cicatrizadores_update" ON catalogo_cps_tipos_cicatrizadores FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_cicatrizadores_delete" ON catalogo_cps_tipos_cicatrizadores;
CREATE POLICY "catalogo_cps_tipos_cicatrizadores_delete" ON catalogo_cps_tipos_cicatrizadores FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_componentes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_componentes_select" ON catalogo_cps_tipos_componentes;
CREATE POLICY "catalogo_cps_tipos_componentes_select" ON catalogo_cps_tipos_componentes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_componentes_insert" ON catalogo_cps_tipos_componentes;
CREATE POLICY "catalogo_cps_tipos_componentes_insert" ON catalogo_cps_tipos_componentes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_componentes_update" ON catalogo_cps_tipos_componentes;
CREATE POLICY "catalogo_cps_tipos_componentes_update" ON catalogo_cps_tipos_componentes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_componentes_delete" ON catalogo_cps_tipos_componentes;
CREATE POLICY "catalogo_cps_tipos_componentes_delete" ON catalogo_cps_tipos_componentes FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_parafusos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_parafusos_select" ON catalogo_cps_tipos_parafusos;
CREATE POLICY "catalogo_cps_tipos_parafusos_select" ON catalogo_cps_tipos_parafusos FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_parafusos_insert" ON catalogo_cps_tipos_parafusos;
CREATE POLICY "catalogo_cps_tipos_parafusos_insert" ON catalogo_cps_tipos_parafusos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_parafusos_update" ON catalogo_cps_tipos_parafusos;
CREATE POLICY "catalogo_cps_tipos_parafusos_update" ON catalogo_cps_tipos_parafusos FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_parafusos_delete" ON catalogo_cps_tipos_parafusos;
CREATE POLICY "catalogo_cps_tipos_parafusos_delete" ON catalogo_cps_tipos_parafusos FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_reabilitacao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_select" ON catalogo_cps_tipos_reabilitacao;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_select" ON catalogo_cps_tipos_reabilitacao FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_insert" ON catalogo_cps_tipos_reabilitacao;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_insert" ON catalogo_cps_tipos_reabilitacao FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_update" ON catalogo_cps_tipos_reabilitacao;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_update" ON catalogo_cps_tipos_reabilitacao FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_delete" ON catalogo_cps_tipos_reabilitacao;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_delete" ON catalogo_cps_tipos_reabilitacao FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_reabilitacao_familias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_familias_select" ON catalogo_cps_tipos_reabilitacao_familias;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_familias_select" ON catalogo_cps_tipos_reabilitacao_familias FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_familias_insert" ON catalogo_cps_tipos_reabilitacao_familias;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_familias_insert" ON catalogo_cps_tipos_reabilitacao_familias FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_familias_update" ON catalogo_cps_tipos_reabilitacao_familias;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_familias_update" ON catalogo_cps_tipos_reabilitacao_familias FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_reabilitacao_familias_delete" ON catalogo_cps_tipos_reabilitacao_familias;
CREATE POLICY "catalogo_cps_tipos_reabilitacao_familias_delete" ON catalogo_cps_tipos_reabilitacao_familias FOR DELETE USING (true);

ALTER TABLE catalogo_cps_tipos_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cps_tipos_workflows_select" ON catalogo_cps_tipos_workflows;
CREATE POLICY "catalogo_cps_tipos_workflows_select" ON catalogo_cps_tipos_workflows FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_workflows_insert" ON catalogo_cps_tipos_workflows;
CREATE POLICY "catalogo_cps_tipos_workflows_insert" ON catalogo_cps_tipos_workflows FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_workflows_update" ON catalogo_cps_tipos_workflows;
CREATE POLICY "catalogo_cps_tipos_workflows_update" ON catalogo_cps_tipos_workflows FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cps_tipos_workflows_delete" ON catalogo_cps_tipos_workflows;
CREATE POLICY "catalogo_cps_tipos_workflows_delete" ON catalogo_cps_tipos_workflows FOR DELETE USING (true);

ALTER TABLE catalogo_cupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_cupons_select" ON catalogo_cupons;
CREATE POLICY "catalogo_cupons_select" ON catalogo_cupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_cupons_insert" ON catalogo_cupons;
CREATE POLICY "catalogo_cupons_insert" ON catalogo_cupons FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cupons_update" ON catalogo_cupons;
CREATE POLICY "catalogo_cupons_update" ON catalogo_cupons FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_cupons_delete" ON catalogo_cupons;
CREATE POLICY "catalogo_cupons_delete" ON catalogo_cupons FOR DELETE USING (true);

ALTER TABLE catalogo_design_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_design_config_select" ON catalogo_design_config;
CREATE POLICY "catalogo_design_config_select" ON catalogo_design_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_design_config_insert" ON catalogo_design_config;
CREATE POLICY "catalogo_design_config_insert" ON catalogo_design_config FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_design_config_update" ON catalogo_design_config;
CREATE POLICY "catalogo_design_config_update" ON catalogo_design_config FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_design_config_delete" ON catalogo_design_config;
CREATE POLICY "catalogo_design_config_delete" ON catalogo_design_config FOR DELETE USING (true);

ALTER TABLE catalogo_fresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_fresas_select" ON catalogo_fresas;
CREATE POLICY "catalogo_fresas_select" ON catalogo_fresas FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_fresas_insert" ON catalogo_fresas;
CREATE POLICY "catalogo_fresas_insert" ON catalogo_fresas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_fresas_update" ON catalogo_fresas;
CREATE POLICY "catalogo_fresas_update" ON catalogo_fresas FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_fresas_delete" ON catalogo_fresas;
CREATE POLICY "catalogo_fresas_delete" ON catalogo_fresas FOR DELETE USING (true);

ALTER TABLE catalogo_fretes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_fretes_select" ON catalogo_fretes;
CREATE POLICY "catalogo_fretes_select" ON catalogo_fretes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_fretes_insert" ON catalogo_fretes;
CREATE POLICY "catalogo_fretes_insert" ON catalogo_fretes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_fretes_update" ON catalogo_fretes;
CREATE POLICY "catalogo_fretes_update" ON catalogo_fretes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_fretes_delete" ON catalogo_fretes;
CREATE POLICY "catalogo_fretes_delete" ON catalogo_fretes FOR DELETE USING (true);

ALTER TABLE catalogo_grupos_clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_grupos_clientes_select" ON catalogo_grupos_clientes;
CREATE POLICY "catalogo_grupos_clientes_select" ON catalogo_grupos_clientes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_grupos_clientes_insert" ON catalogo_grupos_clientes;
CREATE POLICY "catalogo_grupos_clientes_insert" ON catalogo_grupos_clientes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_grupos_clientes_update" ON catalogo_grupos_clientes;
CREATE POLICY "catalogo_grupos_clientes_update" ON catalogo_grupos_clientes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_grupos_clientes_delete" ON catalogo_grupos_clientes;
CREATE POLICY "catalogo_grupos_clientes_delete" ON catalogo_grupos_clientes FOR DELETE USING (true);

ALTER TABLE catalogo_imagens_produto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_imagens_produto_select" ON catalogo_imagens_produto;
CREATE POLICY "catalogo_imagens_produto_select" ON catalogo_imagens_produto FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_imagens_produto_insert" ON catalogo_imagens_produto;
CREATE POLICY "catalogo_imagens_produto_insert" ON catalogo_imagens_produto FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_imagens_produto_update" ON catalogo_imagens_produto;
CREATE POLICY "catalogo_imagens_produto_update" ON catalogo_imagens_produto FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_imagens_produto_delete" ON catalogo_imagens_produto;
CREATE POLICY "catalogo_imagens_produto_delete" ON catalogo_imagens_produto FOR DELETE USING (true);

ALTER TABLE catalogo_implantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_implantes_select" ON catalogo_implantes;
CREATE POLICY "catalogo_implantes_select" ON catalogo_implantes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_implantes_insert" ON catalogo_implantes;
CREATE POLICY "catalogo_implantes_insert" ON catalogo_implantes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_implantes_update" ON catalogo_implantes;
CREATE POLICY "catalogo_implantes_update" ON catalogo_implantes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_implantes_delete" ON catalogo_implantes;
CREATE POLICY "catalogo_implantes_delete" ON catalogo_implantes FOR DELETE USING (true);

ALTER TABLE catalogo_ips_conexoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_ips_conexoes_select" ON catalogo_ips_conexoes;
CREATE POLICY "catalogo_ips_conexoes_select" ON catalogo_ips_conexoes FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_ips_conexoes_insert" ON catalogo_ips_conexoes;
CREATE POLICY "catalogo_ips_conexoes_insert" ON catalogo_ips_conexoes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_ips_conexoes_update" ON catalogo_ips_conexoes;
CREATE POLICY "catalogo_ips_conexoes_update" ON catalogo_ips_conexoes FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_ips_conexoes_delete" ON catalogo_ips_conexoes;
CREATE POLICY "catalogo_ips_conexoes_delete" ON catalogo_ips_conexoes FOR DELETE USING (true);

ALTER TABLE catalogo_ips_familias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_ips_familias_select" ON catalogo_ips_familias;
CREATE POLICY "catalogo_ips_familias_select" ON catalogo_ips_familias FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_ips_familias_insert" ON catalogo_ips_familias;
CREATE POLICY "catalogo_ips_familias_insert" ON catalogo_ips_familias FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_ips_familias_update" ON catalogo_ips_familias;
CREATE POLICY "catalogo_ips_familias_update" ON catalogo_ips_familias FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_ips_familias_delete" ON catalogo_ips_familias;
CREATE POLICY "catalogo_ips_familias_delete" ON catalogo_ips_familias FOR DELETE USING (true);

ALTER TABLE catalogo_ips_linhas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_ips_linhas_select" ON catalogo_ips_linhas;
CREATE POLICY "catalogo_ips_linhas_select" ON catalogo_ips_linhas FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_ips_linhas_insert" ON catalogo_ips_linhas;
CREATE POLICY "catalogo_ips_linhas_insert" ON catalogo_ips_linhas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_ips_linhas_update" ON catalogo_ips_linhas;
CREATE POLICY "catalogo_ips_linhas_update" ON catalogo_ips_linhas FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_ips_linhas_delete" ON catalogo_ips_linhas;
CREATE POLICY "catalogo_ips_linhas_delete" ON catalogo_ips_linhas FOR DELETE USING (true);

ALTER TABLE catalogo_kit_complementares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_kit_complementares_select" ON catalogo_kit_complementares;
CREATE POLICY "catalogo_kit_complementares_select" ON catalogo_kit_complementares FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_kit_complementares_insert" ON catalogo_kit_complementares;
CREATE POLICY "catalogo_kit_complementares_insert" ON catalogo_kit_complementares FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_kit_complementares_update" ON catalogo_kit_complementares;
CREATE POLICY "catalogo_kit_complementares_update" ON catalogo_kit_complementares FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_kit_complementares_delete" ON catalogo_kit_complementares;
CREATE POLICY "catalogo_kit_complementares_delete" ON catalogo_kit_complementares FOR DELETE USING (true);

ALTER TABLE catalogo_kit_opcionais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_kit_opcionais_select" ON catalogo_kit_opcionais;
CREATE POLICY "catalogo_kit_opcionais_select" ON catalogo_kit_opcionais FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_kit_opcionais_insert" ON catalogo_kit_opcionais;
CREATE POLICY "catalogo_kit_opcionais_insert" ON catalogo_kit_opcionais FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_kit_opcionais_update" ON catalogo_kit_opcionais;
CREATE POLICY "catalogo_kit_opcionais_update" ON catalogo_kit_opcionais FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_kit_opcionais_delete" ON catalogo_kit_opcionais;
CREATE POLICY "catalogo_kit_opcionais_delete" ON catalogo_kit_opcionais FOR DELETE USING (true);

ALTER TABLE catalogo_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_kits_select" ON catalogo_kits;
CREATE POLICY "catalogo_kits_select" ON catalogo_kits FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_kits_insert" ON catalogo_kits;
CREATE POLICY "catalogo_kits_insert" ON catalogo_kits FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_kits_update" ON catalogo_kits;
CREATE POLICY "catalogo_kits_update" ON catalogo_kits FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_kits_delete" ON catalogo_kits;
CREATE POLICY "catalogo_kits_delete" ON catalogo_kits FOR DELETE USING (true);

ALTER TABLE catalogo_opcionais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_opcionais_select" ON catalogo_opcionais;
CREATE POLICY "catalogo_opcionais_select" ON catalogo_opcionais FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_opcionais_insert" ON catalogo_opcionais;
CREATE POLICY "catalogo_opcionais_insert" ON catalogo_opcionais FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_opcionais_update" ON catalogo_opcionais;
CREATE POLICY "catalogo_opcionais_update" ON catalogo_opcionais FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_opcionais_delete" ON catalogo_opcionais;
CREATE POLICY "catalogo_opcionais_delete" ON catalogo_opcionais FOR DELETE USING (true);

ALTER TABLE catalogo_parafusos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_parafusos_select" ON catalogo_parafusos;
CREATE POLICY "catalogo_parafusos_select" ON catalogo_parafusos FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_parafusos_insert" ON catalogo_parafusos;
CREATE POLICY "catalogo_parafusos_insert" ON catalogo_parafusos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_parafusos_update" ON catalogo_parafusos;
CREATE POLICY "catalogo_parafusos_update" ON catalogo_parafusos FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_parafusos_delete" ON catalogo_parafusos;
CREATE POLICY "catalogo_parafusos_delete" ON catalogo_parafusos FOR DELETE USING (true);

ALTER TABLE catalogo_parafusos_retensao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_parafusos_retensao_select" ON catalogo_parafusos_retensao;
CREATE POLICY "catalogo_parafusos_retensao_select" ON catalogo_parafusos_retensao FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_parafusos_retensao_insert" ON catalogo_parafusos_retensao;
CREATE POLICY "catalogo_parafusos_retensao_insert" ON catalogo_parafusos_retensao FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_parafusos_retensao_update" ON catalogo_parafusos_retensao;
CREATE POLICY "catalogo_parafusos_retensao_update" ON catalogo_parafusos_retensao FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_parafusos_retensao_delete" ON catalogo_parafusos_retensao;
CREATE POLICY "catalogo_parafusos_retensao_delete" ON catalogo_parafusos_retensao FOR DELETE USING (true);

ALTER TABLE catalogo_promocionais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_promocionais_select" ON catalogo_promocionais;
CREATE POLICY "catalogo_promocionais_select" ON catalogo_promocionais FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_promocionais_insert" ON catalogo_promocionais;
CREATE POLICY "catalogo_promocionais_insert" ON catalogo_promocionais FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_promocionais_update" ON catalogo_promocionais;
CREATE POLICY "catalogo_promocionais_update" ON catalogo_promocionais FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_promocionais_delete" ON catalogo_promocionais;
CREATE POLICY "catalogo_promocionais_delete" ON catalogo_promocionais FOR DELETE USING (true);

ALTER TABLE catalogo_promocional_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_promocional_itens_select" ON catalogo_promocional_itens;
CREATE POLICY "catalogo_promocional_itens_select" ON catalogo_promocional_itens FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_promocional_itens_insert" ON catalogo_promocional_itens;
CREATE POLICY "catalogo_promocional_itens_insert" ON catalogo_promocional_itens FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_promocional_itens_update" ON catalogo_promocional_itens;
CREATE POLICY "catalogo_promocional_itens_update" ON catalogo_promocional_itens FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_promocional_itens_delete" ON catalogo_promocional_itens;
CREATE POLICY "catalogo_promocional_itens_delete" ON catalogo_promocional_itens FOR DELETE USING (true);

ALTER TABLE catalogo_protocolo_fresagem ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_protocolo_fresagem_select" ON catalogo_protocolo_fresagem;
CREATE POLICY "catalogo_protocolo_fresagem_select" ON catalogo_protocolo_fresagem FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_protocolo_fresagem_insert" ON catalogo_protocolo_fresagem;
CREATE POLICY "catalogo_protocolo_fresagem_insert" ON catalogo_protocolo_fresagem FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_protocolo_fresagem_update" ON catalogo_protocolo_fresagem;
CREATE POLICY "catalogo_protocolo_fresagem_update" ON catalogo_protocolo_fresagem FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_protocolo_fresagem_delete" ON catalogo_protocolo_fresagem;
CREATE POLICY "catalogo_protocolo_fresagem_delete" ON catalogo_protocolo_fresagem FOR DELETE USING (true);

ALTER TABLE catalogo_protocolos_fresagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_protocolos_fresagens_select" ON catalogo_protocolos_fresagens;
CREATE POLICY "catalogo_protocolos_fresagens_select" ON catalogo_protocolos_fresagens FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_protocolos_fresagens_insert" ON catalogo_protocolos_fresagens;
CREATE POLICY "catalogo_protocolos_fresagens_insert" ON catalogo_protocolos_fresagens FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_protocolos_fresagens_update" ON catalogo_protocolos_fresagens;
CREATE POLICY "catalogo_protocolos_fresagens_update" ON catalogo_protocolos_fresagens FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_protocolos_fresagens_delete" ON catalogo_protocolos_fresagens;
CREATE POLICY "catalogo_protocolos_fresagens_delete" ON catalogo_protocolos_fresagens FOR DELETE USING (true);

ALTER TABLE catalogo_protocolos_fresas_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_protocolos_fresas_itens_select" ON catalogo_protocolos_fresas_itens;
CREATE POLICY "catalogo_protocolos_fresas_itens_select" ON catalogo_protocolos_fresas_itens FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_protocolos_fresas_itens_insert" ON catalogo_protocolos_fresas_itens;
CREATE POLICY "catalogo_protocolos_fresas_itens_insert" ON catalogo_protocolos_fresas_itens FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_protocolos_fresas_itens_update" ON catalogo_protocolos_fresas_itens;
CREATE POLICY "catalogo_protocolos_fresas_itens_update" ON catalogo_protocolos_fresas_itens FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_protocolos_fresas_itens_delete" ON catalogo_protocolos_fresas_itens;
CREATE POLICY "catalogo_protocolos_fresas_itens_delete" ON catalogo_protocolos_fresas_itens FOR DELETE USING (true);

ALTER TABLE catalogo_solicitacoes_acesso ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_solicitacoes_acesso_select" ON catalogo_solicitacoes_acesso;
CREATE POLICY "catalogo_solicitacoes_acesso_select" ON catalogo_solicitacoes_acesso FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_solicitacoes_acesso_insert" ON catalogo_solicitacoes_acesso;
CREATE POLICY "catalogo_solicitacoes_acesso_insert" ON catalogo_solicitacoes_acesso FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_solicitacoes_acesso_update" ON catalogo_solicitacoes_acesso;
CREATE POLICY "catalogo_solicitacoes_acesso_update" ON catalogo_solicitacoes_acesso FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_solicitacoes_acesso_delete" ON catalogo_solicitacoes_acesso;
CREATE POLICY "catalogo_solicitacoes_acesso_delete" ON catalogo_solicitacoes_acesso FOR DELETE USING (true);

ALTER TABLE catalogo_tipos_chaves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_tipos_chaves_select" ON catalogo_tipos_chaves;
CREATE POLICY "catalogo_tipos_chaves_select" ON catalogo_tipos_chaves FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_tipos_chaves_insert" ON catalogo_tipos_chaves;
CREATE POLICY "catalogo_tipos_chaves_insert" ON catalogo_tipos_chaves FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_chaves_update" ON catalogo_tipos_chaves;
CREATE POLICY "catalogo_tipos_chaves_update" ON catalogo_tipos_chaves FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_chaves_delete" ON catalogo_tipos_chaves;
CREATE POLICY "catalogo_tipos_chaves_delete" ON catalogo_tipos_chaves FOR DELETE USING (true);

ALTER TABLE catalogo_tipos_complementares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_tipos_complementares_select" ON catalogo_tipos_complementares;
CREATE POLICY "catalogo_tipos_complementares_select" ON catalogo_tipos_complementares FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_tipos_complementares_insert" ON catalogo_tipos_complementares;
CREATE POLICY "catalogo_tipos_complementares_insert" ON catalogo_tipos_complementares FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_complementares_update" ON catalogo_tipos_complementares;
CREATE POLICY "catalogo_tipos_complementares_update" ON catalogo_tipos_complementares FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_complementares_delete" ON catalogo_tipos_complementares;
CREATE POLICY "catalogo_tipos_complementares_delete" ON catalogo_tipos_complementares FOR DELETE USING (true);

ALTER TABLE catalogo_tipos_fresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_tipos_fresas_select" ON catalogo_tipos_fresas;
CREATE POLICY "catalogo_tipos_fresas_select" ON catalogo_tipos_fresas FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_tipos_fresas_insert" ON catalogo_tipos_fresas;
CREATE POLICY "catalogo_tipos_fresas_insert" ON catalogo_tipos_fresas FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_fresas_update" ON catalogo_tipos_fresas;
CREATE POLICY "catalogo_tipos_fresas_update" ON catalogo_tipos_fresas FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_fresas_delete" ON catalogo_tipos_fresas;
CREATE POLICY "catalogo_tipos_fresas_delete" ON catalogo_tipos_fresas FOR DELETE USING (true);

ALTER TABLE catalogo_tipos_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_tipos_kits_select" ON catalogo_tipos_kits;
CREATE POLICY "catalogo_tipos_kits_select" ON catalogo_tipos_kits FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_tipos_kits_insert" ON catalogo_tipos_kits;
CREATE POLICY "catalogo_tipos_kits_insert" ON catalogo_tipos_kits FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_kits_update" ON catalogo_tipos_kits;
CREATE POLICY "catalogo_tipos_kits_update" ON catalogo_tipos_kits FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_kits_delete" ON catalogo_tipos_kits;
CREATE POLICY "catalogo_tipos_kits_delete" ON catalogo_tipos_kits FOR DELETE USING (true);

ALTER TABLE catalogo_tipos_opcionais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_tipos_opcionais_select" ON catalogo_tipos_opcionais;
CREATE POLICY "catalogo_tipos_opcionais_select" ON catalogo_tipos_opcionais FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_tipos_opcionais_insert" ON catalogo_tipos_opcionais;
CREATE POLICY "catalogo_tipos_opcionais_insert" ON catalogo_tipos_opcionais FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_opcionais_update" ON catalogo_tipos_opcionais;
CREATE POLICY "catalogo_tipos_opcionais_update" ON catalogo_tipos_opcionais FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_opcionais_delete" ON catalogo_tipos_opcionais;
CREATE POLICY "catalogo_tipos_opcionais_delete" ON catalogo_tipos_opcionais FOR DELETE USING (true);

ALTER TABLE catalogo_tipos_ossos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "catalogo_tipos_ossos_select" ON catalogo_tipos_ossos;
CREATE POLICY "catalogo_tipos_ossos_select" ON catalogo_tipos_ossos FOR SELECT USING (true);
DROP POLICY IF EXISTS "catalogo_tipos_ossos_insert" ON catalogo_tipos_ossos;
CREATE POLICY "catalogo_tipos_ossos_insert" ON catalogo_tipos_ossos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_ossos_update" ON catalogo_tipos_ossos;
CREATE POLICY "catalogo_tipos_ossos_update" ON catalogo_tipos_ossos FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "catalogo_tipos_ossos_delete" ON catalogo_tipos_ossos;
CREATE POLICY "catalogo_tipos_ossos_delete" ON catalogo_tipos_ossos FOR DELETE USING (true);

COMMIT;
