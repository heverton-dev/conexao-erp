-- Atualiza a função is_admin_or_super para incluir a role 'editor'
create or replace function public.is_admin_or_super()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role in ('admin', 'editor') or is_super_admin = true)
  );
$$;

-- Altera as políticas de credenciais para garantir que apenas admins reais e super admins possam acessá-las
drop policy if exists "admin ve credenciais" on public.credenciais;
drop policy if exists "admin gerencia credenciais" on public.credenciais;

create policy "admin ve credenciais"
  on public.credenciais for select to authenticated
  using (exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role = 'admin' or is_super_admin = true)
  ));

create policy "admin gerencia credenciais"
  on public.credenciais for all to authenticated
  using (exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role = 'admin' or is_super_admin = true)
  ));
