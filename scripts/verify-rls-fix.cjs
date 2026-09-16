/**
 * Verificação pós-fix: confirma que as funções helper RLS foram corrigidas
 * Uso: node scripts/verify-rls-fix.cjs
 */

const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';

const sql = `
-- Verificar definição das funções
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%set search_path%' 
      OR pg_get_functiondef(p.oid) LIKE '%SET search_path%' 
    THEN '✅ COM search_path'
    ELSE '❌ SEM search_path'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('get_current_empresa_id', 'is_super_admin_session', 'is_admin_or_super')
ORDER BY p.proname;

-- Verificar policies em uma tabela de teste (catalogo_implantes)
SELECT 
  policyname,
  cmd,
  qual AS using_clause,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'catalogo_implantes'
ORDER BY cmd;

-- Contar tabelas com policies
SELECT 
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'catalogo_%'
GROUP BY tablename
HAVING COUNT(*) < 4
ORDER BY policy_count;
`;

const body = JSON.stringify({ query: sql });
const req = https.request({
  hostname: 'api.supabase.com',
  path: '/v1/projects/' + PROJECT + '/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.log('❌ Erro:', json.error);
      } else {
        console.log(JSON.stringify(json, null, 2));
      }
    } catch {
      console.log(data.substring(0, 2000));
    }
  });
});

req.on('error', (e) => console.error('Erro:', e.message));
req.write(body);
req.end();
