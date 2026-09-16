-- ============================================================
-- 00023_multiempresas.sql
-- Multiempresas: empresas, tema, modulos, empresa_id, RLS
-- ============================================================

-- ============================================================
-- 0. HELPER FUNCTIONS
-- ============================================================

create or replace function public.is_super_admin_session()
returns boolean
language sql
stable
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
set search_path = ''
as $$
  select empresa_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- 1. EMPRESAS
-- ============================================================
create table public.empresas (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  slug        text not null unique,
  cnpj        text,
  ativo       boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.empresas enable row level security;

create policy "Super admin pode tudo empresas"
  on public.empresas for all to authenticated
  using (is_super_admin_session())
  with check (is_super_admin_session());

create policy "Autenticados podem ver empresas"
  on public.empresas for select to authenticated
  using (true);

-- ============================================================
-- 2. EMPRESAS_CONFIG
-- ============================================================
create table public.empresas_config (
  empresa_id  uuid primary key references public.empresas(id) on delete cascade,
  logo_url    text,
  theme       jsonb default '{}'::jsonb,
  updated_at  timestamptz default now()
);

alter table public.empresas_config enable row level security;

create policy "Super admin pode tudo empresas_config"
  on public.empresas_config for all to authenticated
  using (is_super_admin_session())
  with check (is_super_admin_session());

create policy "Autenticados podem ver empresas_config"
  on public.empresas_config for select to authenticated
  using (true);

-- ============================================================
-- 3. MODULOS_EMPRESA
-- ============================================================
create table public.modulos_empresa (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  modulo_key  text not null,
  ativo       boolean default true,
  config      jsonb default '{}'::jsonb,
  created_at  timestamptz default now(),
  unique(empresa_id, modulo_key)
);

alter table public.modulos_empresa enable row level security;

create policy "Super admin pode tudo modulos_empresa"
  on public.modulos_empresa for all to authenticated
  using (is_super_admin_session())
  with check (is_super_admin_session());

create policy "Autenticados podem ver modulos_empresa"
  on public.modulos_empresa for select to authenticated
  using (true);

-- ============================================================
-- 4. EMPRESA_ID NAS TABELAS EXISTENTES
-- ============================================================

alter table public.profiles add column empresa_id uuid references public.empresas(id) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nome, role, empresa_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    'viewer',
    (new.raw_user_meta_data ->> 'empresa_id')::uuid
  );
  return new;
end;
$$;

alter table public.cadastros add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.credenciais add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.atividades add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.notificacoes add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.notificacoes_templates add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.webhooks add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.webhook_logs add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.form_schema add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.api_connectors add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.integracoes_config add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.permissoes add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.documentos add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.cadastros_pf add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.cadastros_pj add column empresa_id uuid references public.empresas(id) on delete cascade;
alter table public.cadastros_enderecos add column empresa_id uuid references public.empresas(id) on delete cascade;

create index if not exists idx_cadastros_empresa on public.cadastros(empresa_id);
create index if not exists idx_credenciais_empresa on public.credenciais(empresa_id);
create index if not exists idx_atividades_empresa on public.atividades(empresa_id);
create index if not exists idx_permissoes_empresa on public.permissoes(empresa_id);
create index if not exists idx_documentos_empresa on public.documentos(empresa_id);

-- ============================================================
-- 5. VIEW CLIENTES
-- ============================================================
drop view if exists public.clientes;
create view public.clientes as
select
  c.id, c.codigo_cliente, c.status, c.tipo_pessoa, c.colaborador,
  c.observacoes, c.created_by, c.created_at, c.updated_at,
  c.token_acesso, c.nome_temporario, c.tipo_acao, c.forma_compartilhamento,
  c.link_expiracao, c.data_criacao_link, c.data_finalizacao,
  c.comentario_reprovacao, c.revisado, c.consulta_cnpj_realizada,
  c.consulta_cro_realizada, c.status_verificacao_token, c.lead_email,
  c.lead_whatsapp, c.lead_nome, c.data_consulta, c.revisoes, c.is_demo,
  c.link_acessado, c.inicio_preenchimento, c."2fa_canal", c."2fa_contato",
  c."2fa_token", c."2fa_expiracao", c.dados_extras, c.campos_correcao,
  c.empresa_id,
  pf.*, pj.*, e.*
