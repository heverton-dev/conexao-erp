-- Tabela unificada de imagens de produtos do catálogo
-- Suporta implante, abutment e kit com múltiplas imagens e ordenação

CREATE TABLE catalogo_imagens_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  produto_tipo TEXT NOT NULL CHECK (produto_tipo IN ('implante', 'abutment', 'kit')),
  produto_sku TEXT NOT NULL,
  url_imagem TEXT NOT NULL,
  fonte TEXT NOT NULL DEFAULT 'upload' CHECK (fonte IN ('upload', 'url', 'gdrive')),
  ordem_exibicao INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Migrar dados existentes de catalogo_imagens_implante (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'catalogo_imagens_implante') THEN
    INSERT INTO catalogo_imagens_produto (empresa_id, produto_tipo, produto_sku, url_imagem, ordem_exibicao, created_at)
    SELECT empresa_id, 'implante', implante_sku::TEXT, url_imagem, ordem_exibicao, created_at
    FROM catalogo_imagens_implante;
  END IF;
END $$;

-- RLS policies
ALTER TABLE catalogo_imagens_produto ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_imagens_produto_empresa ON catalogo_imagens_produto
  FOR ALL USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Índices para performance
CREATE INDEX idx_catalogo_imagens_produto_sku ON catalogo_imagens_produto (empresa_id, produto_tipo, produto_sku);
CREATE INDEX idx_catalogo_imagens_produto_ordem ON catalogo_imagens_produto (empresa_id, produto_tipo, produto_sku, ordem_exibicao);

-- Bucket no Supabase Storage: catalogo-imagens
-- Criar via Dashboard: Storage > New Bucket > nome: catalogo-imagens, public: true
-- OU via CLI: supabase storage create-bucket catalogo-imagens --public
