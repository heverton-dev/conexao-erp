-- Corrigir RLS policy de catalogo_imagens_produto
-- A policy anterior comparava empresa_id com auth.uid() (ID do usuário),
-- mas empresa_id é o ID da empresa, não do usuário.
-- A correta deve verificar se o usuário pertence à empresa via tabela profiles.

DROP POLICY IF EXISTS catalogo_imagens_produto_empresa ON catalogo_imagens_produto;

CREATE POLICY catalogo_imagens_produto_empresa ON catalogo_imagens_produto
  FOR ALL USING (
    empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );
