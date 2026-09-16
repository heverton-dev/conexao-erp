-- ============================================================
-- Migration: Vincula orçamento/pedido ao cliente da carteira do CRM
-- (tabela clientes), independente de credencial de login na loja
-- (catalogo_clientes.cliente_id continua exclusivo pra quem loga sozinho).
-- ============================================================

DO $$
BEGIN
  ALTER TABLE catalogo_orcamentos ADD COLUMN cliente_crm_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna cliente_crm_id já existe em catalogo_orcamentos';
END $$;

DO $$
BEGIN
  ALTER TABLE catalogo_pedidos ADD COLUMN cliente_crm_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna cliente_crm_id já existe em catalogo_pedidos';
END $$;

CREATE INDEX IF NOT EXISTS idx_catalogo_orcamentos_cliente_crm ON catalogo_orcamentos(cliente_crm_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_pedidos_cliente_crm ON catalogo_pedidos(cliente_crm_id);

NOTIFY pgrst, 'reload schema';
