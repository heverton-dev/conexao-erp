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
  console.log('=== TIPOS DAS COLUNAS FK + COLUNAS DAS TABELAS ALVO ===\n');

  // 1. Tipo das colunas FK nas tabelas fonte
  const fkCols = [
    { tbl: 'catalogo_abutments', cols: ['tipo_abutment_id', 'parafuso_id', 'chave_id'] },
    { tbl: 'catalogo_componentes', cols: ['parafuso_id', 'chave_id'] },
    { tbl: 'catalogo_parafusos', cols: ['chave_id'] },
    { tbl: 'catalogo_cicatrizadores', cols: ['implante_id', 'chave_id'] },
  ];

  console.log('--- Tipos das colunas FK (tabelas fonte) ---');
  for (const item of fkCols) {
    for (const col of item.cols) {
      const r = await q(`
        SELECT data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='${item.tbl}' AND column_name='${col}';
      `);
      const type = Array.isArray(r) && r[0] ? r[0].data_type : '?';
      console.log(`   ${item.tbl}.${col}: ${type}`);
    }
  }

  // 2. Colunas das tabelas alvo (que NÃO têm id)
  const targetTables = ['catalogo_parafusos', 'catalogo_chaves', 'catalogo_implantes'];
  console.log('\n--- Colunas das tabelas alvo (sem id) ---');
  for (const tbl of targetTables) {
    const r = await q(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='${tbl}'
      ORDER BY ordinal_position;
    `);
    if (Array.isArray(r)) {
      console.log(`   ${tbl}: ${r.map(c => `${c.column_name}(${c.data_type})`).join(', ')}`);
    }
  }

  // 3. Verificar se sku é único (sem empresa_id)
  console.log('\n--- Unicidade de sku (sem empresa_id) ---');
  for (const tbl of targetTables) {
    const r = await q(`
      SELECT count(*) AS total, count(DISTINCT sku) AS unicos
      FROM ${tbl};
    `);
    if (Array.isArray(r) && r[0]) {
      const unique = r[0].total === r[0].unicos ? '✓ ÚNICO' : '✗ DUPLICADO';
      console.log(`   ${tbl}: total=${r[0].total} sku_unicos=${r[0].unicos} → ${unique}`);
    }
  }
}

main().catch(console.error);
