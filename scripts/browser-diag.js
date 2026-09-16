/**
 * Script de diagnóstico para rodar no CONSOLE do browser (F12)
 * Estar logado como Heverton no ERP antes de rodar
 * 
 * Copie e cole no console do browser:
 */

(async () => {
  console.log('=== DIAGNÓSTICO RLS - BROWSER CONSOLE ===\n');

  // 1. Verificar se há sessão ativa
  const storedKey = Object.keys(localStorage).find(k => k.includes('supabase') && k.includes('auth'));
  if (!storedKey) {
    console.error('❌ Nenhuma sessão Supabase encontrada no localStorage');
    console.log('   Verifique se está logado no ERP');
    return;
  }
  console.log('✅ Sessão encontrada no localStorage');

  // 2. Importar supabase client
  const { createClient } = await import('/node_modules/.vite/deps/@supabase_supabase-js.js');
  
  // Pegar URL e key do .env (vai funcionar apenas se estiver rodando dev)
  const url = import.meta?.env?.VITE_SUPABASE_URL || 'https://cluuqzhizeqvkgvfdisx.supabase.co';
  const key = import.meta?.env?.VITE_SUPABASE_ANON_KEY;
  
  if (!key) {
    console.error('❌ Não foi possível obter VITE_SUPABASE_ANON_KEY');
    console.log('   Tente o diagnóstico manual abaixo');
    return;
  }
  
  const supabase = createClient(url, key);

  // 3. Verificar sessão atual
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) {
    console.error('❌ Erro ao obter sessão:', sessionErr.message);
    return;
  }
  if (!session) {
    console.error('❌ Nenhuma sessão ativa. Faça login novamente.');
    return;
  }
  console.log('✅ Sessão ativa. User ID:', session.user.id);
  console.log('   Email:', session.user.email);

  // 4. Testar get_current_empresa_id() via RPC
  console.log('\n--- Teste RPC: get_current_empresa_id ---');
  const { data: empId, error: empErr } = await supabase.rpc('get_current_empresa_id');
  if (empErr) {
    console.error('❌ Erro RPC:', empErr.message);
  } else {
    console.log('   empresa_id:', empId);
    if (!empId) {
      console.error('   ⚠️ empresa_id é NULL! Verifique se o profile tem empresa_id.');
    } else {
      console.log('   ✅ empresa_id retornou valor válido');
    }
  }

  // 5. Testar is_super_admin_session() via RPC
  console.log('\n--- Teste RPC: is_super_admin_session ---');
  const { data: isSuper, error: superErr } = await supabase.rpc('is_super_admin_session');
  if (superErr) {
    console.error('❌ Erro RPC:', superErr.message);
  } else {
    console.log('   is_super_admin:', isSuper);
  }

  // 6. Testar query direta na tabela
  console.log('\n--- Teste Query: catalogo_implantes ---');
  const { data: implantes, error: implErr, count } = await supabase
    .from('catalogo_implantes')
    .select('sku, nome, empresa_id', { count: 'exact' })
    .limit(10);
  
  if (implErr) {
    console.error('❌ Erro na query:', implErr.message);
    console.error('   Código:', implErr.code);
    console.error('   Detalhes:', implErr.details);
    console.error('   Hint:', implErr.hint);
  } else {
    console.log(`   ✅ ${count ?? implantes?.length ?? 0} implantes encontrados`);
    if (implantes?.length > 0) {
      console.log('   Primeiros:', implantes.slice(0, 3));
    } else {
      console.warn('   ⚠️ Query retornou vazia. Possíveis causas:');
      console.warn('   1. empresa_id do profile não bate com os dados');
      console.warn('   2. PostgREST não recarregou o schema cache');
    }
  }

  // 7. Testar categorias (hierarquia)
  console.log('\n--- Teste Query: catalogo_categorias ---');
  const { data: cats, error: catsErr } = await supabase
    .from('catalogo_categorias')
    .select('id, nome, empresa_id')
    .limit(5);
  
  if (catsErr) {
    console.error('❌ Erro:', catsErr.message);
  } else {
    console.log(`   ✅ ${cats?.length ?? 0} categorias encontradas`);
    if (cats?.length > 0) console.log('   ', cats);
  }

  // 8. Testar profile
  console.log('\n--- Teste Query: profiles ---');
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('id, email, empresa_id, is_super_admin, role')
    .eq('id', session.user.id)
    .single();
  
  if (profErr) {
    console.error('❌ Erro:', profErr.message);
  } else {
    console.log('   Profile:', profile);
  }

  // 9. Diagnóstico via RPC (função criada)
  console.log('\n--- Teste RPC: diagnostico_rls ---');
  const { data: diag, error: diagErr } = await supabase.rpc('diagnostico_rls');
  if (diagErr) {
    console.error('   Função não existe ou erro:', diagErr.message);
  } else {
    console.log('   Resultado:', diag);
  }

  console.log('\n=== FIM DO DIAGNÓSTICO ===');
  console.log('\nSe todas as queries retornaram vazio mas a função RPC funciona:');
  console.log('→ O problema é o PostgREST cache. Vá em:');
  console.log('  Supabase Dashboard → Settings → API → Reload Schema');
})();
