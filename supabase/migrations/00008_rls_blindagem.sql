-- ============================================================
-- 00008_rls_blindagem.sql
-- Blinda todas as tabelas com RLS baseado em role + is_super_admin
-- ============================================================

-- Helper function: verifica se usuário é admin ou super_admin
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
      and (role = 'admin' or is_super_admin = true)
  );
$$;

-- ============================================================
-- 1. cadastros
-- ============================================================
drop policy if exists "Autenticados podem ver cadastros" on public.cadastros;
drop policy if exists "Autenticados podem inserir cadastros" on public.cadastros;
drop policy if exists "Autenticados podem atualizar cadastros" on public.cadastros;

create policy "admin ve todos cadastros"
  on public.cadastros for select to authenticated
  using (public.is_admin_or_super());

create policy "consultor ve proprios cadastros"
  on public.cadastros for select to authenticated
  using (created_by = auth.uid());

create policy "autenticados podem inserir cadastros"
  on public.cadastros for insert to authenticated
  with check (true);

create policy "admin pode atualizar qualquer cadastro"
  on public.cadastros for update to authenticated
  using (public.is_admin_or_super());

create policy "consultor pode atualizar proprios cadastros"
  on public.cadastros for update to authenticated
  using (created_by = auth.uid());

-- ============================================================
-- 2. cadastros_pf
-- ============================================================
drop policy if exists "Autenticados podem ver PF" on public.cadastros_pf;
drop policy if exists "Autenticados podem inserir PF" on public.cadastros_pf;
drop policy if exists "Autenticados podem atualizar PF" on public.cadastros_pf;

create policy "admin ve todos PF"
  on public.cadastros_pf for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id
      and (public.is_admin_or_super() or created_by = auth.uid())
  ));

create policy "consultor ve proprios PF"
  on public.cadastros_pf for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

create policy "autenticados podem inserir PF"
  on public.cadastros_pf for insert to authenticated
  with check (true);

create policy "admin pode atualizar qualquer PF"
  on public.cadastros_pf for update to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and public.is_admin_or_super()
  ));

create policy "consultor pode atualizar proprios PF"
  on public.cadastros_pf for update to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

-- ============================================================
-- 3. cadastros_pj
-- ============================================================
drop policy if exists "Autenticados podem ver PJ" on public.cadastros_pj;
drop policy if exists "Autenticados podem inserir PJ" on public.cadastros_pj;
drop policy if exists "Autenticados podem atualizar PJ" on public.cadastros_pj;

create policy "admin ve todos PJ"
  on public.cadastros_pj for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and public.is_admin_or_super()
  ));

create policy "consultor ve proprios PJ"
  on public.cadastros_pj for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

create policy "autenticados podem inserir PJ"
  on public.cadastros_pj for insert to authenticated
  with check (true);

create policy "admin pode atualizar qualquer PJ"
  on public.cadastros_pj for update to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and public.is_admin_or_super()
  ));

create policy "consultor pode atualizar proprios PJ"
  on public.cadastros_pj for update to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

-- ============================================================
-- 4. cadastros_enderecos
-- ============================================================
drop policy if exists "Autenticados podem ver enderecos" on public.cadastros_enderecos;
drop policy if exists "Autenticados podem inserir enderecos" on public.cadastros_enderecos;
drop policy if exists "Autenticados podem atualizar enderecos" on public.cadastros_enderecos;

create policy "admin ve todos enderecos"
  on public.cadastros_enderecos for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and public.is_admin_or_super()
  ));

create policy "consultor ve proprios enderecos"
  on public.cadastros_enderecos for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

create policy "autenticados podem inserir enderecos"
  on public.cadastros_enderecos for insert to authenticated
  with check (true);

create policy "admin pode atualizar qualquer endereco"
  on public.cadastros_enderecos for update to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and public.is_admin_or_super()
  ));

create policy "consultor pode atualizar proprios enderecos"
  on public.cadastros_enderecos for update to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

