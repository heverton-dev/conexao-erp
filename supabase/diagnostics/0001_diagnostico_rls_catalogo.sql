-- ============================================================
-- DIAGNÓSTICO RLS - Catálogo
-- Execute este script no SQL Editor do Supabase Dashboard
-- logado como o usuário Heverton (ou qualquer usuário afetado)
-- ============================================================

-- 1. Verificar auth.uid() atual
SELECT 
  auth.uid() AS user_id,
  current_setting('request.jwt.claims', true)::jsonb AS jwt_claims;

-- 2. Verificar profile do usuário logado
SELECT 
  p.id,
  p.email,
  p.nome,
  p.role,
  p.empresa_id,
  p.is_super_admin,
  p.ativo
FROM profiles p
WHERE p.id = auth.uid();

-- 3. Testar get_current_empresa_id()
SELECT get_current_empresa_id() AS empresa_retornada;

-- 4. Testar is_super_admin_session()
SELECT is_super_admin_session() AS is_super;

-- 5. Listar empresas disponíveis
SELECT id, nome, slug, ativo FROM empresas ORDER BY nome;

-- 6. Verificar se a empresa_id do profile existe na tabela empresas
SELECT 
  p.id AS user_id,
  p.empresa_id,
  e.nome AS empresa_nome,
  e.ativo AS empresa_ativa
FROM profiles p
LEFT JOIN empresas e ON e.id = p.empresa_id
WHERE p.id = auth.uid();

-- 7. Testar query direta (sem RLS) via service_role
-- ⚠️ Execute como service_role ou no SQL Editor
SELECT COUNT(*) AS total_implantes FROM catalogo_implantes;
SELECT empresa_id, COUNT(*) AS total 
FROM catalogo_implantes 
GROUP BY empresa_id;

-- 8. Verificar policies nas tabelas do catálogo
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'catalogo_%'
ORDER BY tablename, policyname;

-- 9. Verificar se RLS está habilitado nas tabelas do catálogo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'catalogo_%'
ORDER BY tablename;

-- 10. Verificar a versão atual das funções helper
SELECT 
  p.proname,
  pg_get_functiondef(p.oid) AS definicao
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_current_empresa_id', 'is_super_admin_session')
ORDER BY p.proname;

-- 11. Verificar se a empresa_id do usuário corresponde ao seed
-- Execute este comparando com o empresa_id do passo 2
-- Deve retornar dados se o RLS estiver funcionando:
SELECT COUNT(*) AS implantes_visiveis_para_usuario
FROM catalogo_implantes
WHERE empresa_id = get_current_empresa_id();

-- 12. Seempresa_id for NULL, verificar diretamente:
SELECT 
  p.id,
  p.email,
  p.empresa_id,
  CASE 
    WHEN p.empresa_id IS NULL THEN '❌ EMPRESA_ID É NULL!'
    WHEN NOT EXISTS (SELECT 1 FROM empresas e WHERE e.id = p.empresa_id) 
      THEN '❌ EMPRESA_ID NÃO EXISTE NA TABELA empresas!'
    ELSE '✅ empresa_id válida: ' || p.empresa_id::text
  END AS diagnostico
FROM profiles p
WHERE p.id = auth.uid();
