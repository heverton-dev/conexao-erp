-- ============================================================
-- 00014_notifications_and_expiry.sql
-- Implementa colunas de expiração, 2FA temporário,
-- tabelas de notificações e templates customizáveis,
-- e funções de limpeza automática de links.
-- ============================================================

-- 1. Novas colunas na tabela public.cadastros
alter table public.cadastros
  add column if not exists link_acessado boolean default false,
  add column if not exists inicio_preenchimento timestamptz,
  add column if not exists "2fa_canal" text,
  add column if not exists "2fa_contato" text,
  add column if not exists "2fa_token" text,
  add column if not exists "2fa_expiracao" timestamptz;

-- 2. Recriar View public.clientes com as novas colunas
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
  c.updated_at,
  c.link_acessado,
  c.inicio_preenchimento,
  c."2fa_canal",
  c."2fa_contato",
  c."2fa_token",
  c."2fa_expiracao"
from public.cadastros c
left join public.cadastros_pf pf on pf.cadastro_id = c.id
left join public.cadastros_pj pj on pj.cadastro_id = c.id
left join public.cadastros_enderecos e on e.cadastro_id = c.id;

-- 3. Tabela de Templates de Notificações
create table if not exists public.notificacoes_templates (
  id uuid primary key default gen_random_uuid(),
  evento text unique not null,
  titulo text not null,
  corpo_template text not null,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.notificacoes_templates enable row level security;

drop policy if exists "Todos autenticados podem ver templates" on public.notificacoes_templates;
create policy "Todos autenticados podem ver templates"
  on public.notificacoes_templates for select to authenticated using (true);

drop policy if exists "Super admin pode fazer tudo com templates" on public.notificacoes_templates;
create policy "Super admin pode fazer tudo com templates"
  on public.notificacoes_templates for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

-- 4. Tabela de Notificações Individuais dos Usuários
create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean default false,
  dados jsonb,
  created_at timestamptz default now()
);

alter table public.notificacoes enable row level security;

drop policy if exists "Usuarios podem ver suas proprias notificacoes" on public.notificacoes;
create policy "Usuarios podem ver suas proprias notificacoes"
  on public.notificacoes for select to authenticated
  using (auth.uid() = usuario_id);

drop policy if exists "Usuarios podem atualizar suas proprias notificacoes" on public.notificacoes;
create policy "Usuarios podem atualizar suas proprias notificacoes"
  on public.notificacoes for update to authenticated
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "Autenticados podem criar notificacoes" on public.notificacoes;
create policy "Autenticados podem criar notificacoes"
  on public.notificacoes for insert to authenticated
  with check (true);

-- 5. Inserir templates padrão iniciais
insert into public.notificacoes_templates (evento, titulo, corpo_template) values
  ('cadastro_correcao', 'Pendente de Correção', 'O cadastro do lead {{lead_nome}} foi analisado e precisa de correções. Motivo: {{motivo}}'),
  ('cadastro_reprovado', 'Cadastro Reprovado', 'O cadastro do lead {{lead_nome}} foi reprovado definitivamente. Motivo: {{motivo}}'),
  ('cadastro_aprovado', 'Cadastro Aprovado!', 'O cadastro do lead {{lead_nome}} foi aprovado no sistema! Código Protheus: {{codigo_cliente}}'),
  ('cadastro_em_analise', 'Novo Cadastro Enviado', 'O lead {{lead_nome}} concluiu o envio de dados e documentos. Está aguardando análise.'),
  ('criacao_credencial', 'Nova Credencial Criada', 'Uma nova credencial de acesso foi criada para o usuário {{nome}} ({{email}}) no departamento {{departamento}}.')
on conflict (evento) do update set
  titulo = excluded.titulo,
  corpo_template = excluded.corpo_template;

-- 6. RPC public.limpar_links_expirados()
create or replace function public.limpar_links_expirados()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.cadastros
  where status = 'link_gerado'
    and link_expiracao < now();
end;
$$;

-- 7. RPC public.registrar_acesso_token(token_text text)
create or replace function public.registrar_acesso_token(token_text text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  result json;
begin
  -- Executar a limpeza de expirados primeiro
  perform public.limpar_links_expirados();
  
  -- Atualizar link_acessado para true
  update public.cadastros
  set link_acessado = true
  where token_acesso = token_text;

  -- Buscar dados para retorno
  select row_to_json(c.*) into result
  from public.cadastros c
  where c.token_acesso = token_text;

  return result;
end;
$$;
