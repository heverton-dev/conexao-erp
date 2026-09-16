-- ============================================================
-- 20260720000002_single_tenant_rpcs.sql
-- Simplificar Triggers e RPCs para single-tenant
--
-- Estratégia:
-- 1. handle_new_user(): empresa_id = NULL (resolvido em runtime)
-- 2. admin_criar_usuario(): remover p_empresa_id
-- 3. admin_deletar_usuario(): sem alterações (não usa empresa_id)
-- ============================================================

-- ============================================================
-- 1. handle_new_user: simplificar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role, empresa_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', ''),
    'viewer',
    NULL  -- single-tenant: empresa_id resolvido em runtime via get_current_empresa_id()
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. admin_criar_usuario: remover p_empresa_id
-- (DROP necessario porque o numero de parametros muda)
-- ============================================================
DROP FUNCTION IF EXISTS public.admin_criar_usuario(text, text, text, uuid, boolean);
CREATE OR REPLACE FUNCTION public.admin_criar_usuario(
  p_email TEXT,
  p_senha TEXT,
  p_nome TEXT,
  p_is_super_admin BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_email_exists BOOLEAN;
BEGIN
  -- Verificar se email ja existe
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE lower(email) = lower(p_email)
  ) INTO v_email_exists;

  IF v_email_exists THEN
    RAISE EXCEPTION 'Email já cadastrado no sistema';
  END IF;

  -- Criar usuario no auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token,
    email_change_token_current, email_change, email_change_token_new,
    email_change_confirm_status, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_sent_at, recovery_sent_at,
    email_change_sent_at, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated', 'authenticated',
    p_email, crypt(p_senha, gen_salt('bf')),
    now(),
    encode(gen_random_bytes(32), 'hex'), '',
    '', '', '', 0, now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('nome', p_nome),
    now(), now(), now(), now(), now(), now(),
    false
  )
  RETURNING id INTO v_user_id;

  -- INSERT em profiles (empresa_id = NULL, single-tenant)
  INSERT INTO public.profiles (id, email, nome, empresa_id, is_super_admin, ativo, role)
  VALUES (v_user_id, p_email, p_nome, NULL, p_is_super_admin, true, 'viewer')
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    is_super_admin = EXCLUDED.is_super_admin,
    ativo = EXCLUDED.ativo;

  -- Criar registro de permissoes vazio
  INSERT INTO public.permissoes (usuario_id, empresa_id)
  VALUES (v_user_id, NULL)
  ON CONFLICT (usuario_id) DO UPDATE SET
    empresa_id = EXCLUDED.empresa_id;

  RETURN v_user_id;
END;
$$;

-- ============================================================
-- 3. admin_deletar_usuario: SEM ALTERAÇÕES
-- (não usa empresa_id — mantém como está)
-- ============================================================

-- ============================================================
-- 4. get_current_empresa_id: JÁ ATUALIZADO NA ETAPA 1
-- (retorna ID fixo da primeira empresa ativa)
-- ============================================================

-- ============================================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================================
DO $$
BEGIN
  -- Verificar handle_new_user
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    RAISE EXCEPTION 'Função handle_new_user não encontrada!';
  END IF;

  -- Verificar admin_criar_usuario (deve ter 4 parâmetros agora)
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'admin_criar_usuario'
    AND array_length(proargtypes, 1) = 4
  ) THEN
    RAISE EXCEPTION 'Função admin_criar_usuario deveria ter 4 parâmetros!';
  END IF;

  -- Verificar que p_empresa_id foi removido
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'admin_criar_usuario'
    AND proargtypes::regtype[] @> ARRAY['text'::regtype, 'text'::regtype, 'text'::regtype, 'uuid'::regtype, 'boolean'::regtype]
  ) THEN
    RAISE EXCEPTION 'Parâmetro p_empresa_id ainda existe em admin_criar_usuario!';
  END IF;

  RAISE NOTICE '✅ RPCs single-tenant verificadas com sucesso';
END $$;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
