-- ============================================================
-- 00005_legacy.sql
-- Alinha schema com app Bubble legado (entidade central = cliente/cadastros)
-- Adiciona campos de fluxo de cadastro a cadastros + tabelas auxiliares
-- ============================================================

-- 1. Profile: adicionar campo ambiente + departamento
alter table public.profiles
  add column if not exists ambiente text not null default 'ambos'
  check (ambiente in ('cadastro', 'consultor', 'tecnologia', 'ambos'));
alter table public.profiles
  add column if not exists departamento text;
alter table public.profiles
  add column if not exists ativo boolean default true;

-- 2. Expandir cadastros (entidade mestre = cliente do Bubble)
alter table public.cadastros
  add column if not exists status text not null default 'link_gerado'
  check (status in ('link_gerado','dados_enviados','em_analise','em_correcao','aprovado','reprovado'));
alter table public.cadastros
  add column if not exists token_acesso text unique;
alter table public.cadastros
  add column if not exists nome_temporario text;
alter table public.cadastros
  add column if not exists tipo_acao text default 'solicitar_cadastro'
  check (tipo_acao in ('solicitar_cadastro', 'atualizar_cadastro'));
alter table public.cadastros
  add column if not exists forma_compartilhamento text
  check (forma_compartilhamento in ('whatsapp', 'email', 'copiar'));
alter table public.cadastros
  add column if not exists link_expiracao timestamptz;
alter table public.cadastros
  add column if not exists data_criacao_link timestamptz;
alter table public.cadastros
  add column if not exists data_finalizacao timestamptz;
alter table public.cadastros
  add column if not exists comentario_reprovacao text;
alter table public.cadastros
  add column if not exists revisado boolean default false;
alter table public.cadastros
  add column if not exists consulta_cnpj_realizada boolean default false;
alter table public.cadastros
  add column if not exists consulta_cro_realizada boolean default false;
alter table public.cadastros
  add column if not exists status_verificacao_token boolean default false;
alter table public.cadastros
  add column if not exists token_gerado text;
alter table public.cadastros
  add column if not exists token_expiracao timestamptz;
alter table public.cadastros
  add column if not exists email_token text;
alter table public.cadastros
  add column if not exists lead_email text;
alter table public.cadastros
  add column if not exists lead_whatsapp text;
alter table public.cadastros
  add column if not exists lead_nome text;
alter table public.cadastros
  add column if not exists data_consulta timestamptz;

-- 3. Expandir cadastros_pf com campos do legado
alter table public.cadastros_pf
  add column if not exists email_comunicacao text,
  add column if not exists email_nf text,
  add column if not exists tel_fixo text,
  add column if not exists celular1 text,
  add column if not exists celular2 text,
  add column if not exists data_emissao_cro date,
  add column if not exists estado text;

-- 4. Expandir cadastros_pj com campos do legado
alter table public.cadastros_pj
  add column if not exists cnpj text,
  add column if not exists inscricao_estadual text,
  add column if not exists email_comunicacao text,
  add column if not exists email_nf text,
  add column if not exists tel_fixo text,
  add column if not exists celular1 text,
  add column if not exists celular2 text,
  add column if not exists data_emissao_cro date;

-- 5. Expandir cadastros_enderecos
alter table public.cadastros_enderecos
  add column if not exists rua text,
  add column if not exists numero text,
  add column if not exists estado text;

-- 6. Documentos (vinculado a cadastros, não solicitacoes)
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid not null references public.cadastros(id) on delete cascade,
  tipo text not null,
  url text not null,
  created_at timestamptz default now()
);
alter table public.documentos enable row level security;
drop policy if exists "Autenticados podem ver documentos" on public.documentos;
create policy "Autenticados podem ver documentos"
  on public.documentos for select to authenticated using (true);
drop policy if exists "Autenticados podem inserir documentos" on public.documentos;
create policy "Autenticados podem inserir documentos"
  on public.documentos for insert to authenticated with check (true);

-- 7. Credenciais (acesso da equipe)
create table if not exists public.credenciais (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id),
  nome_completo text not null,
  email_corporativo text not null,
  whatsapp_corporativo text,
  departamento text,
  ativo boolean default true,
  created_at timestamptz default now()
);
alter table public.credenciais enable row level security;
drop policy if exists "Autenticados podem ver credenciais" on public.credenciais;
create policy "Autenticados podem ver credenciais"
  on public.credenciais for select to authenticated using (true);
drop policy if exists "Admin pode gerenciar credenciais" on public.credenciais;
create policy "Admin pode gerenciar credenciais"
  on public.credenciais for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 8. Log (atividades) — já existe, atualizar constraint
alter table public.atividades drop constraint if exists atividades_entidade_tipo_check;
alter table public.atividades add constraint atividades_entidade_tipo_check
  check (entidade_tipo in ('cadastro'));

