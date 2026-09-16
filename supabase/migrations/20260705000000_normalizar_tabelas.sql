-- ============================================================
-- 20260705000000_normalizar_tabelas.sql
-- Normalização de nomes de tabelas (português + prefixo empresa_)
-- ============================================================

-- Grupo A: Prefixo empresa_ na posição correta
ALTER TABLE IF EXISTS public.design_system_empresa RENAME TO empresa_design_system;
ALTER TABLE IF EXISTS public.modulos_empresa RENAME TO empresa_modulos;

-- Grupo B: Core tables (inglês → português)
ALTER TABLE IF EXISTS public.api_connectors RENAME TO conectores_api;
ALTER TABLE IF EXISTS public.mock_credentials RENAME TO credenciais_mock;
ALTER TABLE IF EXISTS public.webhook_logs RENAME TO logs_webhook;
ALTER TABLE IF EXISTS public.app_config RENAME TO config_app;
ALTER TABLE IF EXISTS public.form_schema RENAME TO schema_formulario;
ALTER TABLE IF EXISTS public.notificacoes_templates RENAME TO notificacoes_modelos;
ALTER TABLE IF EXISTS public.demo_credentials RENAME TO credenciais_demo;

-- Grupo A/B: empresa_ + tradução
ALTER TABLE IF EXISTS public.empresa_modulo_limits RENAME TO empresa_limites_modulo;
ALTER TABLE IF EXISTS public.empresa_role_limits RENAME TO empresa_limites_credenciais;

-- Grupo C: Mapas (inglês → português)
ALTER TABLE IF EXISTS public.mapas_distributors RENAME TO mapas_distribuidores;
ALTER TABLE IF EXISTS public.mapas_consultants RENAME TO mapas_consultores;

-- Grupo D: Hub (inglês → português)
ALTER TABLE IF EXISTS public.hub_user_roles RENAME TO hub_papeis_usuario;
ALTER TABLE IF EXISTS public.hub_materials RENAME TO hub_materiais;
ALTER TABLE IF EXISTS public.hub_material_assets RENAME TO hub_ativos_material;
ALTER TABLE IF EXISTS public.hub_collections RENAME TO hub_colecoes;
ALTER TABLE IF EXISTS public.hub_collection_items RENAME TO hub_itens_colecao;
ALTER TABLE IF EXISTS public.hub_user_progress RENAME TO hub_progresso_usuario;
ALTER TABLE IF EXISTS public.hub_collection_progress RENAME TO hub_progresso_colecao;
ALTER TABLE IF EXISTS public.hub_access_logs RENAME TO hub_logs_acesso;
ALTER TABLE IF EXISTS public.hub_gamification_levels RENAME TO hub_niveis_gamificacao;
ALTER TABLE IF EXISTS public.hub_badges RENAME TO hub_emblemas;
ALTER TABLE IF EXISTS public.hub_user_badges RENAME TO hub_emblemas_usuario;
ALTER TABLE IF EXISTS public.hub_invite_tokens RENAME TO hub_tokens_convite;
ALTER TABLE IF EXISTS public.hub_system_config RENAME TO hub_config_sistema;
ALTER TABLE IF EXISTS public.hub_system_integrations RENAME TO hub_integracoes_sistema;
ALTER TABLE IF EXISTS public.hub_chatbot_config RENAME TO hub_config_chatbot;

-- Grupo E: Funis (inglês → português)
ALTER TABLE IF EXISTS public.funis_activity_log RENAME TO funis_log_atividades;
ALTER TABLE IF EXISTS public.funis_attachments RENAME TO funis_anexos;
ALTER TABLE IF EXISTS public.funis_automations RENAME TO funis_automacoes;
ALTER TABLE IF EXISTS public.funis_comments RENAME TO funis_comentarios;
ALTER TABLE IF EXISTS public.funis_labels RENAME TO funis_etiquetas;
ALTER TABLE IF EXISTS public.funis_notifications RENAME TO funis_notificacoes;
ALTER TABLE IF EXISTS public.funis_recurring RENAME TO funis_recorrentes;
ALTER TABLE IF EXISTS public.funis_templates RENAME TO funis_modelos;
ALTER TABLE IF EXISTS public.funis_template_cols RENAME TO funis_colunas_modelo;
ALTER TABLE IF EXISTS public.funis_template_tasks RENAME TO funis_tarefas_modelo;
ALTER TABLE IF EXISTS public.funis_tarefas_labels RENAME TO funis_etiquetas_tarefa;

-- Grupo F: Outras
ALTER TABLE IF EXISTS public.templates_mensagem RENAME TO modelos_mensagem;
ALTER TABLE IF EXISTS public.survey_questions RENAME TO nps_perguntas_pesquisa;
ALTER TABLE IF EXISTS public.dashboard_profiles RENAME TO dashboard_perfis;
ALTER TABLE IF EXISTS public.gerador_templates RENAME TO gerador_modelos;
ALTER TABLE IF EXISTS public.integracoes_config RENAME TO config_integracoes;
ALTER TABLE IF EXISTS public.design_system_global RENAME TO design_sistema_global;
ALTER TABLE IF EXISTS public.design_system_modulo RENAME TO design_sistema_modulo;

-- ============================================================
-- Recriar functions que referenciam tabelas renomeadas
-- ============================================================

-- check_empresa_modulo_limit → referenciava empresa_modulo_limits
CREATE OR REPLACE FUNCTION public.check_empresa_modulo_limit(
  p_empresa_id uuid,
  p_modulo_key text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.empresa_limites_modulo
    WHERE empresa_id = p_empresa_id
      AND modulo_key = p_modulo_key
      AND max_credenciais > 0
      AND public.count_credenciais_by_empresa_modulo(empresa_id, modulo_key) >= max_credenciais
  );
