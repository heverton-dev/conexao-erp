const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';

const sql = `
CREATE OR REPLACE FUNCTION get_current_empresa_id()
RETURNS UUID AS $$ SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1 $$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin_session()
RETURNS BOOLEAN AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true) $$ LANGUAGE sql SECURITY DEFINER STABLE;

DO $$
DECLARE
  tbl TEXT;
  all_tables TEXT[] := ARRAY[
    'catalogo_categorias', 'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas',
    'catalogo_cps_tipos_reabilitacao', 'catalogo_cps_tipos_abutments',
    'catalogo_cps_tipos_componentes', 'catalogo_cps_tipos_parafusos', 'catalogo_cps_tipos_cicatrizadores',
    'catalogo_tipos_chaves', 'catalogo_tipos_fresas', 'catalogo_tipos_complementares',
    'catalogo_tipos_opcionais', 'catalogo_tipos_fresagens', 'catalogo_tipos_kits',
    'catalogo_cps_tipos_workflows', 'catalogo_cps_etapas_workflows',
    'catalogo_implantes', 'catalogo_abutments', 'catalogo_componentes',
    'catalogo_parafusos', 'catalogo_cicatrizadores',
    'catalogo_complementares', 'catalogo_opcionais',
    'catalogo_fresas', 'catalogo_chaves',
    'catalogo_acessorios', 'catalogo_categorias_acessorio',
    'catalogo_instrumentais_gerais', 'catalogo_categorias_instrumental',
    'catalogo_protocolo_fresagem', 'catalogo_protocolos_fresagens',
    'catalogo_protocolos_fresas_itens',
    'catalogo_implante_chaves', 'catalogo_sequencia_protetica',
    'catalogo_kits', 'catalogo_kit_familias', 'catalogo_kit_composicao',
    'catalogo_kit_chaves', 'catalogo_kit_fresas',
    'catalogo_kit_complementares', 'catalogo_kit_opcionais',
    'catalogo_promocionais', 'catalogo_promocional_itens',
    'catalogo_cupons', 'catalogo_fretes',
    'catalogo_workflows', 'catalogo_etapas_workflow', 'catalogo_guias_reabilitacao',
    'catalogo_imagens_produto', 'catalogo_imagens_implante',
    'catalogo_configs_empresa', 'catalogo_favoritos',
    'catalogo_acessorio_ferramental'
  ];
  pol RECORD;
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      CONTINUE;
    END IF;
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
    EXECUTE format('CREATE POLICY catalogo_empresa_all ON %I FOR ALL USING (is_super_admin_session() OR empresa_id = get_current_empresa_id())', tbl);
  END LOOP;
END $$;
`;

const body = JSON.stringify({ query: sql });
const req = https.request({
  hostname: 'api.supabase.com',
  path: '/v1/projects/' + PROJECT + '/database/query',
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => { console.log('Status:', res.statusCode); console.log(data.substring(0, 500)); });
});
req.write(body);
req.end();