-- 9. Remover tabelas legadas (PWA antigo)
drop table if exists public.contratos cascade;
drop table if exists public.leads cascade;

-- 10. RLS público para pre-cadastro (acesso via token)
--     SECURITY DEFINER functions bypass RLS
create or replace function public.get_cadastro_by_token(token_text text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  result json;
begin
  select row_to_json(c.*) into result
  from public.cadastros c
  where c.token_acesso = token_text;
  return result;
end;
$$;

create or replace function public.update_cadastro_from_precadastro(
  token_text text,
  tipo_pessoa text,
  pf_data jsonb,
  pj_data jsonb,
  endereco_data jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cad_id uuid;
begin
  select id into cad_id from public.cadastros where token_acesso = token_text;
  if cad_id is null then raise exception 'Token invalido'; end if;

  update public.cadastros set
    tipo_pessoa = update_cadastro_from_precadastro.tipo_pessoa,
    status = 'dados_enviados',
    data_finalizacao = now()
  where id = cad_id;

  if tipo_pessoa = 'PF' then
    insert into public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf, data_emissao_cro, email_comunicacao, email_nf, tel_fixo, celular1, celular2, estado)
    values (
      cad_id,
      pf_data ->> 'nome',
      pf_data ->> 'cpf',
      (pf_data ->> 'data_nascimento')::date,
      pf_data ->> 'cro',
      pf_data ->> 'cro_uf',
      (pf_data ->> 'data_emissao_cro')::date,
      pf_data ->> 'email_comunicacao',
      pf_data ->> 'email_nf',
      pf_data ->> 'tel_fixo',
      pf_data ->> 'celular1',
      pf_data ->> 'celular2',
      pf_data ->> 'estado'
    )
    on conflict (cadastro_id) do update set
      nome = excluded.nome, cpf = excluded.cpf;
  else
    insert into public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cnpj, inscricao_estadual, cro, cro_uf, data_emissao_cro, email_comunicacao, email_nf, tel_fixo, celular1, celular2)
    values (
      cad_id,
      pj_data ->> 'razao_social',
      pj_data ->> 'nome_fantasia',
      pj_data ->> 'cnpj',
      pj_data ->> 'inscricao_estadual',
      pj_data ->> 'cro',
      pj_data ->> 'cro_uf',
      (pj_data ->> 'data_emissao_cro')::date,
      pj_data ->> 'email_comunicacao',
      pj_data ->> 'email_nf',
      pj_data ->> 'tel_fixo',
      pj_data ->> 'celular1',
      pj_data ->> 'celular2'
    )
    on conflict (cadastro_id) do update set
      razao_social = excluded.razao_social, cnpj = excluded.cnpj;
  end if;

  insert into public.cadastros_enderecos (cadastro_id, cep, rua, numero, bairro, complemento, cidade, estado)
  values (
    cad_id,
    endereco_data ->> 'cep',
    endereco_data ->> 'rua',
    endereco_data ->> 'numero',
    endereco_data ->> 'bairro',
    endereco_data ->> 'complemento',
    endereco_data ->> 'cidade',
    endereco_data ->> 'estado'
  )
  on conflict (cadastro_id) do update set
    cep = excluded.cep, cidade = excluded.cidade;
end;
$$;

-- 11. View clientes (compatível com nomenclatura do legado)
drop view if exists public.pacientes;
drop view if exists public.clientes;
create view public.clientes as
select
  c.id,
  coalesce(pf.nome, pj.nome_fantasia, pj.razao_social) as nome,
  pf.cpf,
  pf.data_nascimento,
  pf.cro,
  pf.cro_uf,
  pf.email_comunicacao,
  pf.email_nf,
  pf.tel_fixo,
  pf.celular1,
  pf.celular2,
  pf.data_emissao_cro,
  pf.estado,
  pj.razao_social,
  pj.nome_fantasia,
  pj.cnpj,
  pj.inscricao_estadual,
  c.codigo_cliente,
  c.tipo_pessoa,
  c.colaborador,
  c.status,
  c.token_acesso,
  c.nome_temporario,
  c.tipo_acao,
  c.forma_compartilhamento,
  c.link_expiracao,
  c.data_criacao_link,
  c.data_finalizacao,
  c.comentario_reprovacao,
  c.revisado,
  c.lead_nome,
  c.lead_email,
  c.lead_whatsapp,
  e.cep          as endereco_cep,
  e.cidade       as endereco_cidade,
  e.bairro       as endereco_bairro,
  e.complemento  as endereco_complemento,
  e.rua          as endereco_rua,
  e.numero       as endereco_numero,
  e.estado       as endereco_estado,
  c.observacoes,
  c.created_by,
  c.created_at,
  c.updated_at
from public.cadastros c
left join public.cadastros_pf pf on pf.cadastro_id = c.id
left join public.cadastros_pj pj on pj.cadastro_id = c.id
left join public.cadastros_enderecos e on e.cadastro_id = c.id;
