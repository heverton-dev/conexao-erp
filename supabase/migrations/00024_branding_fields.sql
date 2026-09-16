alter table if exists public.empresas_config
  add column if not exists logo_index_url text,
  add column if not exists logo_app_url text,
  add column if not exists favicon_url text;
