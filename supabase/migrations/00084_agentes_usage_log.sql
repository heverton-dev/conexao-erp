-- ============================================================
-- 00084_agentes_usage_log.sql
-- Tabela para tracking de uso e custo de chamadas de IA
-- Usada pelo módulo agentes-ia para calcular gastos por sessão
-- ============================================================

create table if not exists public.agentes_usage_log (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade,
  agente_id uuid references public.agentes_ia(id) on delete set null,
  session_id text not null,
  modelo text not null,
  provedor text not null,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  total_tokens int not null default 0,
  input_cost numeric(12,8) not null default 0,
  output_cost numeric(12,8) not null default 0,
  total_cost numeric(12,8) not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_agentes_usage_log_session_id on public.agentes_usage_log(session_id);
create index if not exists idx_agentes_usage_log_agente_id on public.agentes_usage_log(agente_id);
create index if not exists idx_agentes_usage_log_empresa_id on public.agentes_usage_log(empresa_id);
create index if not exists idx_agentes_usage_log_created_at on public.agentes_usage_log(created_at desc);

alter table public.agentes_usage_log enable row level security;

create policy "Super admin pode ler agentes_usage_log"
  on public.agentes_usage_log for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Usuario pode ler agentes_usage_log da sua empresa"
  on public.agentes_usage_log for select
  using (
    empresa_id = (select empresa_id from public.profiles where id = auth.uid())
    and exists (select 1 from public.profiles where id = auth.uid())
  );

create policy "Service role pode inserir agentes_usage_log"
  on public.agentes_usage_log for insert
  with check (true);
