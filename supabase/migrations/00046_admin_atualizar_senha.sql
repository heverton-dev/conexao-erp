-- ============================================================
-- 00046_admin_atualizar_senha.sql
-- RPC para admin atualizar senha de credencial
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_atualizar_senha(
  p_user_id uuid,
  p_nova_senha text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt(p_nova_senha, gen_salt('bf'))
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
END;
$$;

-- Garante que apenas admins possam chamar
GRANT EXECUTE ON FUNCTION public.admin_atualizar_senha(uuid, text) TO service_role;
