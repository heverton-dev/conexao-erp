-- ============================================================
-- 00004_normalize.sql
-- Recria estrutura normalizada → Bubble mirror: cadastros + PF/PJ/enderecos
-- ============================================================

-- 1. Backup dados existentes (se houver)
create table if not exists public.pacientes_backup as
select * from public.pacientes;

-- 2. Tabela mestre: cadastros
create table public.cadastros (
  id              uuid primary key default gen_random_uuid(),
  codigo_cliente  text,
  tipo_pessoa     text check (tipo_pessoa in ('PF','PJ')),
  colaborador     text,
  observacoes     text default '',
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.cadastros enable row level security;

create policy "Autenticados podem ver cadastros"
  on public.cadastros for select to authenticated using (true);
create policy "Autenticados podem inserir cadastros"
  on public.cadastros for insert to authenticated with check (true);
create policy "Autenticados podem atualizar cadastros"
  on public.cadastros for update to authenticated using (true);

-- 3. Pessoas Físicas
create table public.cadastros_pf (
  id              uuid primary key default gen_random_uuid(),
  cadastro_id     uuid not null references public.cadastros(id) on delete cascade,
  nome            text not null,
  cpf             text,
  data_nascimento date,
  cro             text,
  cro_uf          text,
  unique(cadastro_id)
);
alter table public.cadastros_pf enable row level security;

create policy "Autenticados podem ver PF"
  on public.cadastros_pf for select to authenticated using (true);
create policy "Autenticados podem inserir PF"
  on public.cadastros_pf for insert to authenticated with check (true);
create policy "Autenticados podem atualizar PF"
  on public.cadastros_pf for update to authenticated using (true);

-- 4. Pessoas Jurídicas
create table public.cadastros_pj (
  id              uuid primary key default gen_random_uuid(),
  cadastro_id     uuid not null references public.cadastros(id) on delete cascade,
  razao_social    text not null,
  nome_fantasia   text,
  cro             text,
  cro_uf          text,
  unique(cadastro_id)
);
alter table public.cadastros_pj enable row level security;

create policy "Autenticados podem ver PJ"
  on public.cadastros_pj for select to authenticated using (true);
create policy "Autenticados podem inserir PJ"
  on public.cadastros_pj for insert to authenticated with check (true);
create policy "Autenticados podem atualizar PJ"
  on public.cadastros_pj for update to authenticated using (true);

-- 5. Endereços
create table public.cadastros_enderecos (
  id              uuid primary key default gen_random_uuid(),
  cadastro_id     uuid not null references public.cadastros(id) on delete cascade,
  cep             text,
  cidade          text,
  bairro          text,
  complemento     text,
  unique(cadastro_id)
);
alter table public.cadastros_enderecos enable row level security;

create policy "Autenticados podem ver enderecos"
  on public.cadastros_enderecos for select to authenticated using (true);
create policy "Autenticados podem inserir enderecos"
  on public.cadastros_enderecos for insert to authenticated with check (true);
create policy "Autenticados podem atualizar enderecos"
  on public.cadastros_enderecos for update to authenticated using (true);

-- 6. Ajustar contratos: paciente_id → cadastro_id
alter table public.contratos drop constraint if exists contratos_paciente_id_fkey;
alter table public.contratos rename column paciente_id to cadastro_id;
alter table public.contratos add constraint contratos_cadastro_id_fkey
  foreign key (cadastro_id) references public.cadastros(id) on delete set null;

-- 7. Ajustar atividades: paciente → cadastro
alter table public.atividades drop constraint if exists atividades_entidade_tipo_check;
alter table public.atividades add constraint atividades_entidade_tipo_check
  check (entidade_tipo in ('lead','contrato','cadastro'));

-- 8. Remover colunas extras que ficaram em pacientes (migration 00003)
--    (a tabela será dropada, então não precisa)

-- 9. Dropar tabela flat pacientes
drop table if exists public.pacientes cascade;

-- 10. View compat para leitura (mantém a interface pacientes)
create view public.pacientes as
select
  c.id,
  coalesce(pf.nome, pj.nome_fantasia, pj.razao_social) as nome,
  pf.cpf,
  pf.data_nascimento,
  pf.cro,
  pf.cro_uf,
  pj.razao_social,
  pj.nome_fantasia,
  c.codigo_cliente,
  c.tipo_pessoa,
  c.colaborador,
  e.cep          as endereco_cep,
  e.cidade       as endereco_cidade,
  e.bairro       as endereco_bairro,
  e.complemento  as endereco_complemento,
  c.observacoes,
  c.created_by,
  c.created_at,
  c.updated_at
from public.cadastros c
left join public.cadastros_pf pf on pf.cadastro_id = c.id
left join public.cadastros_pj pj on pj.cadastro_id = c.id
left join public.cadastros_enderecos e on e.cadastro_id = c.id;
