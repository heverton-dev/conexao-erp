-- ============================================================
-- 00015_2fa_rpcs.sql
-- RPCs seguras para geração e validação de 2FA PIN
-- do pré-cadastro público.
-- ============================================================

create or replace function public.gerar_2fa_pin(
  token_text text,
  canal_text text,
  contato_text text,
  pin_text text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cad_id uuid;
begin
  select id into cad_id from public.cadastros where token_acesso = token_text;
  if cad_id is null then raise exception 'Token invalido'; end if;

  update public.cadastros set
    "2fa_canal" = canal_text,
    "2fa_contato" = contato_text,
    "2fa_token" = pin_text,
    "2fa_expiracao" = now() + interval '5 minutes'
  where id = cad_id;
end;
$$;

create or replace function public.validar_2fa_pin(
  token_text text,
  pin_text text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cad_id uuid;
  db_pin text;
  db_exp timestamptz;
begin
  select id, "2fa_token", "2fa_expiracao"
  into cad_id, db_pin, db_exp
  from public.cadastros
  where token_acesso = token_text;

  if cad_id is null then raise exception 'Token invalido'; end if;
  if db_exp < now() then return false; end if;

  if db_pin = pin_text then
    update public.cadastros set
      status_verificacao_token = true,
      inicio_preenchimento = now()
    where id = cad_id;
    return true;
  else
    return false;
  end if;
end;
$$;
