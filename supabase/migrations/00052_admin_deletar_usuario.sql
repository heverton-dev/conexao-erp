-- ============================================================
-- 00052_admin_deletar_usuario.sql
-- RPC para admin deletar credencial completa (auth + profiles + permissoes)
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_deletar_usuario(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar permissoes
  DELETE FROM public.permissoes WHERE usuario_id = p_user_id;
  -- Deletar profile
  DELETE FROM public.profiles WHERE id = p_user_id;
  -- Deletar usuario auth (precisa service_role)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_deletar_usuario(uuid) TO service_role;
