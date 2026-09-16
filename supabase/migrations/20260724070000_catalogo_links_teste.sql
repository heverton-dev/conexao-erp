-- Links de teste do catálogo: super admin gera links com token, define nível de
-- acesso (visitante sem login ou usuário logado) e opcionalmente expiração/limite
-- de usos. Tabela de acessos separada guarda o histórico de cada uso do link.

CREATE TABLE IF NOT EXISTS catalogo_links_teste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  nivel_acesso TEXT NOT NULL CHECK (nivel_acesso IN ('visitante', 'logado')),
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  max_usos INT,
  usos INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalogo_links_teste_acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES catalogo_links_teste(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_agent TEXT,
  acessado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_teste_acessos_link_id ON catalogo_links_teste_acessos (link_id);

ALTER TABLE catalogo_links_teste ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_links_teste_acessos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_links_teste ON catalogo_links_teste;
CREATE POLICY select_links_teste ON catalogo_links_teste FOR SELECT USING (true);
DROP POLICY IF EXISTS insert_links_teste ON catalogo_links_teste;
CREATE POLICY insert_links_teste ON catalogo_links_teste FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS update_links_teste ON catalogo_links_teste;
CREATE POLICY update_links_teste ON catalogo_links_teste FOR UPDATE USING (true);
DROP POLICY IF EXISTS delete_links_teste ON catalogo_links_teste;
CREATE POLICY delete_links_teste ON catalogo_links_teste FOR DELETE USING (true);

DROP POLICY IF EXISTS select_links_teste_acessos ON catalogo_links_teste_acessos;
CREATE POLICY select_links_teste_acessos ON catalogo_links_teste_acessos FOR SELECT USING (true);
DROP POLICY IF EXISTS insert_links_teste_acessos ON catalogo_links_teste_acessos;
CREATE POLICY insert_links_teste_acessos ON catalogo_links_teste_acessos FOR INSERT WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
