-- ============================================================
-- 20260720000001_single_tenant_rls.sql
-- Simplificar RLS de multi-tenant para single-tenant
--
-- Estratégia:
-- 1. get_current_empresa_id() → retorna ID fixo (empresas.id único)
-- 2. Remover pode_acessar_empresa()
-- 3. Policies: authenticated com controle de role (admin/super)
-- 4. Manter is_super_admin_session() e is_admin_or_super()
-- ============================================================

-- ============================================================
-- 1. ATUALIZAR FUNÇÕES HELPER
-- ============================================================

-- get_current_empresa_id: retorna ID fixo da empresa (single-tenant)
CREATE OR REPLACE FUNCTION public.get_current_empresa_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.empresas WHERE ativo = true LIMIT 1;
$$;

-- Remover pode_acessar_empresa (não faz sentido em single-tenant)
DROP FUNCTION IF EXISTS public.pode_acessar_empresa(uuid);

-- is_super_admin_session: MANTER
-- is_admin_or_super: MANTER

-- ============================================================
-- 2. CORE TABLES COM POLICIES ESPECÍFICAS
-- ============================================================

-- PROFILES
DO $$ BEGIN
  DROP POLICY IF EXISTS select_profiles_empresa ON public.profiles;
  DROP POLICY IF EXISTS insert_profiles_empresa ON public.profiles;
  DROP POLICY IF EXISTS update_profiles_empresa ON public.profiles;
  DROP POLICY IF EXISTS delete_profiles_empresa ON public.profiles;
  DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
  DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON public.profiles;
  DROP POLICY IF EXISTS "Admin vê todos" ON public.profiles;
  DROP POLICY IF EXISTS "Autenticados veem perfis" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_super_admin_session());

CREATE POLICY profiles_insert_superadmin ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (is_super_admin_session());

CREATE POLICY profiles_update_superadmin ON public.profiles
  FOR UPDATE TO authenticated
  USING (is_super_admin_session())
  WITH CHECK (is_super_admin_session());

CREATE POLICY profiles_delete_superadmin ON public.profiles
  FOR DELETE TO authenticated
  USING (is_super_admin_session());

-- CADASTROS
DO $$ BEGIN
  DROP POLICY IF EXISTS select_cadastros_empresa ON public.cadastros;
  DROP POLICY IF EXISTS insert_cadastros_empresa ON public.cadastros;
  DROP POLICY IF EXISTS update_cadastros_empresa ON public.cadastros;
  DROP POLICY IF EXISTS delete_cadastros_empresa ON public.cadastros;
  DROP POLICY IF EXISTS "Autenticados podem ver cadastros" ON public.cadastros;
  DROP POLICY IF EXISTS "Autenticados podem inserir cadastros" ON public.cadastros;
  DROP POLICY IF EXISTS "Autenticados podem atualizar cadastros" ON public.cadastros;
  DROP POLICY IF EXISTS "admin ve todos cadastros" ON public.cadastros;
  DROP POLICY IF EXISTS "consultor ve proprios cadastros" ON public.cadastros;
  DROP POLICY IF EXISTS "autenticados podem inserir cadastros" ON public.cadastros;
  DROP POLICY IF EXISTS "admin pode atualizar qualquer cadastro" ON public.cadastros;
  DROP POLICY IF EXISTS "consultor pode atualizar proprios cadastros" ON public.cadastros;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY cadastros_select_auth ON public.cadastros
  FOR SELECT TO authenticated USING (
    is_admin_or_super() OR created_by = auth.uid()
  );
CREATE POLICY cadastros_insert_auth ON public.cadastros
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cadastros_update_auth ON public.cadastros
  FOR UPDATE TO authenticated USING (
    is_admin_or_super() OR created_by = auth.uid()
  );
CREATE POLICY cadastros_delete_auth ON public.cadastros
  FOR DELETE TO authenticated USING (is_admin_or_super());

