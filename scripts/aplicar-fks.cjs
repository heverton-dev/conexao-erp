const https = require('https');
const fs = require('fs');
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
  console.log('=== VERIFICAÇÃO PRÉ-FK + APLICAÇÃO ===\n');

  // 1. Verificar integridade dos dados antes de criar FKs
  console.log('1. Verificando se linha_id aponta para linhas existentes...');
  const orphans1 = await q(`
    SELECT i.sku, i.linha_id
    FROM catalogo_implantes i
    LEFT JOIN catalogo_ips_linhas l ON i.linha_id = l.id
    WHERE l.id IS NULL;
  `);
  if (Array.isArray(orphans1) && orphans1.length > 0) {
    console.log('   ⚠️  ORFÃS encontrados (linha_id inválido):');
    for (const o of orphans1) console.log(`      ${o.sku}: linha_id=${o.linha_id}`);
  } else {
    console.log('   ✓ Todos linha_id são válidos');
  }

  console.log('\n2. Verificando conexao_id...');
  const orphans2 = await q(`
    SELECT i.sku, i.conexao_id
    FROM catalogo_implantes i
    LEFT JOIN catalogo_ips_conexoes c ON i.conexao_id = c.id
    WHERE i.conexao_id IS NOT NULL AND c.id IS NULL;
  `);
  if (Array.isArray(orphans2) && orphans2.length > 0) {
    console.log('   ⚠️  ORFÃS:');
    for (const o of orphans2) console.log(`      ${o.sku}: conexao_id=${o.conexao_id}`);
  } else {
    console.log('   ✓ Todos conexao_id são válidos (ou NULL)');
  }

  console.log('\n3. Verificando familia_id...');
  const orphans3 = await q(`
    SELECT i.sku, i.familia_id
    FROM catalogo_implantes i
    LEFT JOIN catalogo_ips_familias f ON i.familia_id = f.id
    WHERE i.familia_id IS NOT NULL AND f.id IS NULL;
  `);
  if (Array.isArray(orphans3) && orphans3.length > 0) {
    console.log('   ⚠️  ORFÃS:');
    for (const o of orphans3) console.log(`      ${o.sku}: familia_id=${o.familia_id}`);
  } else {
    console.log('   ✓ Todos familia_id são válidos (ou NULL)');
  }

  console.log('\n4. Verificando categoria_id...');
  const orphans4 = await q(`
    SELECT i.sku, i.categoria_id
    FROM catalogo_implantes i
    LEFT JOIN catalogo_categorias cat ON i.categoria_id = cat.id
    WHERE i.categoria_id IS NOT NULL AND cat.id IS NULL;
  `);
  if (Array.isArray(orphans4) && orphans4.length > 0) {
    console.log('   ⚠️  ORFÃS:');
    for (const o of orphans4) console.log(`      ${o.sku}: categoria_id=${o.categoria_id}`);
  } else {
    console.log('   ✓ Todos categoria_id são válidos (ou NULL)');
  }

  // 5. Aplicar migration
  console.log('\n5. Aplicando migration (adicionar FKs)...');
  const sql = fs.readFileSync('supabase/migrations/20260718140000_add_missing_fks_implantes.sql', 'utf-8');
  const result = await q(sql);
  console.log(`   Resultado: ${JSON.stringify(result)}`);

  // 6. Verificar FKs criadas
  console.log('\n6. Verificando FKs criadas...');
  const fks = await q(`
    SELECT
      kcu.column_name AS from_col,
      ccu.table_name AS to_table,
      ccu.column_name AS to_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public' 
      AND tc.table_name = 'catalogo_implantes';
  `);
  if (Array.isArray(fks)) {
    for (const f of fks) console.log(`   ✓ ${f.from_col} → ${f.to_table}.${f.to_col}`);
  }

  // 7. Forçar reload PostgREST
  console.log('\n7. Forçando reload PostgREST...');
  await q(`NOTIFY pgrst, 'reload schema';`);
  console.log('   ✓ NOTIFY enviado');

  console.log('\n✅ CONCLUÍDO. Teste o frontend agora!');
}

main().catch(console.error);
