/**
 * Forçar reload do PostgREST via schema change
 * Toca a definição das funções para forçar detecção de mudança
 */

const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';

function q(sql) {
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
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== FORÇANDO RELOAD DO POSTGREST ===\n');

  // 1. Recriar get_current_empresa_id (toque na definição)
  console.log('1. Recriando get_current_empresa_id...');
  const r1 = await q(`
    CREATE OR REPLACE FUNCTION public.get_current_empresa_id()
    RETURNS UUID
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
    AS $$
      SELECT empresa_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
    $$;
  `);
  console.log(`   Status: ${JSON.stringify(r1)}`);

  // 2. Recriar is_super_admin_session
  console.log('2. Recriando is_super_admin_session...');
  const r2 = await q(`
    CREATE OR REPLACE FUNCTION public.is_super_admin_session()
    RETURNS BOOLEAN
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_admin = true
      );
    $$;
  `);
  console.log(`   Status: ${JSON.stringify(r2)}`);

  // 3. Recriar is_admin_or_super
  console.log('3. Recriando is_admin_or_super...');
  const r3 = await q(`
    CREATE OR REPLACE FUNCTION public.is_admin_or_super()
    RETURNS BOOLEAN
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
      );
    $$;
  `);
  console.log(`   Status: ${JSON.stringify(r3)}`);

  // 4. Touch a tabela catalogo_implantes (comment change força reload)
  console.log('4. Forçando touch na tabela catalogo_implantes...');
  const r4 = await q(`
    COMMENT ON TABLE public.catalogo_implantes IS 'Implantes do catálogo - reload timestamp: ${Date.now()}';
  `);
  console.log(`   Status: ${JSON.stringify(r4)}`);

  // 5. Verificar que as funções existem
  console.log('\n5. Verificação final...');
  const check = await q(`
    SELECT 
      p.proname,
      CASE WHEN pg_get_functiondef(p.oid) LIKE '%search_path%' THEN '✅ OK' ELSE '❌ MISSING' END AS status
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('get_current_empresa_id', 'is_super_admin_session', 'is_admin_or_super');
  `);
  if (Array.isArray(check)) {
    for (const c of check) console.log(`   ${c.proname}: ${c.status}`);
  }

  console.log('\n✅ Schema tocado. PostgREST deve recarregar em ~5 segundos.');
  console.log('   Teste no browser agora.');
}

main().catch(console.error);
