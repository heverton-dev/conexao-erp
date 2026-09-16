-- Pacientes
create table public.pacientes (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  cpf         text unique,
  email       text,
  telefone    text,
  observacoes text default '',
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.pacientes enable row level security;

create policy "Usuários autenticados podem ver pacientes"
  on public.pacientes for select to authenticated using (true);

create policy "Usuários autenticados podem inserir pacientes"
  on public.pacientes for insert to authenticated with check (true);

create policy "Usuários autenticados podem atualizar pacientes"
  on public.pacientes for update to authenticated using (true);

-- Contratos
create table public.contratos (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid references public.pacientes(id) on delete set null,
  titulo          text not null,
  status          text not null default 'ativo' check (status in ('ativo','encerrado','cancelado')),
  valor           decimal(12,2) default 0,
  data_inicio     date,
  data_fim        date,
  responsavel_id  uuid references public.profiles(id),
  observacoes     text default '',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.contratos enable row level security;

create policy "Usuários autenticados podem ver contratos"
  on public.contratos for select to authenticated using (true);

create policy "Usuários autenticados podem inserir contratos"
  on public.contratos for insert to authenticated with check (true);

create policy "Usuários autenticados podem atualizar contratos"
  on public.contratos for update to authenticated using (true);

-- Leads
create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  contato         text,
  origem          text default '',
  estagio         text not null default 'novo' check (estagio in ('novo','contato','proposta','fechado','perdido')),
  valor_estimado  decimal(12,2) default 0,
  observacoes     text default '',
  assigned_to     uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.leads enable row level security;

create policy "Usuários autenticados podem ver leads"
  on public.leads for select to authenticated using (true);

create policy "Usuários autenticados podem inserir leads"
  on public.leads for insert to authenticated with check (true);

create policy "Usuários autenticados podem atualizar leads"
  on public.leads for update to authenticated using (true);

-- Atividades / Timeline
create table public.atividades (
  id              uuid primary key default gen_random_uuid(),
  entidade_tipo   text not null check (entidade_tipo in ('lead','contrato','paciente')),
  entidade_id     uuid not null,
  acao            text not null,
  descricao       text default '',
  usuario_id      uuid references public.profiles(id),
  created_at      timestamptz default now()
);
alter table public.atividades enable row level security;

create policy "Usuários autenticados podem ver atividades"
  on public.atividades for select to authenticated using (true);

create policy "Usuários autenticados podem inserir atividades"
  on public.atividades for insert to authenticated with check (true);
