-- Migration: Corrigir tipo da coluna sku em catalogo_promocional_itens
-- A coluna foi criada como UUID, mas todo SKU de produto real (kits, implantes,
-- componentes etc.) é TEXT — impedia vincular itens reais a um promocional.

ALTER TABLE catalogo_promocional_itens ALTER COLUMN sku TYPE TEXT;

-- Permitir 'promocional' como produto_tipo em catalogo_imagens_produto,
-- para que promocionais possam ter imagem própria (mesmo padrão dos demais produtos).
ALTER TABLE catalogo_imagens_produto DROP CONSTRAINT catalogo_imagens_produto_produto_tipo_check;
ALTER TABLE catalogo_imagens_produto ADD CONSTRAINT catalogo_imagens_produto_produto_tipo_check
  CHECK (produto_tipo = ANY (ARRAY['implante', 'abutment', 'kit', 'parafuso', 'cicatrizador', 'chave', 'fresa', 'complementar', 'opcional', 'componente', 'promocional']));
