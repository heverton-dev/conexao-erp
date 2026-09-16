-- Tracking de cliques para links gerados
CREATE TABLE IF NOT EXISTS gerador_link_cliques (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id uuid NOT NULL REFERENCES gerador_links(id) ON DELETE CASCADE,
  clique_em timestamptz DEFAULT now(),
  user_agent text,
  ip text,
  ref text
);

CREATE INDEX IF NOT EXISTS idx_gerador_link_cliques_link_id ON gerador_link_cliques(link_id);
CREATE INDEX IF NOT EXISTS idx_gerador_link_cliques_clique_em ON gerador_link_cliques(clique_em);

ALTER TABLE gerador_link_cliques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa ve cliques dos seus links"
  ON gerador_link_cliques FOR SELECT
  USING (
    link_id IN (
      SELECT id FROM gerador_links
      WHERE empresa_id = get_current_empresa_id()
    )
  );

CREATE POLICY "super_admin ve todos cliques"
  ON gerador_link_cliques FOR SELECT
  USING (auth.jwt() ->> 'is_super_admin' = 'true');

-- RPC para registrar clique (SECURITY DEFINER = roda como owner, bypassa RLS)
CREATE OR REPLACE FUNCTION registrar_clique(
  p_link_id uuid,
  p_user_agent text DEFAULT NULL,
  p_ip text DEFAULT NULL,
  p_ref text DEFAULT NULL
)
RETURNS TABLE(redirect_url text, tipo_link text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO gerador_link_cliques (link_id, user_agent, ip, ref)
  VALUES (p_link_id, p_user_agent, p_ip, p_ref);

  UPDATE gerador_links SET ultimo_clique = now() WHERE id = p_link_id;

  RETURN QUERY
  SELECT url, tipo FROM gerador_links WHERE id = p_link_id;
END;
$$;

-- Adicionar coluna ultimo_clique (se ainda não existir)
ALTER TABLE gerador_links ADD COLUMN IF NOT EXISTS ultimo_clique timestamptz;
