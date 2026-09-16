-- Migration: Adicionar tipo de preço e desconto por produto no grupo
-- Permite que cada produto dentro de um grupo tenha seu próprio modo de desconto (fixo ou percentual)

ALTER TABLE catalogo_grupo_precos
  ADD COLUMN IF NOT EXISTS preco_tipo TEXT NOT NULL DEFAULT 'fixo'
  CHECK (preco_tipo IN ('fixo', 'percentual'));

ALTER TABLE catalogo_grupo_precos
  ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC DEFAULT 0;

COMMENT ON COLUMN catalogo_grupo_precos.preco_tipo IS 'Modo de desconto: fixo (preço final) ou percentual (% de desconto sobre base)';
COMMENT ON COLUMN catalogo_grupo_precos.desconto_percentual IS 'Percentual de desconto quando preco_tipo = percentual';