-- CADASTROS_PF
DO $$ BEGIN
  DROP POLICY IF EXISTS select_cadastros_pf_empresa ON public.cadastros_pf;
  DROP POLICY IF EXISTS insert_cadastros_pf_empresa ON public.cadastros_pf;
  DROP POLICY IF EXISTS update_cadastros_pf_empresa ON public.cadastros_pf;
  DROP POLICY IF EXISTS delete_cadastros_pf_empresa ON public.cadastros_pf;
  DROP POLICY IF EXISTS "Autenticados podem ver PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "Autenticados podem inserir PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "Autenticados podem atualizar PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "admin ve todos PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "consultor ve proprios PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "autenticados podem inserir PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "admin pode atualizar qualquer PF" ON public.cadastros_pf;
  DROP POLICY IF EXISTS "consultor pode atualizar proprios PF" ON public.cadastros_pf;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY cadastros_pf_select_auth ON public.cadastros_pf
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND (is_admin_or_super() OR created_by = auth.uid()))
  );
CREATE POLICY cadastros_pf_insert_auth ON public.cadastros_pf
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cadastros_pf_update_auth ON public.cadastros_pf
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND (is_admin_or_super() OR created_by = auth.uid()))
  );
CREATE POLICY cadastros_pf_delete_auth ON public.cadastros_pf
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND is_admin_or_super())
  );

-- CADASTROS_PJ
DO $$ BEGIN
  DROP POLICY IF EXISTS select_cadastros_pj_empresa ON public.cadastros_pj;
  DROP POLICY IF EXISTS insert_cadastros_pj_empresa ON public.cadastros_pj;
  DROP POLICY IF EXISTS update_cadastros_pj_empresa ON public.cadastros_pj;
  DROP POLICY IF EXISTS delete_cadastros_pj_empresa ON public.cadastros_pj;
  DROP POLICY IF EXISTS "Autenticados podem ver PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "Autenticados podem inserir PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "Autenticados podem atualizar PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "admin ve todos PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "consultor ve proprios PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "autenticados podem inserir PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "admin pode atualizar qualquer PJ" ON public.cadastros_pj;
  DROP POLICY IF EXISTS "consultor pode atualizar proprios PJ" ON public.cadastros_pj;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY cadastros_pj_select_auth ON public.cadastros_pj
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND (is_admin_or_super() OR created_by = auth.uid()))
  );
CREATE POLICY cadastros_pj_insert_auth ON public.cadastros_pj
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cadastros_pj_update_auth ON public.cadastros_pj
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND (is_admin_or_super() OR created_by = auth.uid()))
  );
CREATE POLICY cadastros_pj_delete_auth ON public.cadastros_pj
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND is_admin_or_super())
  );

-- CADASTROS_ENDERECOS
DO $$ BEGIN
  DROP POLICY IF EXISTS select_cadastros_enderecos_empresa ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS insert_cadastros_enderecos_empresa ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS update_cadastros_enderecos_empresa ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS delete_cadastros_enderecos_empresa ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "Autenticados podem ver enderecos" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "Autenticados podem inserir enderecos" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "Autenticados podem atualizar enderecos" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "admin ve todos enderecos" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "consultor ve proprios enderecos" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "autenticados podem inserir enderecos" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "admin pode atualizar qualquer endereco" ON public.cadastros_enderecos;
  DROP POLICY IF EXISTS "consultor pode atualizar proprios enderecos" ON public.cadastros_enderecos;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY cadastros_enderecos_select_auth ON public.cadastros_enderecos
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND (is_admin_or_super() OR created_by = auth.uid()))
  );
CREATE POLICY cadastros_enderecos_insert_auth ON public.cadastros_enderecos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cadastros_enderecos_update_auth ON public.cadastros_enderecos
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND (is_admin_or_super() OR created_by = auth.uid()))
  );
CREATE POLICY cadastros_enderecos_delete_auth ON public.cadastros_enderecos
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.cadastros WHERE id = cadastro_id AND is_admin_or_super())
  );

-- ============================================================
-- 3. TABELAS COM PADRÃO: authenticated (select) + admin (write)
-- ============================================================
-- Aplica padrão simplificado para TODAS as tabelas restantes:
-- SELECT: qualquer autenticado
-- INSERT: qualquer autenticado
-- UPDATE: admin ou super
-- DELETE: admin ou super

