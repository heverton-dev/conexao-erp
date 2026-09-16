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
  console.log('=== PRIMARY KEYS DE TODAS AS TABELAS ENVOLVIDAS ===\n');

  const tables = [
    'catalogo_abutments', 'catalogo_cps_tipos_abutments', 'catalogo_parafusos',
    'catalogo_componentes', 'catalogo_cps_tipos_componentes', 'catalogo_chaves',
    'catalogo_cicatrizadores', 'catalogo_implantes',
    'catalogo_cps_tipos_parafusos', 'catalogo_cps_tipos_reabilitacao',
    'catalogo_tipos_chaves', 'catalogo_tipos_fresas',
    'catalogo_tipos_complementares', 'catalogo_tipos_opcionais',
    'catalogo_tipos_kits', 'catalogo_cps_tipos_workflows',
    'catalogo_fresas', 'catalogo_complementares', 'catalogo_opcionais',
    'catalogo_kits', 'catalogo_cps_etapas_workflows',
  ];

  for (const tbl of tables) {
    // PK
    const pk = await q(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_schema = 'public' 
        AND tc.table_name = '${tbl}';
    `);
    const pkCols = Array.isArray(pk) ? pk.map(p => p.column_name) : [];

    // Colunas relevantes (que podem ser FK targets)
    const cols = await q(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='${tbl}'
      ORDER BY ordinal_position;
    `);
    const colNames = Array.isArray(cols) ? cols.map(c => c.column_name) : [];

    const hasId = colNames.includes('id');
    const status = hasId ? '✓' : (pkCols.length === 0 ? '⚠️  SEM PK' : `⚠️  PK = (${pkCols.join(', ')})`);
    console.log(`   ${status} ${tbl}: PK=[${pkCols.join(', ')}] cols=${colNames.join(', ')}`);
  }
}

main().catch(console.error);
