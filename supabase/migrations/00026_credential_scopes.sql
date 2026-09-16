-- Adiciona coluna escopos (jsonb) à tabela credenciais
-- Permite escopar credenciais por módulo + abas
-- Formato: [{ "modulo": "cadastros-conexao", "abas": ["geral", "permissoes"] }]

ALTER TABLE credenciais
ADD COLUMN IF NOT EXISTS escopos jsonb DEFAULT '[]'::jsonb;

-- Atualizar RLS para filtrar por escopo
-- A função de helper já existe, mas precisamos de uma policy que filtre por escopo
-- Se o usuário é super admin, vê tudo
-- Se não, vê apenas credenciais sem escopo OU que tenham escopo para seu módulo

CREATE POLICY "Usuarios podem ver credenciais do seu escopo" ON credenciais
  FOR SELECT
  TO authenticated
  USING (
    is_super_admin_session()
    OR
    escopos = '[]'::jsonb
    OR
    escopos @> '[{"modulo": "cadastros-conexao"}]'::jsonb
  );
