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
  console.log('=== AUDITORIA COMPLETA DE FKs PARA RESOURCE EMBEDDING ===\n');

  // Mapeamento: tabela_fonte → [{ alias, tabela_alvo, coluna_fk esperada }]
  // Baseado nas queries do frontend
  const expectedFks = {
    'catalogo_abutments': [
      { alias: 'tipo_abutment', table: 'catalogo_cps_tipos_abutments', expectedCol: 'tipo_abutment_id' },
      { alias: 'parafuso', table: 'catalogo_parafusos', expectedCol: 'parafuso_id' },
      { alias: 'chave', table: 'catalogo_chaves', expectedCol: 'chave_id' },
    ],
    'catalogo_componentes': [
      { alias: 'tipo_componente', table: 'catalogo_cps_tipos_componentes', expectedCol: 'tipo_componente_id' },
      { alias: 'tipo_abutment', table: 'catalogo_cps_tipos_abutments', expectedCol: 'tipo_abutment_id' },
      { alias: 'parafuso', table: 'catalogo_parafusos', expectedCol: 'parafuso_id' },
      { alias: 'chave', table: 'catalogo_chaves', expectedCol: 'chave_id' },
    ],
    'catalogo_parafusos': [
      { alias: 'tipo_parafuso', table: 'catalogo_cps_tipos_parafusos', expectedCol: 'tipo_parafuso_id' },
      { alias: 'chave', table: 'catalogo_chaves', expectedCol: 'chave_id' },
    ],
    'catalogo_cicatrizadores': [
      { alias: 'implante', table: 'catalogo_implantes', expectedCol: 'implante_id' },
      { alias: 'chave', table: 'catalogo_chaves', expectedCol: 'chave_id' },
    ],
    'catalogo_cps_tipos_abutments': [
      { alias: 'tipo_reabilitacao', table: 'catalogo_cps_tipos_reabilitacao', expectedCol: 'tipo_reabilitacao_id' },
    ],
    'catalogo_chaves': [
      { alias: 'tipo_chave', table: 'catalogo_tipos_chaves', expectedCol: 'tipo_chave_id' },
    ],
    'catalogo_fresas': [
      { alias: 'tipo_fresa', table: 'catalogo_tipos_fresas', expectedCol: 'tipo_fresa_id' },
    ],
    'catalogo_complementares': [
      { alias: 'tipo_complementar', table: 'catalogo_tipos_complementares', expectedCol: 'tipo_complementar_id' },
    ],
    'catalogo_opcionais': [
      { alias: 'tipo_opcional', table: 'catalogo_tipos_opcionais', expectedCol: 'tipo_opcional_id' },
    ],
    'catalogo_kits': [
      { alias: 'tipo_kit', table: 'catalogo_tipos_kits', expectedCol: 'tipo_kit_id' },
    ],
    'catalogo_cps_etapas_workflows': [
      { alias: 'tipo_workflow', table: 'catalogo_cps_tipos_workflows', expectedCol: 'tipo_workflow_id' },
    ],
  };

  // Buscar todas as FKs existentes
  const allFks = await q(`
    SELECT 
      tc.table_name AS from_table,
      kcu.column_name AS from_col,
      ccu.table_name AS to_table,
      ccu.column_name AS to_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `);

  // Indexar FKs por tabela
  const fkMap = {};
  if (Array.isArray(allFks)) {
    for (const fk of allFks) {
      if (!fkMap[fk.from_table]) fkMap[fk.from_table] = [];
      fkMap[fk.from_table].push({ col: fk.from_col, toTable: fk.to_table, toCol: fk.to_col });
    }
  }

  // Verificar cada FK esperada
  const missingFks = [];
  const existingFks = [];
  const ambiguousFks = [];

  for (const [sourceTable, fks] of Object.entries(expectedFks)) {
    console.log(`--- ${sourceTable} ---`);
    const sourceFks = fkMap[sourceTable] || [];

    for (const expected of fks) {
      // Procurar FK que aponta para a tabela esperada
      const match = sourceFks.filter(fk => fk.toTable === expected.table);

      if (match.length === 0) {
        console.log(`   ❌ ${expected.alias}: ${expected.expectedCol} → ${expected.table} — FK FALTANDO!`);
        missingFks.push({ from: sourceTable, col: expected.expectedCol, to: expected.table });
      } else if (match.length === 1) {
        console.log(`   ✓ ${expected.alias}: ${match[0].col} → ${match[0].toTable}.${match[0].toCol}`);
        existingFks.push({ from: sourceTable, col: match[0].col, to: match[0].toTable });
      } else {
        console.log(`   ⚠️  ${expected.alias}: MÚLTIPLAS FKs para ${expected.table}:`);
        for (const m of match) console.log(`      ${m.col} → ${m.toTable}.${m.toCol}`);
        ambiguousFks.push({ from: sourceTable, matches: match });
      }
    }
    console.log();
  }

  // Resumo
  console.log('=== RESUMO ===');
  console.log(`FKs existentes: ${existingFks.length}`);
  console.log(`FKs faltando: ${missingFks.length}`);
  console.log(`FKs ambíguas: ${ambiguousFks.length}`);

  if (missingFks.length > 0) {
    console.log('\n=== FKs FALTANTES (precisam ser criadas) ===');
    for (const fk of missingFks) {
      console.log(`   ALTER TABLE ${fk.from} ADD CONSTRAINT fk_${fk.from}_${fk.col} FOREIGN KEY (${fk.col}) REFERENCES ${fk.to}(id);`);
    }

    // Gerar SQL da migration
    console.log('\n=== SQL DA MIGRATION ===');
    let sql = '-- Migration: Adicionar FKs faltantes para resource embedding\n\n';
    for (const fk of missingFks) {
      sql += `ALTER TABLE public.${fk.from}\n`;
      sql += `  ADD CONSTRAINT fk_${fk.from}_${fk.col}\n`;
      sql += `  FOREIGN KEY (${fk.col})\n`;
      sql += `  REFERENCES public.${fk.to}(id)\n`;
      sql += `  ON DELETE SET NULL;\n\n`;
    }
    console.log(sql);
  }
}

main().catch(console.error);
