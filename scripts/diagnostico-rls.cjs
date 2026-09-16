/**
 * Diagnóstico RLS via Management API
 * Roda queries como postgres (service_role) para mapear o estado do banco
 */

const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';

function query(sql) {
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
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== DIAGNÓSTICO RLS - CATÁLOGO ===\n');

  // 1. Verificar definição das funções helper
  console.log('--- 1. FUNÇÕES HELPER ---');
  const funcoes = await query(`
    SELECT 
      p.proname,
      pg_get_functiondef(p.oid) AS definicao
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('get_current_empresa_id', 'is_super_admin_session', 'is_admin_or_super')
    ORDER BY p.proname;
  `);
  if (Array.isArray(funcoes)) {
    for (const f of funcoes) {
      const hasSearchPath = f.definicao.includes('search_path');
      console.log(`  ${f.proname}: ${hasSearchPath ? '✅ COM search_path' : '❌ SEM search_path'}`);
      console.log(`    ${f.definicao.substring(0, 200)}...\n`);
    }
  } else {
    console.log('  Erro:', funcoes);
  }

  // 2. Listar empresas
  console.log('--- 2. EMPRESAS ---');
  const empresas = await query(`SELECT id, nome, slug, ativo FROM empresas ORDER BY nome;`);
  if (Array.isArray(empresas)) {
    for (const e of empresas) {
      console.log(`  ${e.id} | ${e.nome} | slug: ${e.slug} | ativo: ${e.ativo}`);
    }
  } else {
    console.log('  Erro:', empresas);
  }

  // 3. Listar profiles (todos)
  console.log('\n--- 3. PROFILES ---');
  const profiles = await query(`
    SELECT id, email, nome, role, empresa_id, is_super_admin, ativo 
    FROM profiles 
    ORDER BY created_at;
  `);
  if (Array.isArray(profiles)) {
    for (const p of profiles) {
      console.log(`  ${p.id} | ${p.email} | ${p.nome} | role: ${p.role} | empresa: ${p.empresa_id} | super: ${p.is_super_admin} | ativo: ${p.ativo}`);
    }
  } else {
    console.log('  Erro:', profiles);
  }

  // 4. Verificar seed de implantes
  console.log('\n--- 4. IMPLANTES (seed) ---');
  const implantes = await query(`
    SELECT empresa_id, COUNT(*) AS total 
    FROM catalogo_implantes 
    GROUP BY empresa_id;
  `);
  if (Array.isArray(implantes)) {
    for (const i of implantes) {
      console.log(`  empresa: ${i.empresa_id} | total: ${i.total}`);
    }
  } else {
    console.log('  Erro:', implantes);
  }

  // 5. Verificar seed de abutments
  console.log('\n--- 5. ABUTMENTS (seed) ---');
  const abutments = await query(`
    SELECT empresa_id, COUNT(*) AS total 
    FROM catalogo_abutments 
    GROUP BY empresa_id;
  `);
  if (Array.isArray(abutments)) {
    for (const a of abutments) {
      console.log(`  empresa: ${a.empresa_id} | total: ${a.total}`);
    }
  } else {
    console.log('  Erro:', abutments);
  }

  // 6. Verificar seed de kits
  console.log('\n--- 6. KITS (seed) ---');
  const kits = await query(`
    SELECT empresa_id, COUNT(*) AS total 
    FROM catalogo_kits 
    GROUP BY empresa_id;
  `);
  if (Array.isArray(kits)) {
    for (const k of kits) {
      console.log(`  empresa: ${k.empresa_id} | total: ${k.total}`);
    }
  } else {
    console.log('  Erro:', kits);
  }

  // 7. Verificar policies em catalogo_implantes (tabela-chave)
  console.log('\n--- 7. POLICIES: catalogo_implantes ---');
  const policies = await query(`
    SELECT policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'catalogo_implantes'
    ORDER BY cmd;
  `);
  if (Array.isArray(policies)) {
    for (const p of policies) {
      console.log(`  ${p.policyname} | ${p.cmd} | roles: ${p.roles}`);
      console.log(`    USING: ${p.qual}`);
      console.log(`    CHECK: ${p.with_check}\n`);
    }
  } else {
    console.log('  Erro:', policies);
  }

  // 8. Verificar RLS habilitado
  console.log('--- 8. RLS STATUS (catalogo_implantes) ---');
  const rls = await query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'catalogo_implantes';
  `);
  if (Array.isArray(rls) && rls.length > 0) {
    console.log(`  RLS habilitado: ${rls[0].rowsecurity ? '✅ SIM' : '❌ NÃO'}`);
  }

  // 9. Criar função de diagnóstico que o frontend pode chamar
  console.log('\n--- 9. CRIANDO FUNÇÃO DE DIAGNÓSTICO ---');
  const createDiag = await query(`
    CREATE OR REPLACE FUNCTION public.diagnostico_rls()
    RETURNS TABLE (
      user_id UUID,
      empresa_id UUID,
      is_super BOOLEAN,
      empresa_nome TEXT,
      implantes_count BIGINT,
      abutments_count BIGINT,
      kits_count BIGINT
    )
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
      SELECT 
        auth.uid(),
        p.empresa_id,
        COALESCE(p.is_super_admin, false),
        (SELECT nome FROM public.empresas WHERE id = p.empresa_id),
        (SELECT COUNT(*) FROM public.catalogo_implantes ci WHERE ci.empresa_id = p.empresa_id),
        (SELECT COUNT(*) FROM public.catalogo_abutments ca WHERE ca.empresa_id = p.empresa_id),
        (SELECT COUNT(*) FROM public.catalogo_kits ck WHERE ck.empresa_id = p.empresa_id)
      FROM public.profiles p
      WHERE p.id = auth.uid();
    $$;
  `);
  console.log(`  Resultado: ${JSON.stringify(createDiag)}`);
  console.log('  → Chame SELECT * FROM diagnostico_rls() no frontend para testar\n');

  // 10. Testar a função como postgres (auth.uid() será NULL)
  console.log('--- 10. TESTE FUNÇÃO (como postgres, auth.uid() = NULL) ---');
  const testDiag = await query(`SELECT * FROM diagnostico_rls();`);
  console.log(`  Resultado: ${JSON.stringify(testDiag)}`);
  console.log('  (Esperado vazio, pois postgres não tem auth.uid())\n');

  console.log('=== FIM DO DIAGNÓSTICO ===');
}

main().catch(console.error);
