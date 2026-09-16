-- Função para identificar usuários mock (contas de demonstração)
create or replace function public.is_mock_user(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select email_corporativo ilike '%@conexao.demo'
       from public.usuarios
      where id = _user_id),
    false
  )
$$;

-- Substitui a policy do app_config para bloquear escrita por usuários mock
drop policy if exists "Dev total app_config" on public.app_config;

create policy "Dev real total app_config"
on public.app_config
as permissive
for all
to authenticated
using (
  public.has_role(auth.uid(), 'dev'::public.app_role)
  and not public.is_mock_user(auth.uid())
)
with check (
  public.has_role(auth.uid(), 'dev'::public.app_role)
  and not public.is_mock_user(auth.uid())
);

-- Mantém a leitura pública (já existente) intacta
