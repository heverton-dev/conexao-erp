-- ============================================================
-- 20260704000000_refatoracao_core.sql
-- Refatoração do CORE do banco de dados
-- Adaptado para a estrutura REAL do banco
-- ============================================================

-- 1. Criar tabela empresa_role_limits (limites de credenciais por ROLE por empresa)
CREATE TABLE IF NOT EXISTS public.empresa_role_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  role text NOT NULL,
  max_credenciais integer NOT NULL DEFAULT 999,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, role)
);

ALTER TABLE public.empresa_role_limits ENABLE ROW LEVEL SECURITY;

-- RLS: Super admin pode tudo
CREATE POLICY "empresa_role_limits_super_admin_all"
  ON public.empresa_role_limits FOR ALL
  USING (is_super_admin_session());

-- RLS: Admin da empresa pode ver seus limites
CREATE POLICY "empresa_role_limits_empresa_select"
  ON public.empresa_role_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.empresa_id = empresa_role_limits.empresa_id
        AND profiles.role = 'admin'
    )
  );

-- 2. Adicionar colunas facebook e tiktok na tabela empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS tiktok text;

-- 3. Seed: Limites padrão por role para empresas existentes
INSERT INTO public.empresa_role_limits (empresa_id, role, max_credenciais)
SELECT id, 'admin', 3 FROM public.empresas
ON CONFLICT (empresa_id, role) DO NOTHING;

INSERT INTO public.empresa_role_limits (empresa_id, role, max_credenciais)
SELECT id, 'colaborador', 50 FROM public.empresas
ON CONFLICT (empresa_id, role) DO NOTHING;

INSERT INTO public.empresa_role_limits (empresa_id, role, max_credenciais)
SELECT id, 'parceiro', 20 FROM public.empresas
ON CONFLICT (empresa_id, role) DO NOTHING;

INSERT INTO public.empresa_role_limits (empresa_id, role, max_credenciais)
SELECT id, 'cliente', 100 FROM public.empresas
ON CONFLICT (empresa_id, role) DO NOTHING;

-- 4. Função: contar credenciais por role na empresa
CREATE OR REPLACE FUNCTION public.count_credenciais_by_empresa_role(
  p_empresa_id uuid,
  p_role text
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.profiles p
  WHERE p.empresa_id = p_empresa_id
    AND p.role = p_role
    AND (p.ativo = true OR p.ativo IS NULL);
$$;

-- 5. Função: verificar se empresa atingiu o limite de um role
CREATE OR REPLACE FUNCTION public.check_empresa_role_limit(
  p_empresa_id uuid,
  p_role text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.empresa_role_limits
    WHERE empresa_id = p_empresa_id
      AND role = p_role
      AND max_credenciais > 0
      AND public.count_credenciais_by_empresa_role(empresa_id, role) >= max_credenciais
  );
$$;

GRANT EXECUTE ON FUNCTION public.count_credenciais_by_empresa_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_empresa_role_limit(uuid, text) TO authenticated;
