-- ============================================================
-- Migration: Single-tenant fase 2a — remover empresa_id (tabelas sem upsert por empresa_id)
-- Data: 2026-08-03
-- Decisão: empresa_id NÃO será mais usado para multi-tenant. O sistema é
--          single-tenant (VITE_EMPRESA_ID). Sem exceções: a coluna sai de todas
--          as tabelas. Em 152 de 154 definições ela era FK para empresas(id),
--          ou seja, sempre o discriminador de tenant.
-- Descrição: Dropa empresa_id de 78 tabelas. Inclui as 25 que a 20260721000000 não
--            alcançou (nomes renomeados antes pela 20260705000000, IF EXISTS virou
--            no-op silencioso) e as que antes eram tratadas como exceção (mktg_*,
--            agentes_ia, empresa_limites_modulo) — a decisão removeu as exceções.
-- ESCOPO:     NÃO inclui as 8 tabelas cujo upsert usa empresa_id como conflict
--             target — essas ficam para a fase 2b, que precisa trocar o índice
--             único antes (ver 20260803000200). Dropar a coluna sem isso faz o
--             upsert duplicar linha: foi o bug corrigido pela 20260720030000 em
--             catalogo_design_config.
-- AVISO:      aplicar SOMENTE junto do deploy que remove empresa_id do código.
--            A verificação no fim FALHA (RAISE EXCEPTION), diferente da
--            20260721000000 que só emitia WARNING e por isso passou despercebida.
-- Contexto: A1 de docs/agents/plano-correcao-auditoria.md
-- ============================================================

BEGIN;

ALTER TABLE IF EXISTS agentes_ia DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS cadastros_enderecos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS cadastros_pf DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS cadastros_pj DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_acessorio_ferramental DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_acessorios DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_categorias_acessorio DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_categorias_instrumental DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_chaves_ferramental DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_conexoes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_reabilitacao_familias DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_etapas_workflow DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_familias DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_guias_reabilitacao DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_imagens_implante DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_implante_abutments DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_implante_kits DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_instrumentais_gerais DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_linhas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_abutment DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_fresagens DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_kits DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_ossos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_reabilitacao DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_workflows DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS clientes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS conectores_api DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS config_integracoes DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS despesas_config DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS despesas_envios DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS despesas_pagamentos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS despesas_tipos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS documentos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS empresa_limites_credenciais DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS empresa_limites_modulo DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS funis_modelos DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS gerador_links DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS gerador_modelos DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_colecoes DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_emblemas DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_emblemas_usuario DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_logs_acesso DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_materiais DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_niveis_gamificacao DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_papeis_usuario DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_progresso_colecao DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_progresso_usuario DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS hub_tokens_convite DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS logs_webhook DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS mapas_consultores DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS mapas_distribuidores DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS metas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_calendario DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_campanhas_email DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_criativos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_disparos_email DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_eventos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_landing_pages DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_leads DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_meta_campanhas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_meta_contas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_meta_insights DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_meta_posts DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_pixels DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS mktg_utms DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS modelos_mensagem DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS notificacoes_modelos DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS pipeline_estagios DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS rotas_clientes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS rotas_clientes_base DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS rotas_form_perguntas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS rotas_visitas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS schema_formulario DROP COLUMN IF EXISTS empresa_id;  -- no-op na 20260721 (renomeada antes)
ALTER TABLE IF EXISTS tarefas DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- Verificação — FALHA se sobrar QUALQUER empresa_id no schema público
-- ============================================================
DO $$
DECLARE restantes text;
BEGIN
  SELECT string_agg(table_name, ', ' ORDER BY table_name) INTO restantes
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'empresa_id'
    -- as 8 abaixo saem na fase 2b (upsert por empresa_id)
    AND table_name NOT IN (
      'empresa_design_system',
      'design_sistema_modulo',
      'hub_config_chatbot',
      'hub_config_sistema',
      'hub_integracoes_sistema',
      'linktree_empresa_config',
      'rotas_config',
      'empresa_modulos'
    );

  IF restantes IS NOT NULL THEN
    RAISE EXCEPTION 'empresa_id ainda presente em: %', restantes;
  END IF;

  RAISE NOTICE 'OK — nenhuma tabela do schema public tem empresa_id.';
END $$;

NOTIFY pgrst, 'reload schema';
COMMIT;
