-- Decisao registrada em 2026-07-24, apos auditoria do sistema de permissionamento.
--
-- Achado: a migration 00025_fix_rls_recursion.sql redefiniu is_admin_or_super()
-- para considerar apenas role='admin' (o bypass para role='editor', presente
-- desde 00012_cadastro_role_permissao.sql, desapareceu). O objetivo daquela
-- migration era corrigir recursao de RLS via SECURITY DEFINER, sem mencao a
-- remover o escopo do editor -- tudo indica efeito colateral nao intencional,
-- nao decisao deliberada.
--
-- Decisao: MANTER o comportamento atual (somente 'admin' e is_super_admin
-- fazem bypass). Motivos: (1) a tela de credenciais (/credenciais) nao expoe
-- selecao de role='editor' ha tempo -- ninguem provisiona esse papel via UI
-- hoje; (2) o sistema de permissoes granular (tabela permissoes + RBAC de
-- perfis) ja substitui a necessidade de um role intermediario com bypass
-- amplo; (3) reverter ampliaria o bypass administrativo sem necessidade
-- funcional identificada.
--
-- Nenhuma mudanca de schema/funcao nesta migration -- apenas documentacao
-- formal da decisao, para nao ser re-analisada em auditorias futuras.
COMMENT ON FUNCTION public.is_admin_or_super() IS
  'Bypass administrativo: role=admin ou is_super_admin=true. role=editor foi '
  'intencionalmente mantido fora do bypass desde 2026-07-24 (ver migration '
  '20260724000004_decisao_papel_editor.sql) -- nao e mais provisionado via UI '
  'e o sistema granular de permissoes/perfis cobre o caso de uso.';
