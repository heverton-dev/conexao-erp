-- ============================================================
-- 00054_lab_test_tokens.sql
-- RPCs para o Laboratório de Testes (gerenciar tokens de teste reais)
-- ============================================================

-- 1. RPC: gerar_token_teste_lab
-- Cria um cadastro real com token para testes no pré-cadastro
create or replace function public.gerar_token_teste_lab(
  p_descricao text,
  p_tipo_pessoa text default 'PF',
  p_empresa_id uuid default null
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
  v_cadastro_id uuid;
  v_link_expiracao timestamptz;
  v_empresa_id uuid;
  v_user_id uuid;
begin
  v_token := replace(gen_random_uuid()::text, '-', '');
  v_link_expiracao := now() + interval '7 days';
  v_user_id := auth.uid();

  -- Usa empresa_id fornecido ou busca o primeiro disponível
  v_empresa_id := coalesce(
    p_empresa_id,
    (select id from public.empresas limit 1)
  );

  insert into public.cadastros (
    token_acesso,
    status,
    tipo_pessoa,
    lead_nome,
    created_by,
    empresa_id,
    link_expiracao,
    data_criacao_link,
    is_demo,
    observacoes,
    status_verificacao_token,
    inicio_preenchimento
  ) values (
    v_token,
    'link_gerado',
    p_tipo_pessoa,
    p_descricao,
    v_user_id,
    v_empresa_id,
    v_link_expiracao,
    now(),
    true,
    'Token gerado pelo Laboratório de Testes',
    true,
    now()
  )
  returning id into v_cadastro_id;

  return json_build_object(
    'id', v_cadastro_id,
    'token', v_token,
    'url', format('/pre-cadastro/%s', v_token),
    'expiracao', v_link_expiracao
  );
end;
$$;

-- 2. RPC: validar_token_teste_lab
-- Retorna status detalhado de um token no banco
create or replace function public.validar_token_teste_lab(
  p_token text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result json;
begin
  select json_build_object(
    'existe', true,
    'status', c.status,
    'tipo_pessoa', c.tipo_pessoa,
    'lead_nome', c.lead_nome,
    'link_acessado', c.link_acessado,
    'inicio_preenchimento', c.inicio_preenchimento,
    'data_finalizacao', c.data_finalizacao,
    'expirado', (c.link_expiracao < now()),
    'criado_em', c.created_at
  ) into v_result
  from public.cadastros c
  where c.token_acesso = p_token;

  if v_result is null then
    return json_build_object('existe', false);
  end if;

  return v_result;
end;
$$;

-- 3. RPC: deletar_token_teste_lab
-- Remove um token de teste e seus dados relacionados
create or replace function public.deletar_token_teste_lab(
  p_token text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cadastro_id uuid;
begin
  select id into v_cadastro_id
  from public.cadastros
  where token_acesso = p_token;

  if v_cadastro_id is null then
    return json_build_object('deletado', false, 'erro', 'Token nao encontrado');
  end if;

  delete from public.cadastros_enderecos where cadastro_id = v_cadastro_id;
  delete from public.cadastros_pf where cadastro_id = v_cadastro_id;
  delete from public.cadastros_pj where cadastro_id = v_cadastro_id;
  delete from public.documentos where cadastro_id = v_cadastro_id;
  delete from public.cadastros where id = v_cadastro_id;

  return json_build_object('deletado', true, 'id', v_cadastro_id);
end;
$$;

-- 4. RPC: listar_tokens_teste_lab
-- Lista todos os tokens de teste com status
create or replace function public.listar_tokens_teste_lab()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result json;
begin
  select json_agg(
    json_build_object(
      'id', c.id,
      'token', c.token_acesso,
      'lead_nome', c.lead_nome,
      'tipo_pessoa', c.tipo_pessoa,
      'status', c.status,
      'link_acessado', c.link_acessado,
      'criado_em', c.created_at,
      'expirado', (c.link_expiracao < now())
    ) order by c.created_at desc
  ) into v_result
  from public.cadastros c
  where c.is_demo = true;

  return coalesce(v_result, '[]'::json);
end;
$$;

-- 6. RPC: pular_verificacao_teste_lab
-- Pula a verificação 2FA de um token de teste (define status_verificacao_token = true)
-- Permite testar o fluxo de preenchimento sem precisar de PIN
create or replace function public.pular_verificacao_teste_lab(
  p_token text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cadastro_id uuid;
begin
  select id into v_cadastro_id
  from public.cadastros
  where token_acesso = p_token;

  if v_cadastro_id is null then
    return json_build_object('sucesso', false, 'erro', 'Token nao encontrado');
  end if;

  update public.cadastros set
    status_verificacao_token = true,
    inicio_preenchimento = now()
  where id = v_cadastro_id;

  return json_build_object(
    'sucesso', true,
    'id', v_cadastro_id,
    'mensagem', 'Verificacao 2FA pulada. Acesse o pre-cadastro diretamente.'
  );
end;
$$;

-- 7. RPC: gerar_pin_teste_lab
-- Gera um PIN de 2FA para teste e RETORNA o PIN (ao invés de enviar por webhook)
-- Útil para simular o fluxo completo de 2FA no laboratório
create or replace function public.gerar_pin_teste_lab(
  p_token text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cadastro_id uuid;
  v_pin text;
begin
  select id into v_cadastro_id
  from public.cadastros
  where token_acesso = p_token;

  if v_cadastro_id is null then
    return json_build_object('sucesso', false, 'erro', 'Token nao encontrado');
  end if;

  v_pin := lpad(floor(random() * 999999)::int::text, 6, '0');

  update public.cadastros set
    "2fa_canal" = 'email',
    "2fa_contato" = 'teste@laboratorio.conexao',
    "2fa_token" = v_pin,
    "2fa_expiracao" = now() + interval '5 minutes'
  where id = v_cadastro_id;

  return json_build_object(
    'sucesso', true,
    'pin', v_pin,
    'id', v_cadastro_id,
    'expiracao', now() + interval '5 minutes',
    'mensagem', format('PIN %s gerado. Use-o para completar a verificacao 2FA.', v_pin)
  );
end;
$$;

-- 5. RPC: limpar_tokens_teste_lab
-- Remove todos os tokens de teste (qualquer super admin pode limpar)
create or replace function public.limpar_tokens_teste_lab()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  delete from public.cadastros_enderecos
  where cadastro_id in (select id from public.cadastros where is_demo = true);
  delete from public.cadastros_pf
  where cadastro_id in (select id from public.cadastros where is_demo = true);
  delete from public.cadastros_pj
  where cadastro_id in (select id from public.cadastros where is_demo = true);
  delete from public.documentos
  where cadastro_id in (select id from public.cadastros where is_demo = true);
  with deletados as (
    delete from public.cadastros where is_demo = true returning id
  )
  select count(*) into v_count from deletados;

  return json_build_object('deletados', v_count);
end;
$$;
