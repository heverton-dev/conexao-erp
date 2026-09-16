-- ============================================================
-- Migration 00035: Módulo Mapas Interativos
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE mapas_dist_category AS ENUM ('EXCLUSIVE', 'NON_EXCLUSIVE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabela: mapas_distributors
CREATE TABLE IF NOT EXISTS mapas_distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  category mapas_dist_category NOT NULL DEFAULT 'NON_EXCLUSIVE',
  city TEXT,
  state TEXT NOT NULL,
  pin_color TEXT DEFAULT '#4169e1',
  pin_image_url TEXT,
  lat DECIMAL,
  lng DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: mapas_consultants
CREATE TABLE IF NOT EXISTS mapas_consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  registration TEXT,
  name TEXT NOT NULL,
  region TEXT,
  state TEXT NOT NULL,
  supervisor TEXT,
  pin_color TEXT DEFAULT '#4169e1',
  pin_image_url TEXT,
  lat DECIMAL,
  lng DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS mapas_distributors_set_updated_at ON mapas_distributors;
CREATE TRIGGER mapas_distributors_set_updated_at
  BEFORE UPDATE ON mapas_distributors FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS mapas_consultants_set_updated_at ON mapas_consultants;
CREATE TRIGGER mapas_consultants_set_updated_at
  BEFORE UPDATE ON mapas_consultants FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS mapas_distributors_empresa_idx ON mapas_distributors(empresa_id);
CREATE INDEX IF NOT EXISTS mapas_distributors_state_idx ON mapas_distributors(state);
CREATE INDEX IF NOT EXISTS mapas_consultants_empresa_idx ON mapas_consultants(empresa_id);
CREATE INDEX IF NOT EXISTS mapas_consultants_state_idx ON mapas_consultants(state);

-- RLS
ALTER TABLE mapas_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapas_consultants ENABLE ROW LEVEL SECURITY;

-- Policies: SELECT público
DROP POLICY IF EXISTS mapas_distributors_select_public ON mapas_distributors;
CREATE POLICY mapas_distributors_select_public ON mapas_distributors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS mapas_consultants_select_public ON mapas_consultants;
CREATE POLICY mapas_consultants_select_public ON mapas_consultants
  FOR SELECT USING (true);

-- Policies: ALL para autenticados (controle via app permissions)
DROP POLICY IF EXISTS mapas_distributors_all_authenticated ON mapas_distributors;
CREATE POLICY mapas_distributors_insert_authenticated ON mapas_distributors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY mapas_distributors_update_authenticated ON mapas_distributors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY mapas_distributors_delete_authenticated ON mapas_distributors FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS mapas_consultants_all_authenticated ON mapas_consultants;
CREATE POLICY mapas_consultants_insert_authenticated ON mapas_consultants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY mapas_consultants_update_authenticated ON mapas_consultants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY mapas_consultants_delete_authenticated ON mapas_consultants FOR DELETE TO authenticated USING (true);

-- Grants
GRANT SELECT ON mapas_distributors TO anon, authenticated;
GRANT ALL ON mapas_distributors TO authenticated;
GRANT ALL ON mapas_distributors TO service_role;

GRANT SELECT ON mapas_consultants TO anon, authenticated;
GRANT ALL ON mapas_consultants TO authenticated;
GRANT ALL ON mapas_consultants TO service_role;
