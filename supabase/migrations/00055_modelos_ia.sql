-- ============================================================
-- 00055_modelos_ia.sql
-- Tabelas para monitoramento de modelos de IA do mercado
-- ============================================================

create table if not exists public.modelos_ia_versoes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  total_modelos int not null default 0
);

create table if not exists public.modelos_ia (
  id uuid default gen_random_uuid() primary key,
  versao_id uuid not null references public.modelos_ia_versoes(id) on delete cascade,
  modelo_id text not null,
  nome text not null,
  provedor text not null,
  modalidade text,
  win_rate numeric(5,1),
  top_arena text,
  input_cost numeric(10,4),
  output_cost numeric(10,4),
  context_window numeric(10,1),
  max_output numeric(10,1),
  created_at timestamptz default now()
);

create index if not exists idx_modelos_ia_versao_id on public.modelos_ia(versao_id);
create index if not exists idx_modelos_ia_versoes_created_at on public.modelos_ia_versoes(created_at desc);

alter table public.modelos_ia enable row level security;
alter table public.modelos_ia_versoes enable row level security;

create policy "Super admin pode ler modelos_ia_versoes"
  on public.modelos_ia_versoes for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Super admin pode inserir modelos_ia_versoes"
  on public.modelos_ia_versoes for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Super admin pode ler modelos_ia"
  on public.modelos_ia for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

create policy "Super admin pode inserir modelos_ia"
  on public.modelos_ia for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));
