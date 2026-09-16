-- ============================================================
-- Fix RLS: tabelas sensiveis abertas demais pelo loop generico
-- de 20260720000001_single_tenant_rls.sql
-- ============================================================
-- Contexto: o loop aplicou, para ~90 tabelas, o padrao
--   SELECT/INSERT: authenticated USING/WITH CHECK (true)
--   UPDATE/DELETE: authenticated USING (is_admin_or_super())
-- Isso e correto para a maioria (catalogo, config), mas abriu
-- tabelas que guardam controle de acesso/identidade de usuarios
-- e dados pessoais de clientes. Esta migration restringe
-- especificamente essas tabelas, sem reverter o modelo
-- single-tenant geral (RLS aberta continua o padrao do sistema).

-- ============================================================
-- 1. permissoes — granularidade de acesso de CADA usuario
-- ============================================================
-- Falha: qualquer authenticated lia/inseria permissao de QUALQUER
-- usuario_id (SELECT/INSERT USING/WITH CHECK true). Restaura a
-- policy original ("Usuário vê própria permissão") + admin.

DROP POLICY IF EXISTS permissoes_select_auth ON public.permissoes;
DROP POLICY IF EXISTS permissoes_insert_auth ON public.permissoes;
DROP POLICY IF EXISTS permissoes_update_auth ON public.permissoes;
DROP POLICY IF EXISTS permissoes_delete_auth ON public.permissoes;
DROP POLICY IF EXISTS "Super admin pode tudo permissoes" ON public.permissoes;
DROP POLICY IF EXISTS "Usuário vê própria permissão" ON public.permissoes;

ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY permissoes_select_auth ON public.permissoes
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid() OR is_admin_or_super());

-- INSERT restrito a admin: criação de linha normal acontece via
-- trigger on_profile_created_permissoes (security definer, ignora RLS).
CREATE POLICY permissoes_insert_auth ON public.permissoes
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_super());

CREATE POLICY permissoes_update_auth ON public.permissoes
  FOR UPDATE TO authenticated
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY permissoes_delete_auth ON public.permissoes
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

-- ============================================================
-- 2. usuarios — tabela legada de staff/CRM (role, hierarquia)
-- ============================================================
-- Falha: SELECT true expõe role/hierarquia de TODO staff a
-- qualquer authenticated; INSERT true permite criar linha
-- arbitraria (ex.: auto-atribuir role='super_admin' se a linha
-- ainda não existir). Restaura o padrão original (00080512...):
-- próprio registro + gestor vê seus consultores + admin vê tudo.
-- Criação automática de linha ocorre via trigger no signup
-- (security definer, ignora RLS) — INSERT direto fica admin-only.

DROP POLICY IF EXISTS usuarios_select_auth ON public.usuarios;
DROP POLICY IF EXISTS usuarios_insert_auth ON public.usuarios;
DROP POLICY IF EXISTS usuarios_update_auth ON public.usuarios;
DROP POLICY IF EXISTS usuarios_delete_auth ON public.usuarios;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY usuarios_select_auth ON public.usuarios
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR gestor_id = auth.uid()
    OR is_admin_or_super()
  );

CREATE POLICY usuarios_insert_auth ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_super());

CREATE POLICY usuarios_update_auth ON public.usuarios
  FOR UPDATE TO authenticated
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY usuarios_delete_auth ON public.usuarios
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

-- ============================================================
-- 3. clientes — dados pessoais (nome, telefone, email, endereco)
-- ============================================================
-- Falha: SELECT true expõe PII de todos os clientes/leads a
-- qualquer authenticated. Restaura ownership por consultor
-- (consultor_atual_id, ver 20260512144729) + visibilidade do
-- gestor sobre os clientes de seus consultores (via usuarios.gestor_id,
-- já que a antiga função is_gestor_de() não existe mais no schema
-- single-tenant) + admin/super vê tudo.

DROP POLICY IF EXISTS clientes_select_auth ON public.clientes;
DROP POLICY IF EXISTS clientes_insert_auth ON public.clientes;
DROP POLICY IF EXISTS clientes_update_auth ON public.clientes;
DROP POLICY IF EXISTS clientes_delete_auth ON public.clientes;

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY clientes_select_auth ON public.clientes
  FOR SELECT TO authenticated
  USING (
    consultor_atual_id = auth.uid()
    OR is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.id = public.clientes.consultor_atual_id
        AND u.gestor_id = auth.uid()
    )
  );

