-- ============================================================
-- 00010_permissoes.sql
-- Permissões Granulares + ambiente "suporte"
-- ============================================================

-- 1. Adicionar "suporte" aos checks de ambiente
do $$ begin
  alter table public.profiles drop constraint if exists profiles_ambiente_check;
exception when others then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_ambiente_check
    check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'ambos', 'suporte'));
exception when others then null;
end $$;

do $$ begin
  alter table public.mock_credentials drop constraint if exists mock_credentials_ambiente_check;
exception when others then null;
end $$;

do $$ begin
  alter table public.mock_credentials add constraint mock_credentials_ambiente_check
    check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'ambos', 'suporte'));
exception when others then null;
end $$;

-- 2. Tabela permissoes
create table if not exists public.permissoes (
  usuario_id uuid primary key references public.profiles(id) on delete cascade,
  permissoes jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

alter table public.permissoes enable row level security;

-- 3. Função de defaults por ambiente
create or replace function public.get_permissoes_padrao(amb text)
returns jsonb
language plpgsql
immutable
as $$
begin
  return case amb
    when 'consultor' then jsonb_build_object(
      'ver_todos_cadastros', false,
      'aprovar_cadastro', false,
      'reprovar_cadastro', false,
      'solicitar_correcao_cadastro', false,
      'aprovar_documento', false,
      'reprovar_documento', false,
      'solicitar_correcao_documento', false,
      'aprovar_campo', false,
      'reprovar_campo', false,
      'solicitar_correcao_campo', false,
      'visualizar_documento', false,
      'excluir_cadastro', false,
      'gerenciar_credenciais', false,
      'gerenciar_credenciais_admin', false,
      'gerenciar_config', false,
      'gerar_links', true,
      'ver_relatorios', true
    )
    when 'cadastro' then jsonb_build_object(
      'ver_todos_cadastros', true,
      'aprovar_cadastro', true,
      'reprovar_cadastro', true,
      'solicitar_correcao_cadastro', true,
      'aprovar_documento', true,
      'reprovar_documento', true,
      'solicitar_correcao_documento', true,
      'aprovar_campo', true,
      'reprovar_campo', true,
      'solicitar_correcao_campo', true,
      'visualizar_documento', true,
      'excluir_cadastro', false,
      'gerenciar_credenciais', false,
      'gerenciar_credenciais_admin', false,
      'gerenciar_config', false,
      'gerar_links', false,
      'ver_relatorios', true
    )
    when 'tecnologia' then jsonb_build_object(
      'ver_todos_cadastros', false,
      'aprovar_cadastro', false,
      'reprovar_cadastro', false,
      'solicitar_correcao_cadastro', false,
      'aprovar_documento', false,
      'reprovar_documento', false,
      'solicitar_correcao_documento', false,
      'aprovar_campo', false,
      'reprovar_campo', false,
      'solicitar_correcao_campo', false,
      'visualizar_documento', false,
      'excluir_cadastro', false,
      'gerenciar_credenciais', true,
      'gerenciar_credenciais_admin', true,
      'gerenciar_config', false,
      'gerar_links', false,
      'ver_relatorios', false
    )
    when 'suporte' then jsonb_build_object(
      'ver_todos_cadastros', false,
      'aprovar_cadastro', false,
      'reprovar_cadastro', false,
      'solicitar_correcao_cadastro', false,
      'aprovar_documento', false,
      'reprovar_documento', false,
      'solicitar_correcao_documento', false,
      'aprovar_campo', false,
      'reprovar_campo', false,
      'solicitar_correcao_campo', false,
      'visualizar_documento', false,
      'excluir_cadastro', false,
      'gerenciar_credenciais', true,
      'gerenciar_credenciais_admin', false,
      'gerenciar_config', false,
      'gerar_links', false,
      'ver_relatorios', false
    )
    -- ambos e qualquer outro = full (exceto super admin powers)
    else jsonb_build_object(
      'ver_todos_cadastros', true,
      'aprovar_cadastro', true,
      'reprovar_cadastro', true,
      'solicitar_correcao_cadastro', true,
      'aprovar_documento', true,
      'reprovar_documento', true,
      'solicitar_correcao_documento', true,
      'aprovar_campo', true,
      'reprovar_campo', true,
      'solicitar_correcao_campo', true,
      'visualizar_documento', true,
      'excluir_cadastro', false,
      'gerenciar_credenciais', true,
      'gerenciar_credenciais_admin', true,
      'gerenciar_config', false,
      'gerar_links', true,
      'ver_relatorios', true
    )
  end;
end;
$$;

-- 4. Trigger: insere permissoes padrão ao criar profile
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
    public.get_permissoes_padrao(coalesce(new.ambiente, 'ambos')),
    new.id
  )
  on conflict (usuario_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_profile_created_permissoes
  after insert on public.profiles
  for each row
  execute function public.handle_new_profile_permissoes();

-- 5. Seed: permissoes para todos perfis existentes
insert into public.permissoes (usuario_id, permissoes, updated_by)
select
  p.id,
  public.get_permissoes_padrao(coalesce(p.ambiente, 'ambos')),
  p.id
from public.profiles p
on conflict (usuario_id) do nothing;

-- 6. RLS: super admin full, usuário lê própria
create policy "Super admin pode tudo permissoes"
  on public.permissoes for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Usuário vê própria permissão"
  on public.permissoes for select to authenticated
  using (auth.uid() = usuario_id);