$$;

-- count_credenciais_by_empresa_role → referenciava empresa_role_limits
CREATE OR REPLACE FUNCTION public.count_credenciais_by_empresa_role(
  p_empresa_id uuid,
  p_role text
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.profiles p
  WHERE p.empresa_id = p_empresa_id
    AND p.role = p_role
    AND (p.ativo = true OR p.ativo IS NULL);
$$;

-- check_empresa_role_limit → referenciava empresa_role_limits
CREATE OR REPLACE FUNCTION public.check_empresa_role_limit(
  p_empresa_id uuid,
  p_role text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.empresa_limites_credenciais
    WHERE empresa_id = p_empresa_id
      AND role = p_role
      AND max_credenciais > 0
      AND public.count_credenciais_by_empresa_role(empresa_id, role) >= max_credenciais
  );
$$;

-- Recriar RLS policies que referenciam tabelas renomeadas (nos corpos das policies)
-- Nota: O PostgreSQL atualiza automaticamente policies ATTACHED às tabelas renomeadas,
-- mas policies que referenciam OUTRAS tabelas nos corpos precisam ser recriadas.

-- hub_material_assets policies referenciam hub_materials
DROP POLICY IF EXISTS "hub_material_assets_select" ON public.hub_ativos_material;
DROP POLICY IF EXISTS "hub_material_assets_insert" ON public.hub_ativos_material;
DROP POLICY IF EXISTS "hub_material_assets_update" ON public.hub_ativos_material;
DROP POLICY IF EXISTS "hub_material_assets_delete" ON public.hub_ativos_material;

CREATE POLICY "hub_ativos_material_select" ON public.hub_ativos_material
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hub_materiais WHERE hub_materiais.id = hub_ativos_material.material_id)
  );
CREATE POLICY "hub_ativos_material_insert" ON public.hub_ativos_material
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.hub_materiais WHERE hub_materiais.id = hub_ativos_material.material_id AND hub_materiais.created_by = auth.uid())
  );
CREATE POLICY "hub_ativos_material_update" ON public.hub_ativos_material
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hub_materiais WHERE hub_materiais.id = hub_ativos_material.material_id AND hub_materiais.created_by = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.hub_materiais WHERE hub_materiais.id = hub_ativos_material.material_id AND hub_materiais.created_by = auth.uid())
  );
CREATE POLICY "hub_ativos_material_delete" ON public.hub_ativos_material
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hub_materiais WHERE hub_materiais.id = hub_ativos_material.material_id AND hub_materiais.created_by = auth.uid())
  );

-- hub_collection_items policies referenciam hub_collections
DROP POLICY IF EXISTS "hub_collection_items_select" ON public.hub_itens_colecao;
DROP POLICY IF EXISTS "hub_collection_items_insert" ON public.hub_itens_colecao;
DROP POLICY IF EXISTS "hub_collection_items_update" ON public.hub_itens_colecao;
DROP POLICY IF EXISTS "hub_collection_items_delete" ON public.hub_itens_colecao;

CREATE POLICY "hub_itens_colecao_select" ON public.hub_itens_colecao
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hub_colecoes WHERE hub_colecoes.id = hub_itens_colecao.collection_id)
  );
CREATE POLICY "hub_itens_colecao_insert" ON public.hub_itens_colecao
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.hub_colecoes WHERE hub_colecoes.id = hub_itens_colecao.collection_id AND hub_colecoes.created_by = auth.uid())
  );
CREATE POLICY "hub_itens_colecao_update" ON public.hub_itens_colecao
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hub_colecoes WHERE hub_colecoes.id = hub_itens_colecao.collection_id AND hub_colecoes.created_by = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.hub_colecoes WHERE hub_colecoes.id = hub_itens_colecao.collection_id AND hub_colecoes.created_by = auth.uid())
  );
CREATE POLICY "hub_itens_colecao_delete" ON public.hub_itens_colecao
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.hub_colecoes WHERE hub_colecoes.id = hub_itens_colecao.collection_id AND hub_colecoes.created_by = auth.uid())
  );

-- Recreate triggers that reference renamed tables
DROP TRIGGER IF EXISTS hub_materials_updated_at ON public.hub_materiais;
CREATE TRIGGER hub_materiais_updated_at
  BEFORE UPDATE ON public.hub_materiais FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_collections_updated_at ON public.hub_colecoes;
CREATE TRIGGER hub_colecoes_updated_at
  BEFORE UPDATE ON public.hub_colecoes FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_collection_progress_updated_at ON public.hub_progresso_colecao;
CREATE TRIGGER hub_progresso_colecao_updated_at
  BEFORE UPDATE ON public.hub_progresso_colecao FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_system_config_updated_at ON public.hub_config_sistema;
CREATE TRIGGER hub_config_sistema_updated_at
  BEFORE UPDATE ON public.hub_config_sistema FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_system_integrations_updated_at ON public.hub_integracoes_sistema;
CREATE TRIGGER hub_integracoes_sistema_updated_at
  BEFORE UPDATE ON public.hub_integracoes_sistema FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

DROP TRIGGER IF EXISTS hub_chatbot_config_updated_at ON public.hub_config_chatbot;
CREATE TRIGGER hub_config_chatbot_updated_at
  BEFORE UPDATE ON public.hub_config_chatbot FOR EACH ROW
  EXECUTE FUNCTION hub_update_updated_at();

-- Recreate indexes (renamed automatically by PG, but index names still have old names)
-- Not necessary - indexes are renamed automatically with ALTER TABLE RENAME
