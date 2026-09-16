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

(async () => {
  const c = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log("Connected.");

  // 1. Tipos de reabilitação
  try {
    await c.query(`INSERT INTO catalogo_cps_tipos_reabilitacao (id, empresa_id, nome, ativo) VALUES (gen_random_uuid(), $1, 'Coroa Unitária', true), (gen_random_uuid(), $1, 'Ponte Unitária', true), (gen_random_uuid(), $1, 'Overdenture', true) ON CONFLICT DO NOTHING`, [EMP]);
    console.log("tipos_reabilitacao: OK");
  } catch (e) { console.log("tipos_reabilitacao:", e.message); }

  // 2. Buscar IDs criados
  const tr = await c.query("SELECT id, nome FROM catalogo_cps_tipos_reabilitacao WHERE empresa_id = $1", [EMP]);
  const trMap = {};
  for (const row of tr.rows) trMap[row.nome] = row.id;
  console.log("TR IDs:", JSON.stringify(trMap));

  // 3. Tipos de abutment
  try {
    await c.query(`INSERT INTO catalogo_cps_tipos_abutments (id, empresa_id, nome, sigla, ativo) VALUES (gen_random_uuid(), $1, 'Cilíndrico', 'ACIL', true), (gen_random_uuid(), $1, 'Angulado', 'AANG', true), (gen_random_uuid(), $1, 'Carga Imediata', 'ACI', true) ON CONFLICT DO NOTHING`, [EMP]);
    console.log("tipos_abutment: OK");
  } catch (e) { console.log("tipos_abutment:", e.message); }

  const ta = await c.query("SELECT id, nome FROM catalogo_cps_tipos_abutments WHERE empresa_id = $1", [EMP]);
  const taMap = {};
  for (const row of ta.rows) taMap[row.nome] = row.id;
  console.log("TA IDs:", JSON.stringify(taMap));

  // 4. Abutments
  try {
    const trCoroa = trMap['Coroa Unitária'];
    const trPonte = trMap['Ponte Unitária'];
    const taCil = taMap['Cilíndrico'];
    const taAng = taMap['Angulado'];
    await c.query(`INSERT INTO catalogo_abutments (sku, empresa_id, familia_id, tipo_reabilitacao_id, tipo_abutment_id, nome, sigla, diametro_plataforma, angulacao_graus, altura_transmucoso, altura_corpo, torque_ncm, preco, ativo) VALUES ($1, $2, '88461f97-7583-4a12-b9d8-0c004ba7d2b7', $3, $4, 'Abutment Cilíndrico 3.5', 'ACIL', '3.5', 0, 2.0, 8.0, 25, 189.90, true), ($5, $2, '88461f97-7583-4a12-b9d8-0c004ba7d2b7', $6, $7, 'Abutment Angulado 15°', 'AANG', '3.5', 15, 2.0, 10.0, 25, 249.90, true) ON CONFLICT (sku, empresa_id) DO NOTHING`, ['ABU-6687-001', EMP, trCoroa, taCil, 'ABU-6687-002', trPonte, taAng]);
    console.log("abutments: OK");
  } catch (e) { console.log("abutments:", e.message); }

  // 5. Pivot: Implante <-> Abutments
  try {
    await c.query(`INSERT INTO catalogo_implante_abutment (empresa_id, implante_sku, abutment_sku) VALUES ($1, 'IMP-IH-6687-001', 'ABU-6687-001'), ($1, 'IMP-IH-6687-001', 'ABU-6687-002') ON CONFLICT DO NOTHING`, [EMP]);
    console.log("implante_abutment: OK");
  } catch (e) { console.log("implante_abutment:", e.message); }

  // 6. Vincular cicatrizadores
  try {
    await c.query(`UPDATE catalogo_cicatrizadores SET implante_id = (SELECT id FROM catalogo_implantes WHERE sku = 'IMP-IH-6687-001' AND empresa_id = $1) WHERE sku IN ('CIC-6687-001', 'CIC-6687-002') AND empresa_id = $1`, [EMP]);
    console.log("cicatrizadores vinculados: OK");
  } catch (e) { console.log("cicatrizadores:", e.message); }

  await c.end();
  console.log("\nDone.");
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
