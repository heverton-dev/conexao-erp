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
  console.log('=== DIAGNÓSTICO COMPLETO - FRONTEND + DB ===\n');

  // 1. Verificar se as tabelas existem
  console.log('--- 1. TABELAS DO CATÁLOGO ---');
  const tables = await q(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' AND tablename LIKE 'catalogo_%'
    ORDER BY tablename;
  `);
  if (Array.isArray(tables)) {
    for (const t of tables) console.log(`   ✓ ${t.tablename}`);
  }

  // 2. Verificar colunas de catalogo_implantes (colunas FK específicas)
  console.log('\n--- 2. COLUNAS catalogo_implantes ---');
  const cols = await q(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='catalogo_implantes'
    ORDER BY ordinal_position;
  `);
  if (Array.isArray(cols)) {
    for (const c of cols) console.log(`   ${c.column_name}: ${c.data_type} (nullable=${c.is_nullable})`);
  }

  // 3. Verificar colunas das tabelas da cadeia de JOIN
  console.log('\n--- 3. COLUNAS catalogo_ips_linhas ---');
  const linhasCols = await q(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='catalogo_ips_linhas'
    ORDER BY ordinal_position;
  `);
  if (Array.isArray(linhasCols)) {
    for (const c of linhasCols) console.log(`   ${c.column_name}: ${c.data_type}`);
  } else { console.log('   ⚠️ TABELA NÃO EXISTE!'); console.log(JSON.stringify(linhasCols)); }

  console.log('\n--- 4. COLUNAS catalogo_ips_familias ---');
  const familiasCols = await q(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='catalogo_ips_familias'
    ORDER BY ordinal_position;
  `);
  if (Array.isArray(familiasCols)) {
    for (const c of familiasCols) console.log(`   ${c.column_name}: ${c.data_type}`);
  } else { console.log('   ⚠️ TABELA NÃO EXISTE!'); console.log(JSON.stringify(familiasCols)); }

  console.log('\n--- 5. COLUNAS catalogo_ips_conexoes ---');
  const conexoesCols = await q(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='catalogo_ips_conexoes'
    ORDER BY ordinal_position;
  `);
  if (Array.isArray(conexoesCols)) {
    for (const c of conexoesCols) console.log(`   ${c.column_name}: ${c.data_type}`);
  } else { console.log('   ⚠️ TABELA NÃO EXISTE!'); console.log(JSON.stringify(conexoesCols)); }

  console.log('\n--- 6. COLUNAS catalogo_categorias ---');
  const catsCols = await q(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='catalogo_categorias'
    ORDER BY ordinal_position;
  `);
  if (Array.isArray(catsCols)) {
    for (const c of catsCols) console.log(`   ${c.column_name}: ${c.data_type}`);
  } else { console.log('   ⚠️ TABELA NÃO EXISTE!'); console.log(JSON.stringify(catsCols)); }

  // 4. Verificar FKs
  console.log('\n--- 7. FOREIGN KEYS catalogo_implantes ---');
  const fks = await q(`
    SELECT
      kcu.column_name AS from_col,
      ccu.table_name AS to_table,
      ccu.column_name AS to_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public' 
      AND tc.table_name = 'catalogo_implantes';
  `);
  if (Array.isArray(fks)) {
    for (const f of fks) console.log(`   ${f.from_col} → ${f.to_table}.${f.to_col}`);
  } else { console.log('   Nenhuma FK encontrada ou erro'); console.log(JSON.stringify(fks)); }

  // 5. Verificar GRANTs (permissões de tabela)
  console.log('\n--- 8. GRANTs catalogo_implantes ---');
  const grants = await q(`
    SELECT grantee, privilege_type, is_grantable
    FROM information_schema.role_table_grants 
    WHERE table_schema='public' AND table_name='catalogo_implantes'
    ORDER BY grantee, privilege_type;
  `);
  if (Array.isArray(grants)) {
    for (const g of grants) console.log(`   ${g.grantee}: ${g.privilege_type} (grantable=${g.is_grantable})`);
  }

  console.log('\n--- 9. GRANTs catalogo_categorias ---');
  const grantsCats = await q(`
    SELECT grantee, privilege_type
    FROM information_schema.role_table_grants 
    WHERE table_schema='public' AND table_name='catalogo_categorias'
    ORDER BY grantee, privilege_type;
  `);
  if (Array.isArray(grantsCats)) {
    for (const g of grantsCats) console.log(`   ${g.grantee}: ${g.privilege_type}`);
  }

  // 6. Verificar RLS habilitado em todas as tabelas
  console.log('\n--- 10. RLS STATUS ---');
  const rls = await q(`
    SELECT tablename, rowsecurity
    FROM pg_tables 
    WHERE schemaname='public' AND tablename LIKE 'catalogo_%'
    ORDER BY tablename;
  `);
  if (Array.isArray(rls)) {
    for (const r of rls) console.log(`   ${r.tablename}: RLS=${r.rowsecurity}`);
  }

  // 7. Verificar policies na cadeia de JOIN
  console.log('\n--- 11. POLICIES das tabelas de JOIN ---');
  const joinPolicies = await q(`
    SELECT tablename, policyname, cmd, qual
    FROM pg_policies 
    WHERE schemaname='public' 
      AND tablename IN ('catalogo_categorias', 'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas')
    ORDER BY tablename, cmd;
  `);
  if (Array.isArray(joinPolicies)) {
    for (const p of joinPolicies) console.log(`   ${p.tablename} | ${p.cmd} | ${p.policyname}`);
  } else { console.log('   Nenhuma policy encontrada'); }

  // 8. Dados nas tabelas da cadeia
  console.log('\n--- 12. DADOS nas tabelas ---');
  const tables_data = ['catalogo_categorias', 'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas', 'catalogo_implantes'];
  for (const tbl of tables_data) {
    const count = await q(`SELECT count(*) AS total FROM ${tbl};`);
    const total = Array.isArray(count) ? count[0]?.total : '?';
    console.log(`   ${tbl}: ${total} rows`);
  }

  // 9. Dados reais de implantes (sem JOIN, só para verificar)
  console.log('\n--- 13. IMPLANTES (dados brutos, empresa Conexão) ---');
  const impl = await q(`
    SELECT id, sku, nome, linha_id, empresa_id 
    FROM catalogo_implantes 
    WHERE empresa_id = '6687e2f0-1ff6-406d-b621-7927764f121a'
    ORDER BY sku
    LIMIT 5;
  `);
  if (Array.isArray(impl)) {
    for (const i of impl) console.log(`   ${i.sku} | ${i.nome || '(vazio)'} | linha_id=${i.linha_id || 'NULL'}`);
  } else { console.log(JSON.stringify(impl)); }

  // 10. Teste da query EXATA que o frontend faz (simulando service_role)
  console.log('\n--- 14. QUERY EXATA DO FRONTEND (service_role) ---');
  const queryResult = await q(`
    SELECT i.sku, i.nome, i.empresa_id,
      l.id AS l_id, l.nome AS l_nome,
      f.id AS f_id, f.nome AS f_nome,
      c.id AS c_id, c.nome AS c_nome,
      cat.id AS cat_id, cat.nome AS cat_nome
    FROM catalogo_implantes i
    LEFT JOIN catalogo_ips_linhas l ON i.linha_id = l.id
    LEFT JOIN catalogo_ips_familias f ON l.familia_id = f.id
    LEFT JOIN catalogo_ips_conexoes c ON f.conexao_id = c.id
    LEFT JOIN catalogo_categorias cat ON c.categoria_id = cat.id
    WHERE i.empresa_id = '6687e2f0-1ff6-406d-b621-7927764f121a'
    ORDER BY i.sku
    LIMIT 5;
  `);
  if (Array.isArray(queryResult)) {
    for (const r of queryResult) {
      console.log(`   ${r.sku} | nome=${r.nome || '?'} | linha=${r.l_nome || 'NULL'} | familia=${r.f_nome || 'NULL'} | conexao=${r.c_nome || 'NULL'} | cat=${r.cat_nome || 'NULL'}`);
    }
  } else { console.log(JSON.stringify(queryResult)); }

  console.log('\n=== FIM ===');
}

main().catch(console.error);