from public.cadastros c
left join public.cadastros_pf pf on pf.cadastro_id = c.id
left join public.cadastros_pj pj on pj.cadastro_id = c.id
left join public.cadastros_enderecos e on e.cadastro_id = c.id;

-- ============================================================
-- 6. NOVAS RLS POLICIES (multiempresa)
-- ============================================================

create or replace function public.pode_acessar_empresa(p_empresa_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    is_super_admin_session()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and empresa_id = p_empresa_id
    );
$$;

-- Drop ALL existing policies on affected tables to avoid encoding issues
do $$
declare
  affected_tables text[] := array['profiles','cadastros','cadastros_pf','cadastros_pj','cadastros_enderecos','documentos','credenciais','atividades','notificacoes','notificacoes_templates','webhooks','webhook_logs','form_schema','api_connectors','integracoes_config','permissoes'];
  t text;
  pol record;
begin
  foreach t in array affected_tables
  loop
    for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;
  end loop;
end;
$$;

-- PROFILES
create policy "select_profiles_empresa"
  on public.profiles for select to authenticated
  using (is_super_admin_session() or empresa_id = get_current_empresa_id() or id = auth.uid());

create policy "insert_profiles_empresa"
  on public.profiles for insert to authenticated
  with check (is_super_admin_session());

create policy "update_profiles_empresa"
  on public.profiles for update to authenticated
  using (is_super_admin_session())
  with check (is_super_admin_session());

create policy "delete_profiles_empresa"
  on public.profiles for delete to authenticated
  using (is_super_admin_session());

-- CADASTROS
create policy "select_cadastros_empresa"
  on public.cadastros for select to authenticated
  using (
    is_super_admin_session()
    or (is_admin_or_super() and empresa_id = get_current_empresa_id())
    or (created_by = auth.uid() and empresa_id = get_current_empresa_id())
  );

create policy "insert_cadastros_empresa"
  on public.cadastros for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "update_cadastros_empresa"
  on public.cadastros for update to authenticated
  using (
    is_super_admin_session()
    or (is_admin_or_super() and empresa_id = get_current_empresa_id())
    or (created_by = auth.uid() and empresa_id = get_current_empresa_id())
  );

create policy "delete_cadastros_empresa"
  on public.cadastros for delete to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

-- CADASTROS_PF
create policy "select_cadastros_pf_empresa"
  on public.cadastros_pf for select to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "insert_cadastros_pf_empresa"
  on public.cadastros_pf for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "update_cadastros_pf_empresa"
  on public.cadastros_pf for update to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "delete_cadastros_pf_empresa"
  on public.cadastros_pf for delete to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and is_admin_or_super()
      and empresa_id = get_current_empresa_id())
  ));

-- CADASTROS_PJ
create policy "select_cadastros_pj_empresa"
  on public.cadastros_pj for select to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "insert_cadastros_pj_empresa"
  on public.cadastros_pj for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "update_cadastros_pj_empresa"
  on public.cadastros_pj for update to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "delete_cadastros_pj_empresa"
  on public.cadastros_pj for delete to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and is_admin_or_super()
      and empresa_id = get_current_empresa_id())
  ));

-- CADASTROS_ENDERECOS
create policy "select_enderecos_empresa"
  on public.cadastros_enderecos for select to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "insert_enderecos_empresa"
  on public.cadastros_enderecos for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "update_enderecos_empresa"
  on public.cadastros_enderecos for update to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "delete_enderecos_empresa"
  on public.cadastros_enderecos for delete to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and is_admin_or_super()
      and empresa_id = get_current_empresa_id())
  ));

-- DOCUMENTOS
create policy "select_documentos_empresa"
  on public.documentos for select to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "insert_documentos_empresa"
  on public.documentos for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "update_documentos_empresa"
  on public.documentos for update to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and (is_admin_or_super() or created_by = auth.uid())
      and empresa_id = get_current_empresa_id())
  ));

