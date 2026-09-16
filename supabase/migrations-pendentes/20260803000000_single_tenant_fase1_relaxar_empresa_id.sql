-- ============================================================
-- Migration: Single-tenant fase 1 — relaxar empresa_id
-- Data: 2026-08-03
-- Decisão: empresa_id NÃO será mais usado para multi-tenant. O sistema é
--          single-tenant (VITE_EMPRESA_ID). Sem exceções: a coluna sai de todas
--          as tabelas. Em 152 de 154 definições ela era FK para empresas(id),
--          ou seja, sempre o discriminador de tenant.
-- Descrição: Remove NOT NULL de empresa_id em 57 tabelas, para que o código possa parar
--            de enviar a coluna ANTES de ela ser removida (expand/contract).
--            SEGURA aplicada isolada: nada quebra se o código continuar enviando.
-- Contexto: A1 de docs/agents/plano-correcao-auditoria.md
-- ============================================================

BEGIN;

ALTER TABLE IF EXISTS catalogo_acessorio_ferramental ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_acessorios ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_categorias_acessorio ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_categorias_instrumental ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_chaves_ferramental ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_conexoes ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_cps_tipos_reabilitacao_familias ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_etapas_workflow ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_familias ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_guias_reabilitacao ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_imagens_implante ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_implante_abutments ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_implante_kits ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_instrumentais_gerais ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_linhas ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_tipos_abutment ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_tipos_fresagens ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_tipos_kits ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_tipos_ossos ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_tipos_reabilitacao ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS catalogo_workflows ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS clientes ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS despesas_config ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS despesas_envios ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS despesas_pagamentos ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS despesas_tipos ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS empresa_limites_credenciais ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS empresa_limites_modulo ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS gerador_links ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS gerador_modelos ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_config_chatbot ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_config_sistema ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_integracoes_sistema ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS mapas_consultores ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS mapas_distribuidores ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS metas ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_calendario ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_campanhas_email ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_criativos ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_disparos_email ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_eventos ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_landing_pages ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_leads ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_meta_campanhas ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_meta_contas ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_meta_insights ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_meta_posts ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_pixels ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS mktg_utms ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS modelos_mensagem ALTER COLUMN empresa_id DROP NOT NULL;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS pipeline_estagios ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS rotas_clientes ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS rotas_clientes_base ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS rotas_config ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS rotas_form_perguntas ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS rotas_visitas ALTER COLUMN empresa_id DROP NOT NULL;
ALTER TABLE IF EXISTS tarefas ALTER COLUMN empresa_id DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
COMMIT;
