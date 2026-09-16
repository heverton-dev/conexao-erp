const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const ref = env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
const DB_URL = `postgresql://postgres:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@db.${ref}.supabase.co:5432/postgres`;

const targetMigrations = [
  '20260722020000_abutment_composicao_n_m.sql',
  '20260722030000_seq_proteticas.sql',
];

(async () => {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  for (const file of targetMigrations) {
    const version = file.split('_')[0];
    const check = await client.query(
      'SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = $1',
      [version]
    );
    if (check.rows.length > 0) {
      console.log(`SKIP: ${version}`);
      continue;
    }
    console.log(`Aplicando: ${file}`);
    const sql = fs.readFileSync(path.join('supabase/migrations', file), 'utf8');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO supabase_migrations.schema_migrations (version, statements) VALUES ($1, ARRAY[$2]::text[])',
        [version, '-- Applied via deploy workflow']
      );
      console.log(`OK: ${version}`);
    } catch (e) {
      console.error(`ERRO ${version}: ${e.message}`);
      await client.end();
      process.exit(1);
    }
  }
  await client.end();
  console.log('Migrations concluídas.');
})();
