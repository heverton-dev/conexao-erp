-- ============================================================
-- 00047_admin_criar_usuario.sql
-- RPC para admin criar usuario com confirmacao de email automatica
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
BEGIN
  -- Criar usuario no auth.users com email ja confirmado
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

  -- Criar profile vinculado
  INSERT INTO public.profiles (id, nome, email, empresa_id, is_super_admin, ativo)
  VALUES (v_user_id, p_nome, p_email, p_empresa_id, p_is_super_admin, true);

  RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_criar_usuario(text, text, text, uuid, boolean) TO service_role;
