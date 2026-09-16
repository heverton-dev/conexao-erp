-- ============================================================
-- 00011_remove_ambos.sql
-- Remove ambiente "ambos" — apenas super admin usava
-- ============================================================

-- 1. Atualiza profiles check constraint
do $$ begin
  alter table public.profiles drop constraint if exists profiles_ambiente_check;
exception when others then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_ambiente_check
    check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'suporte'));
exception when others then null;
end $$;

-- 2. Atualiza permissoes check constraint
do $$ begin
  alter table public.permissoes drop constraint if exists permissoes_ambiente_check;
exception when others then null;
end $$;

do $$ begin
  alter table public.permissoes add constraint permissoes_ambiente_check
    check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'suporte'));
exception when others then null;
end $$;

-- 3. Atualiza mock_credentials check constraint
do $$ begin
  alter table public.mock_credentials drop constraint if exists mock_credentials_ambiente_check;
exception when others then null;
end $$;

do $$ begin
  alter table public.mock_credentials add constraint mock_credentials_ambiente_check
    check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'suporte'));
exception when others then null;
end $$;

-- 4. Atualiza trigger function: fallback antes era 'ambos', agora é 'cadastro'
create or replace function public.handle_new_profile_permissoes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.permissoes (usuario_id, permissoes, updated_by)
  values (
    new.id,
    public.get_permissoes_padrao(coalesce(new.ambiente, 'cadastro')),
    new.id
  )
  on conflict (usuario_id) do nothing;
  return new;
end;
$$;

-- 5. Atualiza seed (caso rode novamente): fallback 'ambos' → 'cadastro'
-- Não faz mais nada; o on conflict (usuario_id) do nothing já protege.

-- 6. Troca ambiente do super admin (único com 'ambos') para 'cadastro'
update public.profiles
set ambiente = 'cadastro'
where ambiente = 'ambos';

-- 7. Troca ambiente em mock_credentials (se houver)
update public.mock_credentials
set ambiente = 'cadastro'
where ambiente = 'ambos';

-- 8. Troca ambiente em permissoes (se houver)
update public.permissoes
set ambiente = 'cadastro'
where ambiente = 'ambos';