DO $$
DECLARE
  tbl TEXT;
  pol_name TEXT;
  -- Todas as tabelas que precisam de RLS simplificado
  -- EXCLUI: profiles, cadastros, cadastros_pf/pj/enderecos (tratados na seção 2)
  all_tables TEXT[] := ARRAY[
    -- Config
    'empresas', 'empresas_config', 'empresa_modulos',
    'empresa_design_system', 'empresa_modulo_limits', 'empresa_role_limits',
    -- Core
    'credenciais', 'atividades', 'notificacoes', 'notificacoes_templates',
    'documentos', 'permissoes', 'webhooks', 'webhook_logs',
    'form_schema', 'api_connectors', 'integracoes_config',
    'app_config', 'mock_credentials', 'demo_credentials',
    -- Catálogo hierarchy
    'catalogo_categorias', 'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas',
    -- Catálogo tipos
    'catalogo_cps_tipos_reabilitacao', 'catalogo_cps_tipos_reabilitacao_familias',
    'catalogo_cps_tipos_abutments', 'catalogo_cps_tipos_componentes',
    'catalogo_cps_tipos_parafusos', 'catalogo_cps_tipos_cicatrizadores',
    'catalogo_tipos_chaves', 'catalogo_tipos_fresas', 'catalogo_tipos_complementares',
    'catalogo_tipos_opcionais', 'catalogo_tipos_kits', 'catalogo_tipos_ossos',
    'catalogo_cps_tipos_workflows', 'catalogo_cps_etapas_workflows',
    -- Catálogo produtos
    'catalogo_implantes', 'catalogo_abutments', 'catalogo_componentes',
    'catalogo_parafusos', 'catalogo_cicatrizadores',
    'catalogo_complementares', 'catalogo_opcionais',
    'catalogo_fresas',
    'catalogo_chaves',
    'catalogo_configuracoes', 'catalogo_design_config',
    'catalogo_implante_chaves', 'catalogo_implante_abutment', 'catalogo_implante_kit',
    -- Catálogo kits
    'catalogo_kits', 'catalogo_kit_familias',
    'catalogo_kit_chaves', 'catalogo_kit_fresas',
    'catalogo_kit_complementares', 'catalogo_kit_opcionais', 'catalogo_kit_implantes',
    -- Catálogo promocionais/cupons/frete
    'catalogo_promocionais', 'catalogo_promocional_itens',
    'catalogo_cupons', 'catalogo_fretes',
    -- Catálogo protocolos
    'catalogo_protocolo_fresagem', 'catalogo_protocolos_fresagens',
    'catalogo_protocolos_fresas_itens',
    -- Catálogo imagens/favoritos
    'catalogo_imagens_produto', 'catalogo_favoritos',
    -- Catálogo parafusos retenção
    'catalogo_parafusos_retensao',
    -- Catálogo clientes/pedidos/orçamentos
    'catalogo_clientes', 'catalogo_grupos_clientes', 'catalogo_cliente_permissoes',
    'catalogo_orcamentos', 'catalogo_orcamento_itens',
    'catalogo_pedidos', 'catalogo_pedido_itens',
    'catalogo_solicitacoes_acesso',
    -- Funis
    'funis', 'funis_colunas', 'funis_tarefas', 'funis_permissoes',
    'funis_templates', 'funis_template_cols', 'funis_template_tasks',
    -- CRM
    'pipeline_estagios', 'tarefas', 'metas',
    -- Marketing
    'mktg_utms', 'mktg_pixels', 'mktg_landing_pages', 'mktg_landing_pages_versoes',
    'mktg_meta_contas', 'mktg_meta_campanhas', 'mktg_meta_posts', 'mktg_meta_insights',
    'mktg_campanhas_email', 'mktg_disparos_email', 'mktg_eventos',
    'mktg_calendario', 'mktg_criativos', 'mktg_leads', 'mktg_whatsapp_campanhas',
    -- Hub
    'hub_materials', 'hub_material_assets', 'hub_badges', 'hub_user_badges',
    'hub_user_progress', 'hub_user_roles', 'hub_collections', 'hub_collection_items',
    'hub_collection_progress', 'hub_chatbot_config', 'hub_system_config',
    'hub_system_integrations', 'hub_access_logs', 'hub_invite_tokens',
    'hub_gamification_levels',
    -- Linktree
    'linktree_empresa_config', 'linktree_empresa_links', 'linktree_empresa_sections',
    'linktree_empresa_clicks', 'linktree_tema_config', 'linktree_colaboradores',
    -- Mapas
    'mapas_distributors', 'mapas_consultants',
    -- NPS
    'nps_perguntas', 'nps_respostas', 'nps_webhook_config', 'nps_relatorios_envio',
    -- Rotas
    'rotas', 'rotas_clientes', 'rotas_clientes_base', 'rotas_config',
    'rotas_form_perguntas', 'rotas_trajetos', 'rotas_visitas',
    -- Despesas
    'despesas', 'despesas_config', 'despesas_envios', 'despesas_pagamentos',
    'despesas_periodos', 'despesas_tipos',
    -- Agentes
    'agentes_ia', 'agentes_conversas', 'agentes_knowledge_docs', 'agentes_knowledge_tabelas',
    -- Gerador links
    'gerador_links', 'gerador_templates', 'gerador_link_cliques',
    -- Modulos manutenção
    'modulos_manutencao',
    -- Design system
    'design_sistema_global', 'design_sistema_modulo', 'design_system_presets',
    -- Outros
    'clientes', 'usuarios', 'convites_acesso', 'templates_mensagem',
    'links_testes', 'logs_transferencia', 'logs_transferencia_consultor',
    'modelos_ia', 'modelos_ia_versoes'
  ];
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    -- Skip se tabela não existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      RAISE NOTICE 'Tabela % não existe, pulando...', tbl;
      CONTINUE;
    END IF;

    -- Habilitar RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    -- Drop TODAS as policies antigas
    FOR pol_name IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol_name, tbl);
    END LOOP;

    -- Policy de SELECT: qualquer autenticado pode ler
    EXECUTE format('
      CREATE POLICY %I_select_auth ON %I
        FOR SELECT TO authenticated USING (true)', tbl, tbl);

    -- Policy de INSERT: qualquer autenticado pode inserir
    EXECUTE format('
      CREATE POLICY %I_insert_auth ON %I
        FOR INSERT TO authenticated WITH CHECK (true)', tbl, tbl);

    -- Policy de UPDATE: admin ou super pode atualizar
    EXECUTE format('
      CREATE POLICY %I_update_auth ON %I
        FOR UPDATE TO authenticated
        USING (is_admin_or_super())
        WITH CHECK (is_admin_or_super())', tbl, tbl);

    -- Policy de DELETE: admin ou super pode deletar
    EXECUTE format('
      CREATE POLICY %I_delete_auth ON %I
        FOR DELETE TO authenticated
        USING (is_admin_or_super())', tbl, tbl);

    RAISE NOTICE 'RLS single-tenant configurado para %', tbl;
  END LOOP;
END $$;

-- ============================================================
-- 4. TABELAS SEM empresa_id (que precisam de RLS também)
-- ============================================================
-- Tabelas que não têm empresa_id mas existem no banco

DO $$
DECLARE
  tbl TEXT;
  pol_name TEXT;
  no_empresa_tables TEXT[] := ARRAY[
    'pacientes_backup', 'usuarios',
    'clientes'  -- view, não tabela
  ];
BEGIN
  FOREACH tbl IN ARRAY no_empresa_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    FOR pol_name IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol_name, tbl);
    END LOOP;

    EXECUTE format('CREATE POLICY %I_select_auth ON %I FOR SELECT TO authenticated USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_insert_auth ON %I FOR INSERT TO authenticated WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_update_auth ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY %I_delete_auth ON %I FOR DELETE TO authenticated USING (is_admin_or_super())', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_empresa_id') THEN
    RAISE EXCEPTION 'Função get_current_empresa_id não foi criada!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_super_admin_session') THEN
    RAISE EXCEPTION 'Função is_super_admin_session não foi criada!';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin_or_super') THEN
    RAISE EXCEPTION 'Função is_admin_or_super não foi criada!';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'pode_acessar_empresa') THEN
    RAISE EXCEPTION 'Função pode_acessar_empresa deveria ter sido removida!';
  END IF;
  RAISE NOTICE '✅ Funções helper verificadas (single-tenant)';
END $$;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
