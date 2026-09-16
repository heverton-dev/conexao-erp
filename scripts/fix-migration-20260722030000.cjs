const { Client } = require('pg');
const fs = require('fs');

const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const ref = env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
const DB_URL = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;

const sql = `
-- Drop existing policies if they exist
DROP POLICY IF EXISTS empresa_select_own ON catalogo_seq_proteticas;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_seq_proteticas;
DROP POLICY IF EXISTS empresa_update_own ON catalogo_seq_proteticas;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_seq_proteticas;

DROP POLICY IF EXISTS empresa_select_own ON catalogo_seq_protetica_abutments;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_seq_protetica_abutments;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_seq_protetica_abutments;

DROP POLICY IF EXISTS empresa_select_own ON catalogo_seq_protetica_etapas;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_seq_protetica_etapas;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_seq_protetica_etapas;

DROP POLICY IF EXISTS empresa_select_own ON catalogo_seq_protetica_componentes;
DROP POLICY IF EXISTS empresa_insert_own ON catalogo_seq_protetica_componentes;
DROP POLICY IF EXISTS empresa_delete_own ON catalogo_seq_protetica_componentes;

-- Recreate tables (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS catalogo_seq_proteticas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sigla text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE catalogo_seq_proteticas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_abutments (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  abutment_sku text NOT NULL REFERENCES catalogo_abutments(sku) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, abutment_sku)
);
ALTER TABLE catalogo_seq_protetica_abutments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_etapas (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  etapa_id uuid NOT NULL REFERENCES catalogo_cps_etapas_workflows(id) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, etapa_id)
);
ALTER TABLE catalogo_seq_protetica_etapas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS catalogo_seq_protetica_componentes (
  seq_id uuid NOT NULL REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE,
  componente_sku text NOT NULL REFERENCES catalogo_componentes(sku) ON DELETE CASCADE,
  PRIMARY KEY (seq_id, componente_sku)
);
ALTER TABLE catalogo_seq_protetica_componentes ENABLE ROW LEVEL SECURITY;

-- Recreate all policies
CREATE POLICY empresa_select_own ON catalogo_seq_proteticas FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_proteticas FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_update_own ON catalogo_seq_proteticas FOR UPDATE USING (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_proteticas FOR DELETE USING (true);

CREATE POLICY empresa_select_own ON catalogo_seq_protetica_abutments FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_abutments FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_abutments FOR DELETE USING (true);

CREATE POLICY empresa_select_own ON catalogo_seq_protetica_etapas FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_etapas FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_etapas FOR DELETE USING (true);

CREATE POLICY empresa_select_own ON catalogo_seq_protetica_componentes FOR SELECT USING (true);
CREATE POLICY empresa_insert_own ON catalogo_seq_protetica_componentes FOR INSERT WITH CHECK (true);
CREATE POLICY empresa_delete_own ON catalogo_seq_protetica_componentes FOR DELETE USING (true);

-- Register migration
INSERT INTO supabase_migrations.schema_migrations (version, statements)
VALUES ('20260722030000', ARRAY['-- Applied via deploy workflow (fixed)']::text[])
ON CONFLICT (version) DO NOTHING;

NOTIFY pgrst, 'reload schema';
`;

(async () => {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log('Migration 20260722030000 aplicada com sucesso (fixed).');
  } catch (e) {
    console.error(`ERRO: ${e.message}`);
    await client.end();
    process.exit(1);
  }
  await client.end();
})();
