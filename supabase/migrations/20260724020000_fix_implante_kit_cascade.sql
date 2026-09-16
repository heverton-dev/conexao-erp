-- ============================================================
-- Garantir ON DELETE CASCADE na FK implante_kit → kits
-- O erro "violates foreign key constraint fk_implante_kit_kit"
-- indica que a constraint antiga (sem CASCADE) persiste no banco,
-- provavelmente engolida pelo EXCEPTION block da migration anterior.
-- ============================================================

DO $$ BEGIN
  ALTER TABLE catalogo_implante_kit
    DROP CONSTRAINT IF EXISTS fk_implante_kit_kit;
  ALTER TABLE catalogo_implante_kit
    ADD CONSTRAINT fk_implante_kit_kit
    FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'fk_implante_kit_kit: %', SQLERRM;
END $$;

-- Garantir também a FK no sentido implante → catalogo_implantes
DO $$ BEGIN
  ALTER TABLE catalogo_implante_kit
    DROP CONSTRAINT IF EXISTS fk_implante_kit_implante;
  ALTER TABLE catalogo_implante_kit
    ADD CONSTRAINT fk_implante_kit_implante
    FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'fk_implante_kit_implante: %', SQLERRM;
END $$;

NOTIFY pgrst, 'reload schema';
