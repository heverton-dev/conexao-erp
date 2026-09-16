-- ============================================================
-- 00049_empresa_modulo_limits.sql
-- Limites de credenciais por MODULO para cada empresa
-- ============================================================

-- Remover tabela antiga se existir
DROP TABLE IF EXISTS public.empresa_role_limits;

-- Tabela de limites por módulo
CREATE TABLE IF NOT EXISTS public.empresa_modulo_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  modulo_key text NOT NULL,
  max_credenciais integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(empresa_id, modulo_key)
);

ALTER TABLE public.empresa_modulo_limits ENABLE ROW LEVEL SECURITY;

-- Super admin pode tudo
CREATE POLICY "empresa_modulo_limits_super_admin_all"
  ON public.empresa_modulo_limits FOR ALL
  USING (is_super_admin_session());

-- Admin da empresa pode ver seus limites
CREATE POLICY "empresa_modulo_limits_empresa_select"
  ON public.empresa_modulo_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.empresa_id = empresa_modulo_limits.empresa_id
        AND profiles.role = 'admin'
    )
  );

-- Funcao: contar credenciais com acesso a um modulo na empresa
-- modulos_acesso eh um JSONB no formato: { "hub-conexao": { "acessar": true, "paginas": [...], "acoes": [...] } }
CREATE OR REPLACE FUNCTION public.count_credenciais_by_empresa_modulo(
  p_empresa_id uuid,
  p_modulo_key text
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.profiles p
  JOIN public.permissoes pm ON pm.usuario_id = p.id
  WHERE p.empresa_id = p_empresa_id
    AND (p.ativo = true OR p.ativo IS NULL)
    AND pm.modulos_acesso -> p_modulo_key -> 'acessar' = to_jsonb(true);
$$;

-- Funcao: verificar se empresa atingiu o limite de um modulo
CREATE OR REPLACE FUNCTION public.check_empresa_modulo_limit(
  p_empresa_id uuid,
  p_modulo_key text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.empresa_modulo_limits
    WHERE empresa_id = p_empresa_id
      AND modulo_key = p_modulo_key
      AND max_credenciais > 0
      AND public.count_credenciais_by_empresa_modulo(empresa_id, modulo_key) >= max_credenciais
  );
$$;

GRANT EXECUTE ON FUNCTION public.count_credenciais_by_empresa_modulo(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_empresa_modulo_limit(uuid, text) TO authenticated;
