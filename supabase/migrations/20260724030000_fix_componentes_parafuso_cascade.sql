-- ============================================================
-- Garantir ON DELETE SET NULL nas FKs parafuso_id → catalogo_parafusos
-- Erro: "update or delete on table catalogo_parafusos violates foreign
-- key constraint fk_componentes_parafuso on table catalogo_componentes"
-- indica que a constraint viva no banco não tem ON DELETE SET NULL,
-- mesmo a migration 20260722000000 declarando isso (drift, mesmo
-- padrão do fix_implante_kit_cascade).
-- ============================================================

ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS fk_componentes_parafuso;
ALTER TABLE catalogo_componentes
  ADD CONSTRAINT fk_componentes_parafuso
  FOREIGN KEY (parafuso_id) REFERENCES catalogo_parafusos(sku) ON DELETE SET NULL;

ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_parafuso;
ALTER TABLE catalogo_abutments
  ADD CONSTRAINT fk_abutments_parafuso
  FOREIGN KEY (parafuso_id) REFERENCES catalogo_parafusos(sku) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
