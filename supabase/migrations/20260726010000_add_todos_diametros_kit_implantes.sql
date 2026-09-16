-- ============================================================
-- Adiciona coluna todos_diametros na tabela catalogo_kit_implantes
-- ============================================================
-- Data: 2026-07-26
-- Descrição: Quando todos_diametros=true, o kit é compatível com
--            todos os implantes (sentinela implante_sku='*')

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalogo_kit_implantes') THEN
    ALTER TABLE catalogo_kit_implantes ADD COLUMN IF NOT EXISTS todos_diametros BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna todos_diametros adicionada em catalogo_kit_implantes';
  END IF;
END $$;
