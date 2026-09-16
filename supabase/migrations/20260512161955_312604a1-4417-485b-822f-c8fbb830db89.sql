
DO $$
DECLARE
  v_ids uuid[] := ARRAY[
    '00000000-0000-4000-8000-0000000000b0',
    '00000000-0000-4000-8000-0000000000a2',
    '00000000-0000-4000-8000-0000000000a3',
    '00000000-0000-4000-8000-0000000000b1',
    '00000000-0000-4000-8000-0000000000b2',
    '00000000-0000-4000-8000-0000000000b3',
    '00000000-0000-4000-8000-0000000000b4'
  ]::uuid[];
  v_emails text[] := ARRAY[
    'beatriz.lima@conexao.demo',
    'ana.souza@conexao.demo',
    'arthur.mendes@conexao.demo',
    'bruno.castro@conexao.demo',
    'bianca.rocha@conexao.demo',
    'bernardo.alves@conexao.demo',
    'beatriz.nunes@conexao.demo'
  ];
  v_pw text := crypt('Cx!Demo-2026-Impl@7Qv9#R2', gen_salt('bf'));
  i int;
BEGIN
  FOR i IN 1..array_length(v_ids,1) LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_ids[i], 'authenticated', 'authenticated',
      v_emails[i], v_pw, now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, false
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_ids[i],
      jsonb_build_object('sub', v_ids[i]::text, 'email', v_emails[i], 'email_verified', true),
      'email', v_ids[i]::text, now(), now(), now()
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
