-- ============================================================
-- Migration: Vincula cliente da carteira do CRM (tabela clientes)
-- ao grupo de desconto do catálogo (catalogo_grupos_clientes).
-- Permite que o consultor monte orçamento/pedido pra um cliente
-- da carteira dele com desconto de grupo aplicado automaticamente,
-- sem exigir que esse cliente tenha login na loja (catalogo_clientes).
-- ============================================================

DO $$
BEGIN
  ALTER TABLE clientes ADD COLUMN grupo_id UUID REFERENCES catalogo_grupos_clientes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna grupo_id já existe em clientes';
END $$;

CREATE INDEX IF NOT EXISTS idx_clientes_grupo ON clientes(grupo_id);

NOTIFY pgrst, 'reload schema';
