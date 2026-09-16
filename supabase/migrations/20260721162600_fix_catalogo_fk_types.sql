-- Remove antigas FK constraints que podem barrar a mudança de tipo
DO $$
BEGIN
  -- Abutments
  BEGIN ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_chave; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS catalogo_abutments_chave_id_fkey; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_parafuso; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS catalogo_abutments_parafuso_id_fkey; EXCEPTION WHEN OTHERS THEN END;

  -- Componentes
  BEGIN ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS catalogo_componentes_chave_id_fkey; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS fk_componentes_chave; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS fk_componentes_parafuso; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS catalogo_componentes_parafuso_id_fkey; EXCEPTION WHEN OTHERS THEN END;

  -- Parafusos
  BEGIN ALTER TABLE catalogo_parafusos DROP CONSTRAINT IF EXISTS catalogo_parafusos_chave_id_fkey; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_parafusos DROP CONSTRAINT IF EXISTS fk_parafusos_chave; EXCEPTION WHEN OTHERS THEN END;

  -- Cicatrizadores
  BEGIN ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS catalogo_cicatrizadores_chave_id_fkey; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS catalogo_cicatrizadores_implante_id_fkey; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS fk_cicatrizadores_chave; EXCEPTION WHEN OTHERS THEN END;
  BEGIN ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS fk_cicatrizadores_implante; EXCEPTION WHEN OTHERS THEN END;
END $$;

-- Altera o tipo (para comportar SKU em string)
ALTER TABLE catalogo_abutments ALTER COLUMN chave_id TYPE TEXT USING chave_id::TEXT;
ALTER TABLE catalogo_abutments ALTER COLUMN parafuso_id TYPE TEXT USING parafuso_id::TEXT;

ALTER TABLE catalogo_componentes ALTER COLUMN chave_id TYPE TEXT USING chave_id::TEXT;
ALTER TABLE catalogo_componentes ALTER COLUMN parafuso_id TYPE TEXT USING parafuso_id::TEXT;

ALTER TABLE catalogo_parafusos ALTER COLUMN chave_id TYPE TEXT USING chave_id::TEXT;

ALTER TABLE catalogo_cicatrizadores ALTER COLUMN chave_id TYPE TEXT USING chave_id::TEXT;
ALTER TABLE catalogo_cicatrizadores ALTER COLUMN implante_id TYPE TEXT USING implante_id::TEXT;
