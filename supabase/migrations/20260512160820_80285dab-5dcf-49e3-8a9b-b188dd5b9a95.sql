
-- Create missing demo auth users for quick access cards
DO $$
DECLARE
  v_dev_id uuid := '00000000-0000-4000-8000-000000000005';
  v_dir_id uuid := '00000000-0000-4000-8000-000000000006';
  v_pwd text := crypt('Demo@1234', gen_salt('bf'));
BEGIN
  -- demo.dev
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo.dev@conexao.demo') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_dev_id, 'authenticated', 'authenticated',
      'demo.dev@conexao.demo', v_pwd,
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome_completo":"Demo Desenvolvedor","role":"dev"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_dev_id, v_dev_id::text, jsonb_build_object('sub', v_dev_id::text, 'email', 'demo.dev@conexao.demo'), 'email', now(), now(), now());
  END IF;

  -- demo.diretor
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'demo.diretor@conexao.demo') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_dir_id, 'authenticated', 'authenticated',
      'demo.diretor@conexao.demo', v_pwd,
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nome_completo":"Demo Diretor Comercial","role":"diretor_comercial"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_dir_id, v_dir_id::text, jsonb_build_object('sub', v_dir_id::text, 'email', 'demo.diretor@conexao.demo'), 'email', now(), now(), now());
  END IF;

  -- Ensure public.usuarios rows exist with right role
  INSERT INTO public.usuarios (id, nome_completo, email_corporativo, role, ativo)
  VALUES
    (v_dev_id, 'Demo Desenvolvedor', 'demo.dev@conexao.demo', 'dev', true),
    (v_dir_id, 'Demo Diretor Comercial', 'demo.diretor@conexao.demo', 'diretor_comercial', true)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, ativo = true;
END $$;
