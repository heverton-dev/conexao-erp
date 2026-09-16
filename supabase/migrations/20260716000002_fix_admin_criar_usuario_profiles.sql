-- ============================================================
-- Fix: admin_criar_usuario deve INSERT em profiles diretamente
-- O trigger handle_new_user() cria em usuarios, NAO em profiles.
-- O UPDATE anterior afetava 0 rows.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_criar_usuario(
  p_email text,
  p_senha text,
  p_nome text,
  p_empresa_id uuid DEFAULT NULL,
  p_is_super_admin boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_email_exists boolean;
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
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change,
    email_change_token_new,
    email_change_confirm_status,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_sent_at,
    recovery_sent_at,
    email_change_sent_at,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_senha, gen_salt('bf')),
    now(),
    encode(gen_random_bytes(32), 'hex'),
    '',
    '',
    '',
    '',
    0,
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('nome', p_nome),
    now(),
    now(),
    now(),
    now(),
    now(),
    false
  )
  RETURNING id INTO v_user_id;

  -- INSERT direto em profiles (o trigger so cria em usuarios)
  INSERT INTO public.profiles (id, email, nome, empresa_id, is_super_admin, ativo, role)
  VALUES (v_user_id, p_email, p_nome, p_empresa_id, p_is_super_admin, true, 'viewer')
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    empresa_id = EXCLUDED.empresa_id,
    is_super_admin = EXCLUDED.is_super_admin,
    ativo = EXCLUDED.ativo;

  -- Criar registro de permissoes vazio para o usuario
  INSERT INTO public.permissoes (usuario_id, empresa_id)
  VALUES (v_user_id, p_empresa_id)
  ON CONFLICT (usuario_id) DO UPDATE SET
    empresa_id = EXCLUDED.empresa_id;

  RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_criar_usuario(text, text, text, uuid, boolean) TO service_role;
