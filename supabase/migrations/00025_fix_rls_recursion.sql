-- ============================================================
-- 00025_fix_rls_recursion.sql
-- Fix recursão infinita nas funções auxiliares de RLS
-- As funções consultam public.profiles, e a policy de SELECT
-- em profiles chama essas funções → ciclo infinito.
-- Solução: SECURITY DEFINER bypassa RLS nessas funções.
-- ============================================================

create or replace function public.is_super_admin_session()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  );
$$;

create or replace function public.is_admin_or_super()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and (role = 'admin' or is_super_admin = true)
  );
$$;

create or replace function public.get_current_empresa_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select empresa_id from public.profiles where id = auth.uid();
$$;
