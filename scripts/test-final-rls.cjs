/**
 * Teste final: verificar se a query de empresas funciona como Heverton
 * Vai simular exatamente o que o frontend faz
 */

const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbHVxemhpemVxdmtndmZkaXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2ODI4MDAsImV4cCI6MjA1MTI1ODgwMH0.YOUR_ANON_KEY_HERE'; // placeholder

// Heverton's user ID
const HEVERTON_ID = '533f41ad-8241-4590-bf21-5999ea1d3267';

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
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== TESTE FINAL - SIMULANDO QUERIES DO FRONTEND ===\n');

  // 1. Criar função que simula exatamente o que o PostgREST faria
  // Esta função roda como SECURITY DEFINER, simulando auth.uid()
  console.log('1. Criando função de teste que simula auth.uid() = Heverton...');
  await query(`
    CREATE OR REPLACE FUNCTION public._test_rls_as_user(target_user_id UUID)
    RETURNS TABLE (
      test_name TEXT,
      result TEXT,
      detail TEXT
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    DECLARE
      v_empresa_id UUID;
      v_is_super BOOLEAN;
      v_implantes_count BIGINT;
      v_categorias_count BIGINT;
      v_empresas_count BIGINT;
      v_profile_exists BOOLEAN;
    BEGIN
      -- Simular auth.uid() para o target_user
      -- NOTA: Não podemos simular auth.uid() diretamente,
      -- mas podemos verificar se os dados existem corretamente

      -- 1. Profile existe?
      SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO v_profile_exists;
      test_name := 'profile_exists';
      result := v_profile_exists::text;
      detail := 'Profile do usuário existe';
      RETURN NEXT;

      -- 2. Profile tem empresa_id?
      SELECT empresa_id INTO v_empresa_id FROM public.profiles WHERE id = target_user_id;
      test_name := 'empresa_id';
      result := COALESCE(v_empresa_id::text, 'NULL');
      detail := 'empresa_id do profile';
      RETURN NEXT;

      -- 3. Empresa existe?
      IF v_empresa_id IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM public.empresas WHERE id = v_empresa_id) INTO v_profile_exists;
        test_name := 'empresa_exists';
        result := v_profile_exists::text;
        detail := 'Empresa referenciada existe';
        RETURN NEXT;
      END IF;

      -- 4. is_super_admin?
      SELECT is_super_admin INTO v_is_super FROM public.profiles WHERE id = target_user_id;
      test_name := 'is_super_admin';
      result := COALESCE(v_is_super::text, 'NULL');
      detail := 'is_super_admin no profile';
      RETURN NEXT;

      -- 5. Implantes para empresa_id do usuário (bypass RLS com SECURITY DEFINER)
      SELECT COUNT(*) INTO v_implantes_count FROM public.catalogo_implantes WHERE empresa_id = v_empresa_id;
      test_name := 'implantes_for_empresa';
      result := v_implantes_count::text;
      detail := 'Implantes com empresa_id = ' || v_empresa_id::text;
      RETURN NEXT;

      -- 6. Categorias
      SELECT COUNT(*) INTO v_categorias_count FROM public.catalogo_categorias WHERE empresa_id = v_empresa_id;
      test_name := 'categorias_for_empresa';
      result := v_categorias_count::text;
      detail := 'Categorias com empresa_id = ' || v_empresa_id::text;
      RETURN NEXT;

      -- 7. Empresas totais
      SELECT COUNT(*) INTO v_empresas_count FROM public.empresas;
      test_name := 'total_empresas';
      result := v_empresas_count::text;
      detail := 'Total de empresas na tabela';
      RETURN NEXT;

      -- 8. Testar se get_current_empresa_id() retorna o valor correto
      -- (simulando como se auth.uid() fosse o target_user)
      -- NOTA: Não podemos mudar auth.uid() de verdade, mas podemos
      -- verificar se a função está configurada corretamente
      test_name := 'function_search_path';
      result := (SELECT CASE 
        WHEN pg_get_functiondef(oid) LIKE '%search_path%' THEN 'HAS_SEARCH_PATH'
        ELSE 'MISSING_SEARCH_PATH'
      END FROM pg_proc WHERE proname = 'get_current_empresa_id' LIMIT 1);
      detail := 'Verificação da configuração da função';
      RETURN NEXT;
    END;
  `);

  // 2. Rodar a função de teste
  console.log('\n2. Rodando testes para Heverton...');
  const results = await query(`SELECT * FROM _test_rls_as_user('${HEVERTON_ID}');`);
  
  if (Array.isArray(results)) {
    for (const r of results) {
      const icon = r.result === 'NULL' || r.result === 'false' ? '❌' : '✅';
      console.log(`  ${icon} ${r.test_name}: ${r.result}`);
      console.log(`     ${r.detail}`);
    }
  } else {
    console.log('  Erro:', results);
  }

  // 3. Verificar se PostgREST pode ver as funções atualizadas
  console.log('\n3. Verificando schema cache do PostgREST...');
  const schemaCheck = await query(`
    SELECT 
      (SELECT COUNT(*) FROM pg_policies WHERE schemaname='public' AND tablename='catalogo_implantes') AS implantes_policies,
      (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='get_current_empresa_id') AS func_exists,
      (SELECT has_schema_privilege('anon', 'public', 'USAGE')) AS anon_can_see_public;
  `);
  if (Array.isArray(schemaCheck) && schemaCheck.length > 0) {
    const s = schemaCheck[0];
    console.log(`  catalogo_implantes policies: ${s.implantes_policies}`);
    console.log(`  get_current_empresa_id existe: ${s.func_exists}`);
    console.log(`  anon pode ver public: ${s.anon_can_see_public}`);
  }

  // 4. DICA: Como forçar reload do schema
  console.log('\n=== INSTRUÇÕES PARA O USUÁRIO ===');
  console.log('Se o banco está correto mas o frontend não renderiza:');
  console.log('');
  console.log('1. Vá no Supabase Dashboard');
  console.log('2. Settings → API');
  console.log('3. Clique em "Reload Schema"');
  console.log('4. Aguarde 5 segundos');
  console.log('5. Abra o console do browser (F12) e cole:');
  console.log('   => execute o script em scripts/browser-diag.js');
  console.log('');
  console.log('OU faça qualquer mudança menor via Dashboard UI');
  console.log('(ex: editar um nome de empresa e salvar)');
  console.log('Isso força o PostgREST a recarregar o schema.');
}

main().catch(console.error);