create policy "delete_documentos_empresa"
  on public.documentos for delete to authenticated
  using (is_super_admin_session() or (
    exists (select 1 from public.cadastros where id = cadastro_id
      and is_admin_or_super()
      and empresa_id = get_current_empresa_id())
  ));

-- CREDENCIAIS
create policy "select_credenciais_empresa"
  on public.credenciais for select to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "insert_credenciais_empresa"
  on public.credenciais for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_credenciais_empresa"
  on public.credenciais for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_credenciais_empresa"
  on public.credenciais for delete to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

-- ATIVIDADES
create policy "select_atividades_empresa"
  on public.atividades for select to authenticated
  using (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "insert_atividades_empresa"
  on public.atividades for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "delete_atividades_empresa"
  on public.atividades for delete to authenticated
  using (is_super_admin_session());

-- NOTIFICACOES
create policy "select_notificacoes_empresa"
  on public.notificacoes for select to authenticated
  using (is_super_admin_session() or (usuario_id = auth.uid() and empresa_id = get_current_empresa_id()));

create policy "insert_notificacoes_empresa"
  on public.notificacoes for insert to authenticated
  with check (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "update_notificacoes_empresa"
  on public.notificacoes for update to authenticated
  using (is_super_admin_session() or (usuario_id = auth.uid() and empresa_id = get_current_empresa_id()));

-- NOTIFICACOES_TEMPLATES
create policy "select_templates_empresa"
  on public.notificacoes_templates for select to authenticated
  using (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "insert_templates_empresa"
  on public.notificacoes_templates for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_templates_empresa"
  on public.notificacoes_templates for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_templates_empresa"
  on public.notificacoes_templates for delete to authenticated
  using (is_super_admin_session());

-- WEBHOOKS
create policy "select_webhooks_empresa"
  on public.webhooks for select to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "insert_webhooks_empresa"
  on public.webhooks for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_webhooks_empresa"
  on public.webhooks for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_webhooks_empresa"
  on public.webhooks for delete to authenticated
  using (is_super_admin_session());

-- WEBHOOK_LOGS
create policy "select_webhook_logs_empresa"
  on public.webhook_logs for select to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "insert_webhook_logs_empresa"
  on public.webhook_logs for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

-- FORM_SCHEMA
create policy "select_form_schema_empresa"
  on public.form_schema for select to authenticated
  using (is_super_admin_session() or empresa_id = get_current_empresa_id());

create policy "insert_form_schema_empresa"
  on public.form_schema for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_form_schema_empresa"
  on public.form_schema for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_form_schema_empresa"
  on public.form_schema for delete to authenticated
  using (is_super_admin_session());

-- API_CONNECTORS
create policy "select_api_connectors_empresa"
  on public.api_connectors for select to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "insert_api_connectors_empresa"
  on public.api_connectors for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_api_connectors_empresa"
  on public.api_connectors for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_api_connectors_empresa"
  on public.api_connectors for delete to authenticated
  using (is_super_admin_session());

-- INTEGRACOES_CONFIG
create policy "select_integracoes_empresa"
  on public.integracoes_config for select to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "insert_integracoes_empresa"
  on public.integracoes_config for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_integracoes_empresa"
  on public.integracoes_config for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_integracoes_empresa"
  on public.integracoes_config for delete to authenticated
  using (is_super_admin_session());

-- PERMISSOES
create policy "select_permissoes_empresa"
  on public.permissoes for select to authenticated
  using (
    is_super_admin_session()
    or usuario_id = auth.uid()
    or (is_admin_or_super() and empresa_id = get_current_empresa_id())
  );

create policy "insert_permissoes_empresa"
  on public.permissoes for insert to authenticated
  with check (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "update_permissoes_empresa"
  on public.permissoes for update to authenticated
  using (is_super_admin_session() or (is_admin_or_super() and empresa_id = get_current_empresa_id()));

create policy "delete_permissoes_empresa"
  on public.permissoes for delete to authenticated
  using (is_super_admin_session());
