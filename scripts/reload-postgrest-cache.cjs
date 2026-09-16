/**
 * Forçar reload do schema cache do PostgREST
 * Necessário após alterar funções SQL que são usadas em RLS policies
 */

const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';

function query(sql) {
  return new Promise((resolve, reject) => {
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
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== RELOAD POSTGREST SCHEMA CACHE ===\n');

  // 1. Notify PostgREST to reload schema
  console.log('1. Enviando NOTIFY pgrst, reload schema...');
  const notify = await query(`NOTIFY pgrst, 'reload schema';`);
  console.log(`   Resultado: ${JSON.stringify(notify)}`);

  // 2. Also try the alternative notification
  console.log('\n2. Enviando NOTIFY pgrst, reload...');
  const notify2 = await query(`NOTIFY pgrst, 'reload';`);
  console.log(`   Resultado: ${JSON.stringify(notify2)}`);

  // 3. Verify functions are accessible with proper search_path
  console.log('\n3. Testando get_current_empresa_id() como postgres...');
  const test1 = await query(`SELECT get_current_empresa_id();`);
  console.log(`   Resultado: ${JSON.stringify(test1)}`);
  console.log('   (Esperado NULL pois postgres não tem auth.uid())');

  // 4. Test is_super_admin_session
  console.log('\n4. Testando is_super_admin_session() como postgres...');
  const test2 = await query(`SELECT is_super_admin_session();`);
  console.log(`   Resultado: ${JSON.stringify(test2)}`);
  console.log('   (Esperado false pois postgres não tem auth.uid())');

  // 5. Check if the functions are being used correctly in policies
  console.log('\n5. Verificando se policies usam as funções...');
  const policies = await query(`
    SELECT tablename, policyname, qual 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'catalogo_implantes'
      AND qual LIKE '%get_current_empresa_id%';
  `);
  if (Array.isArray(policies)) {
    console.log(`   Policies usando get_current_empresa_id: ${policies.length}`);
    for (const p of policies) {
      console.log(`     ${p.policyname}: ${p.qual}`);
    }
  }

  // 6. Verify the schema cache by checking if PostgREST can see the functions
  console.log('\n6. Verificando se PostgREST pode ver as funções...');
  const funcs = await query(`
    SELECT p.proname, 
      CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p2 
        JOIN pg_namespace n2 ON n2.oid = p2.pronamespace 
        WHERE n2.nspname = 'public' 
          AND p2.proname = p.proname
          AND pg_get_functiondef(p2.oid) LIKE '%search_path%'
      ) THEN '✅' ELSE '❌' END AS has_search_path
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('get_current_empresa_id', 'is_super_admin_session');
  `);
  if (Array.isArray(funcs)) {
    for (const f of funcs) {
      console.log(`   ${f.proname}: ${f.has_search_path}`);
    }
  }

  console.log('\n=== FIM ===');
  console.log('\n⚠️  IMPORTANTE: Se o PostgREST não recarregar automaticamente,');
  console.log('   vá no Supabase Dashboard → Settings → API → e clique em "Reload Schema"');
  console.log('   Ou aguarde ~30 segundos para o cache expirar.');
}

main().catch(console.error);