-- ============================================================
-- 5. documentos
-- ============================================================
drop policy if exists "Autenticados podem ver documentos" on public.documentos;
drop policy if exists "Autenticados podem inserir documentos" on public.documentos;

create policy "admin ve todos documentos"
  on public.documentos for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and public.is_admin_or_super()
  ));

create policy "consultor ve proprios documentos"
  on public.documentos for select to authenticated
  using (exists (
    select 1 from public.cadastros
    where id = cadastro_id and created_by = auth.uid()
  ));

create policy "autenticados podem inserir documentos"
  on public.documentos for insert to authenticated
  with check (true);

-- ============================================================
-- 6. credenciais (apenas admin pode ver/gerenciar)
-- ============================================================
drop policy if exists "Autenticados podem ver credenciais" on public.credenciais;
drop policy if exists "Admin pode gerenciar credenciais" on public.credenciais;

create policy "admin ve credenciais"
  on public.credenciais for select to authenticated
  using (public.is_admin_or_super());

create policy "admin gerencia credenciais"
  on public.credenciais for all to authenticated
  using (public.is_admin_or_super());

-- ============================================================
-- 7. Atividades (logs — admin ve tudo, consultor ve proprios)
-- ============================================================
alter table public.atividades enable row level security;

drop policy if exists "admin ve todas atividades" on public.atividades;
create policy "admin ve todas atividades"
  on public.atividades for select to authenticated
  using (public.is_admin_or_super());

drop policy if exists "consultor ve proprias atividades" on public.atividades;
create policy "consultor ve proprias atividades"
  on public.atividades for select to authenticated
  using (usuario_id = auth.uid());

drop policy if exists "autenticados podem inserir atividades" on public.atividades;
create policy "autenticados podem inserir atividades"
  on public.atividades for insert to authenticated
  with check (true);

-- ============================================================
-- 8. Views: security_invoker = true para respeitar RLS
-- ============================================================
do $$ begin
  if exists (select 1 from pg_class where relname = 'pacientes' and relkind = 'v') then
    execute 'alter view public.pacientes set (security_invoker = true)';
  end if;
  if exists (select 1 from pg_class where relname = 'clientes' and relkind = 'v') then
    execute 'alter view public.clientes set (security_invoker = true)';
  end if;
end $$;

-- ============================================================
-- 9. Trigger: set created_by = auth.uid() automaticamente
-- ============================================================
create or replace function public.set_created_by()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cadastros_set_created_by on public.cadastros;
create trigger trg_cadastros_set_created_by
  before insert on public.cadastros
  for each row
  execute function public.set_created_by();

-- ============================================================
-- 10. Webhooks e Logs
--     SELECT: qualquer autenticado (precisa ler para disparar)
--     INSERT webhook_logs: qualquer autenticado (qualquer ação gera log)
--     CRUD webhooks: só super admin
-- ============================================================
drop policy if exists "Super admin pode ver webhooks" on public.webhooks;
create policy "Qualquer autenticado pode ver webhooks"
  on public.webhooks for select to authenticated
  using (true);

drop policy if exists "Super admin pode ver webhook_logs" on public.webhook_logs;
drop policy if exists "Qualquer autenticado pode inserir webhook_logs" on public.webhook_logs;
drop policy if exists "Super admin pode inserir webhook_logs" on public.webhook_logs;
create policy "Autenticados podem ver webhook_logs"
  on public.webhook_logs for select to authenticated
  using (true);
create policy "Autenticados podem inserir webhook_logs"
  on public.webhook_logs for insert to authenticated
  with check (true);

-- ============================================================
-- 11. Trigger: set usuario_id = auth.uid() em atividades
-- ============================================================
create or replace function public.set_usuario_id()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.usuario_id is null then
    new.usuario_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_atividades_set_usuario_id on public.atividades;
create trigger trg_atividades_set_usuario_id
  before insert on public.atividades
  for each row
  execute function public.set_usuario_id();
