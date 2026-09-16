-- Corrigir RLS policy para catalogo_imagens_produto
-- Sistema single-tenant: acesso livre

DROP POLICY IF EXISTS catalogo_imagens_produto_empresa ON catalogo_imagens_produto;

CREATE POLICY catalogo_imagens_produto_empresa ON catalogo_imagens_produto
  FOR ALL USING (true) WITH CHECK (true);
