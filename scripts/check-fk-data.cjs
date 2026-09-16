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
  console.log('=== DADOS REAIS DAS COLUNAS FK ===\n');

  // 1. Abutments: parafuso_id e chave_id
  console.log('--- catalogo_abutments (parafuso_id, chave_id) ---');
  const ab = await q(`
    SELECT sku, empresa_id, parafuso_id, chave_id 
    FROM catalogo_abutments 
    LIMIT 5;
  `);
  if (Array.isArray(ab)) for (const r of ab) console.log(`   ${r.sku} | empresa=${r.empresa_id?.slice(0,8)} | parafuso_id=${r.parafuso_id} | chave_id=${r.chave_id}`);

  // 2. Componentes: parafuso_id e chave_id
  console.log('\n--- catalogo_componentes (parafuso_id, chave_id) ---');
  const comp = await q(`
    SELECT sku, empresa_id, parafuso_id, chave_id 
    FROM catalogo_componentes 
    LIMIT 5;
  `);
  if (Array.isArray(comp)) for (const r of comp) console.log(`   ${r.sku} | empresa=${r.empresa_id?.slice(0,8)} | parafuso_id=${r.parafuso_id} | chave_id=${r.chave_id}`);

  // 3. Parafusos: chave_id
  console.log('\n--- catalogo_parafusos (chave_id) ---');
  const par = await q(`
    SELECT sku, empresa_id, chave_id 
    FROM catalogo_parafusos 
    LIMIT 5;
  `);
  if (Array.isArray(par)) for (const r of par) console.log(`   ${r.sku} | empresa=${r.empresa_id?.slice(0,8)} | chave_id=${r.chave_id}`);

  // 4. Cicatrizadores: implante_id e chave_id
  console.log('\n--- catalogo_cicatrizadores (implante_id, chave_id) ---');
  const cic = await q(`
    SELECT sku, empresa_id, implante_id, chave_id 
    FROM catalogo_cicatrizadores 
    LIMIT 5;
  `);
  if (Array.isArray(cic)) for (const r of cic) console.log(`   ${r.sku} | empresa=${r.empresa_id?.slice(0,8)} | implante_id=${r.implante_id} | chave_id=${r.chave_id}`);

  // 5. Verificar: chave_id em abutments → é UUID que existe em catalogo_chaves?
  console.log('\n--- Verificação: chave_id FKs válidos? ---');
  const val1 = await q(`
    SELECT a.sku, a.chave_id, c.sku AS chave_sku
    FROM catalogo_abutments a
    LEFT JOIN catalogo_chaves c ON (a.chave_id::text = c.sku AND a.empresa_id = c.empresa_id)
    WHERE a.chave_id IS NOT NULL
    LIMIT 3;
  `);
  console.log('   abutments.chave_id → catalogo_chaves (via sku+empresa):');
  if (Array.isArray(val1)) for (const r of val1) console.log(`     ${r.sku}: chave_id=${r.chave_id} → ${r.chave_sku || 'NOT FOUND'}`);

  // 6. Verificar: implante_id em cicatrizadores → é UUID?
  console.log('\n--- Verificação: implante_id FKs válidos? ---');
  const val2 = await q(`
    SELECT c.sku, c.implante_id, i.sku AS impl_sku
    FROM catalogo_cicatrizadores c
    LEFT JOIN catalogo_implantes i ON (c.implante_id = i.sku::uuid OR c.implante_id::text = i.sku AND c.empresa_id = i.empresa_id)
    WHERE c.implante_id IS NOT NULL
    LIMIT 3;
  `);
  console.log('   cicatrizadores.implante_id → catalogo_implantes:');
  if (Array.isArray(val2)) for (const r of val2) console.log(`     ${r.sku}: implante_id=${r.implante_id} → ${r.impl_sku || 'NOT FOUND'}`);

  // 7. Verificar: chave_id em abutments → existe como UUID em catalogo_chaves?
  console.log('\n--- Verificação: chave_id como UUID direto ---');
  const val3 = await q(`
    SELECT a.sku, a.chave_id
    FROM catalogo_abutments a
    WHERE a.chave_id IS NOT NULL
    LIMIT 3;
  `);
  if (Array.isArray(val3)) {
    for (const r of val3) {
      const check = await q(`SELECT sku FROM catalogo_chaves WHERE sku = '${r.chave_id}' LIMIT 1;`);
      const found = Array.isArray(check) && check.length > 0;
      console.log(`   ${r.sku}: chave_id=${r.chave_id} → ${found ? 'EXISTS as sku' : 'NOT FOUND as sku'}`);
    }
  }

  // 8. Verificar: parafuso_id como text → existe como sku em catalogo_parafusos?
  console.log('\n--- Verificação: parafuso_id como SKU ---');
  const val4 = await q(`
    SELECT a.sku, a.parafuso_id, a.empresa_id
    FROM catalogo_abutments a
    WHERE a.parafuso_id IS NOT NULL
    LIMIT 3;
  `);
  if (Array.isArray(val4)) {
    for (const r of val4) {
      const check = await q(`SELECT sku FROM catalogo_parafusos WHERE sku = '${r.parafuso_id}' AND empresa_id = '${r.empresa_id}' LIMIT 1;`);
      const found = Array.isArray(check) && check.length > 0;
      console.log(`   ${r.sku}: parafuso_id=${r.parafuso_id} → ${found ? 'EXISTS' : 'NOT FOUND'}`);
    }
  }
}

main().catch(console.error);
