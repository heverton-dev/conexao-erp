-- Extende pacientes com campos do Bubble
alter table public.pacientes add column if not exists codigo_cliente  text;
alter table public.pacientes add column if not exists data_nascimento  date;
alter table public.pacientes add column if not exists tipo_pessoa      text check (tipo_pessoa in ('PF','PJ'));
alter table public.pacientes add column if not exists cro              text;
alter table public.pacientes add column if not exists cro_uf           text;
alter table public.pacientes add column if not exists razao_social     text;
alter table public.pacientes add column if not exists nome_fantasia    text;
alter table public.pacientes add column if not exists endereco_cep     text;
alter table public.pacientes add column if not exists endereco_cidade  text;
alter table public.pacientes add column if not exists endereco_bairro  text;
alter table public.pacientes add column if not exists endereco_complemento text;
alter table public.pacientes add column if not exists colaborador      text;
