-- ============================================================
-- 20260724000000_create_perfis_rbac.sql
-- RBAC relacional: perfis reutilizáveis (roles) + junções.
--
-- ADITIVO: não remove nem altera a tabela `permissoes` existente
-- (00010_permissoes.sql). A partir de agora `permissoes.permissoes`
-- passa a ser tratada, no código, como camada de OVERRIDE por
-- usuário — a fonte "de base" de permissões passa a ser o(s)
-- perfil(is) atribuído(s) via `usuario_perfis`. Ver migration
-- subsequente 20260724010000_seed_perfis_fabrica.sql para a
-- migração de dados (perfis de fábrica + atribuição por ambiente).
-- ============================================================

-- 1. Perfis (roles reutilizáveis)
CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  is_sistema boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE perfis IS 'Perfis (roles) reutilizáveis de RBAC. is_sistema=true = perfil de fábrica, não excluível pela UI.';

-- 2. Junção perfil -> permissão (mesma string-chave do jsonb permissoes.permissoes)
CREATE TABLE IF NOT EXISTS perfis_permissoes (
  perfil_id uuid NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  permissao_key text NOT NULL,
  PRIMARY KEY (perfil_id, permissao_key)
);

COMMENT ON TABLE perfis_permissoes IS 'Permissões concedidas por perfil. Presença da linha = concessão (true). Ausência = não concede (mas não bloqueia override).';

-- 3. Junção usuário -> perfil (múltiplos perfis por usuário)
CREATE TABLE IF NOT EXISTS usuario_perfis (
  usuario_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  perfil_id uuid NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  PRIMARY KEY (usuario_id, perfil_id)
);

COMMENT ON TABLE usuario_perfis IS 'Atribuição de perfis (roles) a usuários. Um usuário pode ter múltiplos perfis; permissão efetiva = união de todos.';

-- 4. Índices de apoio
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_usuario ON usuario_perfis(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_perfis_perfil ON usuario_perfis(perfil_id);
CREATE INDEX IF NOT EXISTS idx_perfis_permissoes_perfil ON perfis_permissoes(perfil_id);

-- 5. RLS (padrão atual do projeto: single-tenant, aberta)
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS perfis_select ON perfis;
DROP POLICY IF EXISTS perfis_insert ON perfis;
DROP POLICY IF EXISTS perfis_update ON perfis;
DROP POLICY IF EXISTS perfis_delete ON perfis;

CREATE POLICY perfis_select ON perfis FOR SELECT USING (true);
CREATE POLICY perfis_insert ON perfis FOR INSERT WITH CHECK (true);
CREATE POLICY perfis_update ON perfis FOR UPDATE USING (true);
CREATE POLICY perfis_delete ON perfis FOR DELETE USING (true);

DROP POLICY IF EXISTS perfis_permissoes_select ON perfis_permissoes;
DROP POLICY IF EXISTS perfis_permissoes_insert ON perfis_permissoes;
DROP POLICY IF EXISTS perfis_permissoes_update ON perfis_permissoes;
DROP POLICY IF EXISTS perfis_permissoes_delete ON perfis_permissoes;

CREATE POLICY perfis_permissoes_select ON perfis_permissoes FOR SELECT USING (true);
CREATE POLICY perfis_permissoes_insert ON perfis_permissoes FOR INSERT WITH CHECK (true);
CREATE POLICY perfis_permissoes_update ON perfis_permissoes FOR UPDATE USING (true);
CREATE POLICY perfis_permissoes_delete ON perfis_permissoes FOR DELETE USING (true);

DROP POLICY IF EXISTS usuario_perfis_select ON usuario_perfis;
DROP POLICY IF EXISTS usuario_perfis_insert ON usuario_perfis;
DROP POLICY IF EXISTS usuario_perfis_update ON usuario_perfis;
DROP POLICY IF EXISTS usuario_perfis_delete ON usuario_perfis;

CREATE POLICY usuario_perfis_select ON usuario_perfis FOR SELECT USING (true);
CREATE POLICY usuario_perfis_insert ON usuario_perfis FOR INSERT WITH CHECK (true);
CREATE POLICY usuario_perfis_update ON usuario_perfis FOR UPDATE USING (true);
CREATE POLICY usuario_perfis_delete ON usuario_perfis FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
