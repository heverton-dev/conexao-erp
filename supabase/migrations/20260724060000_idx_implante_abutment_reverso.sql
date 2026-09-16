-- Índice de suporte para a consulta reversa "implantes compatíveis com um abutment"
-- (a PK composta (implante_sku, abutment_sku) não serve para filtrar por abutment_sku sozinho)
CREATE INDEX IF NOT EXISTS idx_implante_abutment_abutment_sku
  ON catalogo_implante_abutment (abutment_sku);

NOTIFY pgrst, 'reload schema';
