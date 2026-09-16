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
  // 1. Tabela empresas - RLS?
  console.log('=== 1. EMPRESAS TABLE RLS ===');
  const empRls = await q(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename='empresas';`);
  console.log(JSON.stringify(empRls));

  // 2. Policies na tabela empresas
  console.log('\n=== 2. EMPRESAS POLICIES ===');
  const empPol = await q(`SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' AND tablename='empresas';`);
  console.log(JSON.stringify(empPol, null, 2));

  // 3. Qual auth module schema existe
  console.log('\n=== 3. AUTH SCHEMA ===');
  const authSchema = await q(`SELECT schema_name FROM information_schema.schemata WHERE schema_name='auth';`);
  console.log(JSON.stringify(authSchema));

  // 4. Existe auth.uid() como função?
  console.log('\n=== 4. AUTH.UID FUNCTION ===');
  const authUid = await q(`
    SELECT p.proname, pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'auth' AND p.proname = 'uid';
  `);
  if (Array.isArray(authUid) && authUid.length > 0) {
    console.log(authUid[0].def);
  } else {
    console.log('auth.uid() não encontrada como função!');
  }

  // 5. Listar todas as tabelas catalogo_* e suas policies count
  console.log('\n=== 5. CATALOGO TABLES POLICY COUNT ===');
  const tablePols = await q(`
    SELECT t.tablename, t.rowsecurity,
      (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t.tablename) AS pol_count
    FROM pg_tables t
    WHERE t.schemaname='public' AND t.tablename LIKE 'catalogo_%'
    ORDER BY t.tablename;
  `);
  if (Array.isArray(tablePols)) {
    for (const t of tablePols) {
      const status = t.rowsecurity ? (t.pol_count >= 4 ? '✅' : `⚠️ ${t.pol_count}p`) : '❌ NO RLS';
      console.log(`  ${status} ${t.tablename} (RLS: ${t.rowsecurity}, policies: ${t.pol_count})`);
    }
  }

  // 6. Verificar se auth.jwt() retorna algo
  console.log('\n=== 6. AUTH.JWT() ===');
  const jwt = await q(`SELECT auth.jwt();`);
  console.log(JSON.stringify(jwt));

  // 7. Verificar o search_path do PostgREST
  console.log('\n=== 7. CURRENT SEARCH_PATH ===');
  const sp = await q(`SHOW search_path;`);
  console.log(JSON.stringify(sp));
}

main().catch(console.error);
