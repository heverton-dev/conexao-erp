-- Tabela de junção: Kits Complementares (kit → kit)
CREATE TABLE IF NOT EXISTS catalogo_kit_kits_complementares (
  kit_sku TEXT NOT NULL REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  complementar_sku TEXT NOT NULL REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  PRIMARY KEY (kit_sku, complementar_sku)
);

-- Tabela de junção: Kits Relacionados (kit → kit)
CREATE TABLE IF NOT EXISTS catalogo_kit_kits_relacionados (
  kit_sku TEXT NOT NULL REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  relacionado_sku TEXT NOT NULL REFERENCES catalogo_kits(sku) ON DELETE CASCADE,
  PRIMARY KEY (kit_sku, relacionado_sku)
);

-- RLS: permitir acesso via empresa_id do kit pai
ALTER TABLE catalogo_kit_kits_complementares ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_kit_kits_relacionados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kit_kits_complementares_select" ON catalogo_kit_kits_complementares;
DROP POLICY IF EXISTS "kit_kits_complementares_insert" ON catalogo_kit_kits_complementares;
DROP POLICY IF EXISTS "kit_kits_complementares_delete" ON catalogo_kit_kits_complementares;
DROP POLICY IF EXISTS "kit_kits_relacionados_select" ON catalogo_kit_kits_relacionados;
DROP POLICY IF EXISTS "kit_kits_relacionados_insert" ON catalogo_kit_kits_relacionados;
DROP POLICY IF EXISTS "kit_kits_relacionados_delete" ON catalogo_kit_kits_relacionados;

CREATE POLICY "kit_kits_complementares_select" ON catalogo_kit_kits_complementares
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM catalogo_kits k WHERE k.sku = kit_sku)
  );
CREATE POLICY "kit_kits_complementares_insert" ON catalogo_kit_kits_complementares
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM catalogo_kits k WHERE k.sku = kit_sku)
  );
CREATE POLICY "kit_kits_complementares_delete" ON catalogo_kit_kits_complementares
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM catalogo_kits k WHERE k.sku = kit_sku)
  );

CREATE POLICY "kit_kits_relacionados_select" ON catalogo_kit_kits_relacionados
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM catalogo_kits k WHERE k.sku = kit_sku)
  );
CREATE POLICY "kit_kits_relacionados_insert" ON catalogo_kit_kits_relacionados
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM catalogo_kits k WHERE k.sku = kit_sku)
  );
CREATE POLICY "kit_kits_relacionados_delete" ON catalogo_kit_kits_relacionados
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM catalogo_kits k WHERE k.sku = kit_sku)
  );
