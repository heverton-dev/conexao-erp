
-- ============= ENUMS =============
create type public.app_role as enum ('super_admin', 'gestor', 'consultor');
create type public.cargo_atendente as enum ('Secretária', 'Dentista', 'Outro');
create type public.tipo_visita as enum ('Prospecção', 'Relacionamento', 'Pós-venda');
create type public.temperatura_vendedor as enum ('Frio', 'Morno', 'Quente');
create type public.probabilidade_fechamento as enum ('Baixa', 'Média', 'Alta');
create type public.convite_status as enum ('pendente', 'utilizado', 'expirado');

-- ============= USUARIOS =============
create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo varchar(255) not null,
  email_corporativo varchar(255) unique not null,
  role app_role not null default 'consultor',
  gestor_id uuid references public.usuarios(id) on delete set null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.usuarios enable row level security;

-- Security definer helper para evitar recursão em RLS
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.usuarios where id = _user_id and role = _role and ativo = true
  )
$$;

create or replace function public.is_gestor_de(_gestor_id uuid, _consultor_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.usuarios where id = _consultor_id and gestor_id = _gestor_id
  )
$$;

create or replace function public.current_role()
returns app_role
language sql stable security definer set search_path = public
as $$
  select role from public.usuarios where id = auth.uid()
$$;

-- Políticas usuarios
create policy "Usuario ve seu proprio registro" on public.usuarios
  for select using (id = auth.uid());
create policy "Gestor ve seus consultores" on public.usuarios
  for select using (gestor_id = auth.uid());
create policy "Super admin total usuarios" on public.usuarios
  for all using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Trigger: criar registro em usuarios quando um auth.user surge
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.usuarios (id, nome_completo, email_corporativo, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::app_role, 'consultor')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============= CLIENTES =============
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome_doutor varchar(255) not null,
  nome_clinica varchar(255),
  telefone_contato varchar(20),
  consultor_atual_id uuid references public.usuarios(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz
);
alter table public.clientes enable row level security;

create policy "Consultor ve seus clientes" on public.clientes
  for select using (consultor_atual_id = auth.uid());
create policy "Consultor cria clientes proprios" on public.clientes
  for insert with check (consultor_atual_id = auth.uid() and public.has_role(auth.uid(), 'consultor'));
create policy "Consultor atualiza seus clientes" on public.clientes
  for update using (consultor_atual_id = auth.uid());
create policy "Gestor ve clientes da equipe" on public.clientes
  for select using (public.is_gestor_de(auth.uid(), consultor_atual_id));
create policy "Gestor transfere clientes" on public.clientes
  for update using (public.has_role(auth.uid(), 'gestor'));
create policy "Super admin total clientes" on public.clientes
  for all using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- ============= VISITAS =============
create table public.visitas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  consultor_executor_id uuid not null references public.usuarios(id),
  data_visita date not null,
  atendente varchar(255) not null,
  cargo_atendente cargo_atendente not null,
  tipo_visita tipo_visita not null,
  gerou_orcamento boolean not null default false,
  gerou_pedido boolean not null default false,
  valor_estimado decimal(10,2),
  interesse_escala integer check (interesse_escala between 1 and 5),
  temperatura_vendedor temperatura_vendedor not null,
  probabilidade_fechamento probabilidade_fechamento,
  feedback_cliente text,
  observacoes_vendedor text,
  data_proximo_contato date,
  acao_prevista varchar(255),
  criado_em timestamptz not null default now()
);
alter table public.visitas enable row level security;

create policy "Consultor ve visitas dos seus clientes" on public.visitas
  for select using (
    exists(select 1 from public.clientes c where c.id = visitas.cliente_id and c.consultor_atual_id = auth.uid())
    or consultor_executor_id = auth.uid()
  );
create policy "Consultor registra visitas como executor" on public.visitas
  for insert with check (consultor_executor_id = auth.uid());
create policy "Gestor ve visitas da equipe" on public.visitas
  for select using (
    public.is_gestor_de(auth.uid(), consultor_executor_id)
    or exists(
      select 1 from public.clientes c
      where c.id = visitas.cliente_id and public.is_gestor_de(auth.uid(), c.consultor_atual_id)
    )
  );
create policy "Super admin total visitas" on public.visitas
  for all using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- ============= LOGS DE TRANSFERENCIA =============
create table public.logs_transferencia (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  de_consultor_id uuid references public.usuarios(id),
  para_consultor_id uuid references public.usuarios(id),
  transferido_por_id uuid references public.usuarios(id),
  data_transferencia timestamptz not null default now()
);
alter table public.logs_transferencia enable row level security;

create policy "Gestor ve logs da equipe" on public.logs_transferencia
  for select using (
    transferido_por_id = auth.uid()
    or public.is_gestor_de(auth.uid(), de_consultor_id)
    or public.is_gestor_de(auth.uid(), para_consultor_id)
  );
create policy "Super admin total logs" on public.logs_transferencia
  for all using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Trigger que registra transferência quando consultor_atual_id muda
create or replace function public.log_transferencia_cliente()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.consultor_atual_id is distinct from old.consultor_atual_id then
    insert into public.logs_transferencia (cliente_id, de_consultor_id, para_consultor_id, transferido_por_id)
    values (new.id, old.consultor_atual_id, new.consultor_atual_id, auth.uid());
    new.atualizado_em := now();
  end if;
  return new;
end; $$;

create trigger trg_log_transferencia
  before update of consultor_atual_id on public.clientes
  for each row execute function public.log_transferencia_cliente();

-- ============= CONVITES DE ACESSO =============
create table public.convites_acesso (
  id uuid primary key default gen_random_uuid(),
  email_destino varchar(255) not null,
  token_hash varchar(255) unique not null,
  role_atribuida app_role not null,
  gestor_vinculado_id uuid references public.usuarios(id) on delete set null,
  data_expiracao timestamptz not null,
  status convite_status not null default 'pendente',
  criado_por_id uuid references public.usuarios(id),
  criado_em timestamptz not null default now()
);
alter table public.convites_acesso enable row level security;

create policy "Super admin total convites" on public.convites_acesso
  for all using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Indexes úteis
create index idx_clientes_consultor on public.clientes(consultor_atual_id);
create index idx_visitas_cliente on public.visitas(cliente_id, data_visita desc);
create index idx_visitas_executor on public.visitas(consultor_executor_id);
create index idx_usuarios_gestor on public.usuarios(gestor_id);
