-- ============================================================
-- 00016_integracoes_nativas.sql
-- Tabela de Configuração de Integrações Nativas para o Super Admin
-- e lógica de disparo do WhatsApp via Evolution API do Postgres.
-- ============================================================

-- 1. Habilitar a extensão pg_net se não estiver ativada
create extension if not exists pg_net with schema extensions;

-- 2. Criar a tabela de configurações das integrações
create table if not exists public.integracoes_config (
  id uuid primary key default gen_random_uuid(),
  chave text unique not null,
  nome text not null,
  ativo boolean default false,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Habilitar RLS
alter table public.integracoes_config enable row level security;

-- 4. Criar política de segurança de acesso: apenas Super Admins
drop policy if exists "Super admins gerenciam integracoes" on public.integracoes_config;
create policy "Super admins gerenciam integracoes"
  on public.integracoes_config for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_super_admin = true));

-- 5. Inserir integrações padrão (inativas por padrão)
insert into public.integracoes_config (chave, nome, config) values
  ('evolution_api', 'Evolution API (WhatsApp)', '{"base_url": "", "api_key": "", "instancia": ""}'::jsonb),
  ('cep_api', 'CEP Resiliente (BrasilAPI/ViaCEP)', '{"provider": "brasilapi"}'::jsonb),
  ('google_sheets', 'Google Sheets (Exportação)', '{"spreadsheet_id": "", "client_email": "", "private_key": ""}'::jsonb),
  ('google_drive', 'Google Drive (Armazenamento)', '{"folder_id": "", "client_email": "", "private_key": ""}'::jsonb),
  ('google_maps', 'Google Maps (Geolocalização)', '{"api_key": ""}'::jsonb),
  ('gmail_smtp', 'SMTP/E-mail (Notificações)', '{"host": "", "port": 587, "user": "", "pass": "", "secure": false}'::jsonb)
on conflict (chave) do nothing;

-- 6. Função PL/pgSQL para envio de WhatsApp via Evolution API de forma assíncrona
create or replace function public.enviar_whatsapp_evolution(
  contato text,
  mensagem text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item_config record;
  base_url text;
  api_key text;
  instancia text;
  contato_limpo text;
  endpoint text;
  payload jsonb;
  headers jsonb;
begin
  -- Buscar se a Evolution API está configurada e ativa
  select * into item_config
  from public.integracoes_config
  where chave = 'evolution_api' and ativo = true;

  if item_config is null then
    -- Integração não está ativa, não faz nada
    return;
  end if;

  base_url := item_config.config->>'base_url';
  api_key := item_config.config->>'api_key';
  instancia := item_config.config->>'instancia';

  if base_url is null or base_url = '' or api_key is null or api_key = '' or instancia is null or instancia = '' then
    -- Configuração incompleta, ignorar disparo
    return;
  end if;

  -- Higienização do número do telefone (manter somente números)
  contato_limpo := regexp_replace(contato, '\D', '', 'g');
  
  -- Se o número tiver 10 ou 11 dígitos (formato nacional brasileiro sem DDI), adicionar o DDI 55
  if length(contato_limpo) = 11 or length(contato_limpo) = 10 then
    contato_limpo := '55' || contato_limpo;
  end if;

  -- Validar se o contato_limpo parece ter um tamanho razoável de telefone
  if length(contato_limpo) < 8 then
    return;
  end if;

  -- Formatar URL de endpoint da Evolution API
  -- Garante que não tenha barra dupla desnecessária
  base_url := rtrim(base_url, '/');
  endpoint := base_url || '/message/sendText/' || instancia;

  -- Montar o corpo da mensagem conforme documentação da Evolution API
  payload := jsonb_build_object(
    'number', contato_limpo,
    'options', jsonb_build_object(
      'delay', 1000,
      'presence', 'composing'
    ),
    'textMessage', jsonb_build_object(
      'text', mensagem
    )
  );

  -- Montar headers com a apikey no cabeçalho
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'apikey', api_key
  );

  -- Disparar a requisição de forma assíncrona em segundo plano via pg_net
  perform net.http_post(
    url := endpoint,
    body := payload::text,
    headers := headers
  );
end;
$$;
