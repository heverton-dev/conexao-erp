-- ============================================================
-- 00022_fix_api_connectors_rls.sql
-- Corrige RLS de api_connectors e torna RPC security definer
-- ============================================================

-- 1. Garante que todos autenticados possam LER api_connectors
--    (necessario para o orquestrador disparar eventos em nome de qualquer usuario)
drop policy if exists "Autenticados podem ver api_connectors" on public.api_connectors;
create policy "Autenticados podem ver api_connectors"
  on public.api_connectors for select to authenticated
  using (true);

-- 2. Remove conectores obsoletos com evento=null (duplicatas da tabela webhooks)
delete from public.api_connectors where evento is null and type = 'webhook';

-- 3. Recreate RPC com SECURITY DEFINER para bypassar RLS ao executar conectores
create or replace function public.executar_api_connector_server(
  p_connector_id uuid,
  p_variables jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  conn record;
  url_final text;
  headers_final jsonb;
  body_final text;
  chave text;
  valor text;
  request_id bigint;
begin
  select * into conn from public.api_connectors where id = p_connector_id;
  if not found then
    return jsonb_build_object('error', 'Conector não encontrado', 'status', 404);
  end if;

  url_final := conn.url;
  for chave, valor in select key, value from jsonb_each_text(p_variables)
  loop
    url_final := replace(url_final, '{{' || chave || '}}', coalesce(valor, ''));
  end loop;

  headers_final := jsonb_build_object('Content-Type', 'application/json');
  if conn.headers is not null then
    for chave, valor in select key, value from jsonb_each_text(conn.headers)
    loop
      declare
        chave_interpolado text := chave;
        valor_interpolado text := valor;
        k2 text; v2 text;
      begin
        for k2, v2 in select key, value from jsonb_each_text(p_variables)
        loop
          chave_interpolado := replace(chave_interpolado, '{{' || k2 || '}}', coalesce(v2, ''));
          valor_interpolado := replace(valor_interpolado, '{{' || k2 || '}}', coalesce(v2, ''));
        end loop;
        headers_final := headers_final || jsonb_build_object(chave_interpolado, valor_interpolado);
      end;
    end loop;
  end if;

  body_final := conn.body_template;
  if body_final is not null then
    for chave, valor in select key, value from jsonb_each_text(p_variables)
    loop
      body_final := replace(body_final, '{{' || chave || '}}', coalesce(valor, ''));
    end loop;
  end if;

  if upper(conn.method) = 'GET' then
    select net.http_get(
      url := url_final,
      headers := headers_final
    ) into request_id;
  else
    select net.http_post(
      url := url_final,
      body := coalesce(body_final, '{}'),
      headers := headers_final
    ) into request_id;
  end if;

  return jsonb_build_object(
    'status', 200,
    'request_id', request_id,
    'url', url_final,
    'message', 'Requisição enviada via servidor (pg_net)'
  );
exception when others then
  return jsonb_build_object('error', sqlerrm, 'status', 500);
end;
$$;
