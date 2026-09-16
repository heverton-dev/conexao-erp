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
  console.log('=== VERIFICAÇÃO DIRETA ===\n');

  // Heverton: empresa_id = 6687e2f0-1ff6-406d-b621-7927764f121a (Conexão)
  const HEVERTON_EMPRESA = '6687e2f0-1ff6-406d-b621-7927764f121a';

  // 1. Implantes para Conexão
  const impl = await q(`SELECT COUNT(*) as total FROM catalogo_implantes WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Implantes para Conexão: ${JSON.stringify(impl)}`);

  // 2. Abutments
  const abt = await q(`SELECT COUNT(*) as total FROM catalogo_abutments WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Abutments para Conexão: ${JSON.stringify(abt)}`);

  // 3. Kits
  const kits = await q(`SELECT COUNT(*) as total FROM catalogo_kits WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Kits para Conexão: ${JSON.stringify(kits)}`);

  // 4. Categorias
  const cats = await q(`SELECT COUNT(*) as total FROM catalogo_categorias WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Categorias para Conexão: ${JSON.stringify(cats)}`);

  // 5. Conexões
  const conn = await q(`SELECT COUNT(*) as total FROM catalogo_ips_conexoes WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Conexões para Conexão: ${JSON.stringify(conn)}`);

  // 6. Famílias
  const fam = await q(`SELECT COUNT(*) as total FROM catalogo_ips_familias WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Famílias para Conexão: ${JSON.stringify(fam)}`);

  // 7. Linhas
  const lin = await q(`SELECT COUNT(*) as total FROM catalogo_ips_linhas WHERE empresa_id = '${HEVERTON_EMPRESA}';`);
  console.log(`Linhas para Conexão: ${JSON.stringify(lin)}`);

  // 8. Empresas
  const emp = await q(`SELECT id, nome, ativo FROM empresas ORDER BY nome;`);
  console.log(`\nEmpresas: ${JSON.stringify(emp, null, 2)}`);

  // 9. Heverton profile
  const prof = await q(`SELECT id, email, empresa_id, is_super_admin, role FROM profiles WHERE email LIKE '%heverton%';`);
  console.log(`\nHeverton: ${JSON.stringify(prof, null, 2)}`);

  // 10. Todas as tabelas que NÃO têm empresa_id mas têm policies
  console.log('\n=== TABELAS SEM empresa_id ===');
  const noEmp = await q(`
    SELECT t.tablename
    FROM pg_tables t
    WHERE t.schemaname='public' AND t.tablename LIKE 'catalogo_%'
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_schema='public' AND c.table_name=t.tablename AND c.column_name='empresa_id'
      )
    ORDER BY t.tablename;
  `);
  if (Array.isArray(noEmp)) {
    for (const t of noEmp) {
      console.log(`  ⚠️ ${t.tablename} - SEM empresa_id!`);
    }
  }
}

main().catch(console.error);
