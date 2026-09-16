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
  console.log('=== FKs DA CADEIA DE JOIN DO FRONTEND ===\n');

  // Todas as tabelas da cadeia
  const tables = [
    'catalogo_implantes',
    'catalogo_ips_linhas', 
    'catalogo_ips_familias',
    'catalogo_ips_conexoes',
    'catalogo_categorias'
  ];

  for (const tbl of tables) {
    console.log(`--- ${tbl} ---`);
    const fks = await q(`
      SELECT
        kcu.column_name AS from_col,
        ccu.table_name AS to_table,
        ccu.column_name AS to_col,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public' 
        AND tc.table_name = '${tbl}';
    `);
    if (Array.isArray(fks) && fks.length > 0) {
      for (const f of fks) console.log(`   ✓ ${f.from_col} → ${f.to_table}.${f.to_col}`);
    } else {
      console.log('   ⚠️  NENHUMA FK!');
    }
    console.log();
  }

  // Verificar também se existe constraint de PK
  console.log('--- PRIMARY KEYS ---');
  for (const tbl of tables) {
    const pk = await q(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_schema = 'public' 
        AND tc.table_name = '${tbl}';
    `);
    if (Array.isArray(pk) && pk.length > 0) {
      console.log(`   ${tbl}: ${pk.map(p => p.column_name).join(', ')}`);
    } else {
      console.log(`   ${tbl}: ⚠️  SEM PK!`);
    }
  }
}

main().catch(console.error);
