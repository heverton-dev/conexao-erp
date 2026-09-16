-- ============================================================
-- Migration: Catálogo — desconto de grupo por categoria + cupom direcionado a grupo
-- (1) catalogo_grupo_desconto_categoria: desconto de grupo escopado por tipo de produto
--     (ex: grupo VIP com desconto agressivo em implantes, grupo laboratório com
--     desconto agressivo em componentes/kits), sem precisar de override por SKU.
-- (2) catalogo_cupons.grupo_id: cupom pode ser global (null) ou restrito a um grupo.
-- Single-tenant — sem empresa_id.
-- ============================================================

CREATE TABLE IF NOT EXISTS catalogo_grupo_desconto_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES catalogo_grupos_clientes(id) ON DELETE CASCADE,
  produto_tipo TEXT NOT NULL,
  desconto_percentual DECIMAL(5,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(grupo_id, produto_tipo)
);

CREATE INDEX IF NOT EXISTS idx_catalogo_grupo_desconto_categoria_grupo ON catalogo_grupo_desconto_categoria(grupo_id);

DO $$
BEGIN
  ALTER TABLE catalogo_cupons ADD COLUMN grupo_id UUID REFERENCES catalogo_grupos_clientes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN
  RAISE NOTICE 'coluna grupo_id já existe em catalogo_cupons';
END $$;

CREATE INDEX IF NOT EXISTS idx_catalogo_cupons_grupo ON catalogo_cupons(grupo_id);

-- RLS aberta (padrão single-tenant do projeto)
DROP POLICY IF EXISTS catalogo_grupo_desconto_categoria_select ON catalogo_grupo_desconto_categoria;
DROP POLICY IF EXISTS catalogo_grupo_desconto_categoria_insert ON catalogo_grupo_desconto_categoria;
DROP POLICY IF EXISTS catalogo_grupo_desconto_categoria_update ON catalogo_grupo_desconto_categoria;
DROP POLICY IF EXISTS catalogo_grupo_desconto_categoria_delete ON catalogo_grupo_desconto_categoria;

ALTER TABLE catalogo_grupo_desconto_categoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_grupo_desconto_categoria_select ON catalogo_grupo_desconto_categoria FOR SELECT USING (true);
CREATE POLICY catalogo_grupo_desconto_categoria_insert ON catalogo_grupo_desconto_categoria FOR INSERT WITH CHECK (true);
CREATE POLICY catalogo_grupo_desconto_categoria_update ON catalogo_grupo_desconto_categoria FOR UPDATE USING (true);
CREATE POLICY catalogo_grupo_desconto_categoria_delete ON catalogo_grupo_desconto_categoria FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