-- INSERT/UPDATE mantidos abertos a authenticated: cadastro e
-- atualização de clientes é fluxo normal de consultor/cadastro,
-- não há campo de "dono" no momento da criação.
CREATE POLICY clientes_insert_auth ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY clientes_update_auth ON public.clientes
  FOR UPDATE TO authenticated
  USING (
    consultor_atual_id = auth.uid()
    OR is_admin_or_super()
  )
  WITH CHECK (
    consultor_atual_id = auth.uid()
    OR is_admin_or_super()
  );

CREATE POLICY clientes_delete_auth ON public.clientes
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

-- ============================================================
-- 4. funis_permissoes — ACL de acesso (view/edit) por funil
-- ============================================================
-- Falha: INSERT true permite qualquer authenticated conceder a
-- si mesmo (ou a terceiros) nivel 'edit' em QUALQUER funil_id,
-- sem ser o dono do funil. Restringe escrita a dono do funil
-- (funis.created_by) ou admin. SELECT restrito para não expor
-- a ACL inteira a qualquer authenticated.

DROP POLICY IF EXISTS funis_permissoes_select_auth ON public.funis_permissoes;
DROP POLICY IF EXISTS funis_permissoes_insert_auth ON public.funis_permissoes;
DROP POLICY IF EXISTS funis_permissoes_update_auth ON public.funis_permissoes;
DROP POLICY IF EXISTS funis_permissoes_delete_auth ON public.funis_permissoes;

ALTER TABLE public.funis_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY funis_permissoes_select_auth ON public.funis_permissoes
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.funis f
      WHERE f.id = public.funis_permissoes.funil_id
        AND f.created_by = auth.uid()
    )
  );

CREATE POLICY funis_permissoes_insert_auth ON public.funis_permissoes
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.funis f
      WHERE f.id = funil_id AND f.created_by = auth.uid()
    )
  );

CREATE POLICY funis_permissoes_update_auth ON public.funis_permissoes
  FOR UPDATE TO authenticated
  USING (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.funis f
      WHERE f.id = public.funis_permissoes.funil_id AND f.created_by = auth.uid()
    )
  )
  WITH CHECK (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.funis f
      WHERE f.id = funil_id AND f.created_by = auth.uid()
    )
  );

CREATE POLICY funis_permissoes_delete_auth ON public.funis_permissoes
  FOR DELETE TO authenticated
  USING (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.funis f
      WHERE f.id = public.funis_permissoes.funil_id AND f.created_by = auth.uid()
    )
  );

-- ============================================================
-- 5. catalogo_cliente_permissoes — feature flags por cliente
-- ============================================================
-- Falha: INSERT true permite qualquer authenticated conceder a
-- si mesmo (via cliente_id arbitrário) qualquer permissao_key
-- (ex.: ver preço de atacado). App usa clienteTemPermissao() como
-- gate de feature no catálogo (src/features/catalogo/services/
-- clientes.service.ts) — sensível o suficiente para restringir
-- escrita a admin. SELECT mantido aberto (apenas expõe quais
-- flags um cliente tem, não é PII).

DROP POLICY IF EXISTS catalogo_cliente_permissoes_select_auth ON public.catalogo_cliente_permissoes;
DROP POLICY IF EXISTS catalogo_cliente_permissoes_insert_auth ON public.catalogo_cliente_permissoes;
DROP POLICY IF EXISTS catalogo_cliente_permissoes_update_auth ON public.catalogo_cliente_permissoes;
DROP POLICY IF EXISTS catalogo_cliente_permissoes_delete_auth ON public.catalogo_cliente_permissoes;

ALTER TABLE public.catalogo_cliente_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_cliente_permissoes_select_auth ON public.catalogo_cliente_permissoes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY catalogo_cliente_permissoes_insert_auth ON public.catalogo_cliente_permissoes
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_super());

CREATE POLICY catalogo_cliente_permissoes_update_auth ON public.catalogo_cliente_permissoes
  FOR UPDATE TO authenticated
  USING (is_admin_or_super())
  WITH CHECK (is_admin_or_super());

CREATE POLICY catalogo_cliente_permissoes_delete_auth ON public.catalogo_cliente_permissoes
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

NOTIFY pgrst, 'reload schema';
