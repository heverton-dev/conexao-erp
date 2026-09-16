const fs = require("fs");
const pg = require("C:/Users/trcnologia/Desktop/PROJETOS/proj_erp/supabase-mcp-server/node_modules/pg");

const env = {};
for (const line of fs.readFileSync("C:/Users/trcnologia/Desktop/PROJETOS/proj_erp/.env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const ref = env.VITE_SUPABASE_URL.replace("https://", "").split(".")[0];
const DB_URL = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;

const EMP = '6687e2f0-1ff6-406d-b621-7927764f121a';

const sql = `
-- Tipos de reabilitação
INSERT INTO catalogo_cps_tipos_reabilitacao (id, empresa_id, nome, ativo) VALUES
  ('tr000001-0000-0000-0000-000000000001', '${EMP}', 'Coroa Unitária', true),
  ('tr000001-0000-0000-0000-000000000002', '${EMP}', 'Ponte Unitária', true),
  ('tr000001-0000-0000-0000-000000000003', '${EMP}', 'Overdenture', true)
ON CONFLICT (id) DO NOTHING;

-- Tipos de abutment
INSERT INTO catalogo_cps_tipos_abutments (id, empresa_id, nome, sigla, ativo) VALUES
  ('ta000001-0000-0000-0000-000000000001', '${EMP}', 'Cilíndrico', 'ACIL', true),
  ('ta000001-0000-0000-0000-000000000002', '${EMP}', 'Angulado', 'AANG', true),
  ('ta000001-0000-0000-0000-000000000003', '${EMP}', 'Carga Imediata', 'ACI', true)
ON CONFLICT (id) DO NOTHING;

-- Abutments (com FKs obrigatórios)
INSERT INTO catalogo_abutments (sku, empresa_id, familia_id, tipo_reabilitacao_id, tipo_abutment_id, nome, sigla, diametro_plataforma, angulacao_graus, altura_transmucoso, altura_corpo, torque_ncm, preco, ativo) VALUES
  ('ABU-6687-001', '${EMP}', '88461f97-7583-4a12-b9d8-0c004ba7d2b7', 'tr000001-0000-0000-0000-000000000001', 'ta000001-0000-0000-0000-000000000001', 'Abutment Cilíndrico 3.5', 'ACIL', '3.5', 0, 2.0, 8.0, 25, 189.90, true),
  ('ABU-6687-002', '${EMP}', '88461f97-7583-4a12-b9d8-0c004ba7d2b7', 'tr000001-0000-0000-0000-000000000002', 'ta000001-0000-0000-0000-000000000002', 'Abutment Angulado 15°', 'AANG', '3.5', 15, 2.0, 10.0, 25, 249.90, true)
ON CONFLICT (sku, empresa_id) DO NOTHING;

-- Pivot: Implante <-> Abutments
INSERT INTO catalogo_implante_abutment (empresa_id, implante_sku, abutment_sku) VALUES
  ('${EMP}', 'IMP-IH-6687-001', 'ABU-6687-001'),
  ('${EMP}', 'IMP-IH-6687-001', 'ABU-6687-002')
ON CONFLICT DO NOTHING;

-- Vincular cicatrizadores ao implante
UPDATE catalogo_cicatrizadores
SET implante_id = (SELECT id FROM catalogo_implantes WHERE sku = 'IMP-IH-6687-001' AND empresa_id = '${EMP}')
WHERE sku IN ('CIC-6687-001', 'CIC-6687-002') AND empresa_id = '${EMP}';
`;

(async () => {
  const c = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log("Connected.");
  try {
    await c.query(sql);
    console.log("OK");
  } catch (e) {
    console.log("ERROR:", e.message);
  }
  await c.end();
})();
