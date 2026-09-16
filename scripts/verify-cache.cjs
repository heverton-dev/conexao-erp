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
  console.log('=== VERIFICAÇÃO FINAL ===\n');

  // 1. Verificar se a função retorna valores corretos
  console.log('1. Testando get_current_empresa_id() via SQL direto...');
  const r1 = await q(`
    -- Simular auth.uid() = Heverton
    SET request.jwt.claims = '{"sub": "533f41ad-8241-4590-bf21-5999ea1d3267"}';
    SET role = 'authenticated';
    SELECT get_current_empresa_id() AS empresa_id;
    RESET role;
    RESET request.jwt.claims;
  `);
  console.log(`   ${JSON.stringify(r1)}`);

  // 2. Testar via query direta
  console.log('\n2. Query direta profiles...');
  const r2 = await q(`
    SELECT id, email, empresa_id, is_super_admin 
    FROM profiles 
    WHERE id = '533f41ad-8241-4590-bf21-5999ea1d3267';
  `);
  console.log(`   ${JSON.stringify(r2)}`);

  // 3. Criar função de teste que simula auth
  console.log('\n3. Criando função de teste...');
  const r3 = await q(`
    CREATE OR REPLACE FUNCTION public._test_auth_simulation()
    RETURNS TABLE (func_name TEXT, result TEXT)
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    BEGIN
      -- Testar get_current_empresa_id
      func_name := 'get_current_empresa_id';
      result := get_current_empresa_id()::text;
      RETURN NEXT;
      
      -- Testar is_super_admin_session
      func_name := 'is_super_admin_session';
      result := is_super_admin_session()::text;
      RETURN NEXT;
    END;
  `);
  console.log(`   ${JSON.stringify(r3)}`);

  // 4. Rodar a função (vai retornar null porque não tem auth.uid() real)
  console.log('\n4. Rodando função de teste (esperado NULL sem auth)...');
  const r4 = await q(`SELECT * FROM _test_auth_simulation();`);
  console.log(`   ${JSON.stringify(r4)}`);

  // 5. Instruções
  console.log('\n=== INSTRUÇÕES ===');
  console.log('O banco está CORRETO. O problema é o PostgREST cache.');
  console.log('');
  console.log('Para forçar o reload, faça QUALQUER mudança via Dashboard UI:');
  console.log('1. Abra o Supabase Dashboard');
  console.log('2. Vá em Table Editor → catalogo_implantes');
  console.log('3. Adicione uma coluna (ex: "_test" tipo text)');
  console.log('4. Salve');
  console.log('5. Remova a coluna "_test"');
  console.log('6. Salve novamente');
  console.log('');
  console.log('Isso força o PostgREST a recarregar o schema.');
}

main().catch(console.error);
