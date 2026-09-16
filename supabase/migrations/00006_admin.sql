-- ============================================================
-- 00006_admin.sql
-- Super Admin + App Config + Webhooks
-- ============================================================

-- 1. Profiles: flag is_super_admin
alter table public.profiles
  add column if not exists is_super_admin boolean default false;

-- 2. App Config (substitui .env gerenciável)
create table if not exists public.app_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  description text,
  type text not null default 'env' check (type in ('env', 'internal')),
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id)
);
alter table public.app_config enable row level security;

-- 3. Mock Credentials (substitui credentials.env)
create table if not exists public.mock_credentials (
  id uuid primary key default gen_random_uuid(),
  identifier text not null unique,
  email text not null,
  password text not null,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  ambiente text check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'ambos')),
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.mock_credentials enable row level security;

-- 4. Webhooks
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  evento text not null,
  tipo_evento text not null default 'button_action' check (tipo_evento in ('status_change', 'button_action')),
  url text not null,
  metodo text not null default 'POST',
  headers jsonb default '{}'::jsonb,
  body_template jsonb default '{}'::jsonb,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.webhooks enable row level security;

-- 5. Webhook Logs
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references public.webhooks(id),
  evento text,
  url text,
  status_code int,
  resposta text,
  sucesso boolean,
  payload_enviado jsonb,
  created_at timestamptz default now()
);
alter table public.webhook_logs enable row level security;

-- 6. RLS Policies — apenas SUPER ADMIN pode CRUD
create policy "Super admin pode ver app_config"
  on public.app_config for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode inserir app_config"
  on public.app_config for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode atualizar app_config"
  on public.app_config for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode deletar app_config"
  on public.app_config for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Super admin pode ver mock_credentials"
  on public.mock_credentials for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode inserir mock_credentials"
  on public.mock_credentials for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode atualizar mock_credentials"
  on public.mock_credentials for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode deletar mock_credentials"
  on public.mock_credentials for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Super admin pode ver webhooks"
  on public.webhooks for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode inserir webhooks"
  on public.webhooks for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode atualizar webhooks"
  on public.webhooks for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode deletar webhooks"
  on public.webhooks for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Super admin pode ver webhook_logs"
  on public.webhook_logs for select to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
create policy "Super admin pode inserir webhook_logs"
  on public.webhook_logs for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

-- 7. Seed: importar credentials.env para mock_credentials (se vazio)
insert into public.mock_credentials (identifier, email, password, role, ambiente, ativo)
select 'SUPER_ADMIN', 'REDACTED', 'REDACTED', 'admin', 'ambos', true
where not exists (select 1 from public.mock_credentials where identifier = 'SUPER_ADMIN');

insert into public.mock_credentials (identifier, email, password, role, ambiente, ativo)
select 'CADASTRO', 'cadastro@conexao.com.br', 'REDACTED', 'editor', 'cadastro', true
where not exists (select 1 from public.mock_credentials where identifier = 'CADASTRO');

insert into public.mock_credentials (identifier, email, password, role, ambiente, ativo)
select 'CONSULTOR', 'consultor@conexao.com.br', 'REDACTED', 'viewer', 'consultor', true
where not exists (select 1 from public.mock_credentials where identifier = 'CONSULTOR');

insert into public.mock_credentials (identifier, email, password, role, ambiente, ativo)
select 'TI', 'ti@conexao.com.br', 'REDACTED', 'admin', 'tecnologia', true
where not exists (select 1 from public.mock_credentials where identifier = 'TI');

-- 8. Seed: app_config com valores atuais do .env
insert into public.app_config (key, value, description, type)
select 'VITE_SUPABASE_URL', 'https://cluuqzhizeqvkgvfdisx.supabase.co', 'URL do projeto Supabase', 'env'
where not exists (select 1 from public.app_config where key = 'VITE_SUPABASE_URL');

insert into public.app_config (key, value, description, type)
select 'VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXVxemhpemVxdmtndmZkaXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg3NjksImV4cCI6MjA5NzM2NDc2OX0.GM3quHA1z_9kCiMEYsfAh9Pi0KVdnCIFQEYe-wwE9MM', 'Chave anônima do Supabase', 'env'
where not exists (select 1 from public.app_config where key = 'VITE_SUPABASE_ANON_KEY');

insert into public.app_config (key, value, description, type)
select 'SUPABASE_DB_PASSWORD', 'REDACTED', 'Senha do banco de dados Supabase', 'env'
where not exists (select 1 from public.app_config where key = 'SUPABASE_DB_PASSWORD');
