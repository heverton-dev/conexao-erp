-- ============================================================
-- Migration 00081: Painel de Manutenção de Módulos/Rotas
-- ============================================================

-- 1. Tabela: modulos_manutencao (multi-tenant)
CREATE TABLE IF NOT EXISTS modulos_manutencao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NULL REFERENCES empresas(id) ON DELETE CASCADE,
  modulo_key TEXT NOT NULL,
  rota TEXT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  mensagem TEXT NOT NULL DEFAULT 'Estamos em manutenção. Voltamos em breve.',
  data_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_fim TIMESTAMPTZ NULL,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN modulos_manutencao.empresa_id IS 'NULL = manutenção GLOBAL (todas as empresas)';
COMMENT ON COLUMN modulos_manutencao.rota IS 'Rota específica (ex.: /nps/dashboard). NULL = módulo inteiro';

-- 2. Índices
CREATE INDEX IF NOT EXISTS modulos_manutencao_empresa_modulo_idx
  ON modulos_manutencao(empresa_id, modulo_key, ativo);
CREATE INDEX IF NOT EXISTS modulos_manutencao_empresa_rota_idx
  ON modulos_manutencao(empresa_id, rota, ativo);
CREATE INDEX IF NOT EXISTS modulos_manutencao_ativo_fim_idx
  ON modulos_manutencao(ativo, data_fim);

-- 3. Funções SECURITY DEFINER para RLS
CREATE OR REPLACE FUNCTION manutencao_minha_empresa()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT empresa_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION manutencao_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(is_super_admin, false) FROM profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION manutencao_minha_empresa() TO authenticated;
GRANT EXECUTE ON FUNCTION manutencao_is_super_admin() TO authenticated;

-- 4. RLS
ALTER TABLE modulos_manutencao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS modulos_manutencao_select ON modulos_manutencao;
CREATE POLICY modulos_manutencao_select ON modulos_manutencao
  FOR SELECT TO authenticated
  USING (empresa_id IS NULL OR empresa_id = manutencao_minha_empresa());

DROP POLICY IF EXISTS modulos_manutencao_insert ON modulos_manutencao;
CREATE POLICY modulos_manutencao_insert ON modulos_manutencao
  FOR INSERT TO authenticated
  WITH CHECK (
    (empresa_id IS NULL AND manutencao_is_super_admin())
    OR (empresa_id = manutencao_minha_empresa())
  );

DROP POLICY IF EXISTS modulos_manutencao_update ON modulos_manutencao;
CREATE POLICY modulos_manutencao_update ON modulos_manutencao
  FOR UPDATE TO authenticated
  USING (
    (empresa_id IS NULL AND manutencao_is_super_admin())
    OR (empresa_id = manutencao_minha_empresa())
  )
  WITH CHECK (
    (empresa_id IS NULL AND manutencao_is_super_admin())
    OR (empresa_id = manutencao_minha_empresa())
  );

DROP POLICY IF EXISTS modulos_manutencao_delete ON modulos_manutencao;
CREATE POLICY modulos_manutencao_delete ON modulos_manutencao
  FOR DELETE TO authenticated
  USING (
    (empresa_id IS NULL AND manutencao_is_super_admin())
    OR (empresa_id = manutencao_minha_empresa())
  );

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON modulos_manutencao TO authenticated;
GRANT ALL ON modulos_manutencao TO service_role;
