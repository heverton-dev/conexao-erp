-- Fix: unificar RLS de TODAS as tabelas do catálogo
-- Usa get_current_empresa_id() + is_super_admin_session() consistentemente

-- Garantir que as funções helper existem
CREATE OR REPLACE FUNCTION get_current_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin_session()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_super_admin FROM profiles WHERE id = auth.uid()), false)
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: aplica RLS padrão em uma tabela
DO $$
DECLARE
  tbl TEXT;
  all_tables TEXT[] := ARRAY[
    -- Hierarquia
    'catalogo_categorias', 'catalogo_ips_conexoes', 'catalogo_ips_familias', 'catalogo_ips_linhas',
    -- Tipos
    'catalogo_cps_tipos_reabilitacao', 'catalogo_cps_tipos_reabilitacao_familias',
    'catalogo_cps_tipos_abutments', 'catalogo_cps_tipos_componentes',
    'catalogo_cps_tipos_parafusos', 'catalogo_cps_tipos_cicatrizadores',
    'catalogo_tipos_chaves', 'catalogo_tipos_fresas', 'catalogo_tipos_complementares',
    'catalogo_tipos_opcionais', 'catalogo_tipos_fresagens', 'catalogo_tipos_kits',
    'catalogo_cps_tipos_workflows', 'catalogo_cps_etapas_workflows',
    -- Produtos
    'catalogo_implantes', 'catalogo_abutments', 'catalogo_componentes',
    'catalogo_parafusos', 'catalogo_cicatrizadores',
    'catalogo_complementares', 'catalogo_opcionais',
    'catalogo_fresas', 'catalogo_fresas_v2',
    'catalogo_chaves', 'catalogo_chaves_ferramental',
    'catalogo_acessorios', 'catalogo_categorias_acessorio',
    'catalogo_instrumentais_gerais', 'catalogo_categorias_instrumental',
    'catalogo_acessorio_ferramental',
    -- Protocolos
    'catalogo_protocolo_fresagem', 'catalogo_protocolos_fresagens',
    'catalogo_protocolos_fresas_itens',
    -- Implante chaves
    'catalogo_implante_chaves', 'catalogo_sequencia_protetica',
    -- Kits
    'catalogo_kits', 'catalogo_kit_familias', 'catalogo_kit_composicao',
    'catalogo_kit_chaves', 'catalogo_kit_fresas',
    'catalogo_kit_complementares', 'catalogo_kit_opcionais',
    -- Promocionais / cupons / frete
    'catalogo_promocionais', 'catalogo_promocional_itens',
    'catalogo_cupons', 'catalogo_fretes',
    -- Workflows / guias
    'catalogo_workflows', 'catalogo_etapas_workflow', 'catalogo_guias_reabilitacao',
    -- Imagens / configs
    'catalogo_imagens_produto', 'catalogo_imagens_implante',
    'catalogo_configs_empresa', 'catalogo_favoritos',
    -- Parafusos retenção (legado)
    'catalogo_parafusos_retensao', 'catalogo_parafusos_retencao'
  ];
  pol_name TEXT;
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    -- Skip se tabela não existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      CONTINUE;
    END IF;

    -- Enable RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    -- Drop TODAS as policies antigas
    FOR pol_name IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol_name, tbl);
    END LOOP;

    -- Criar policy padrão: empresa_id matching + super admin
    EXECUTE format('
      CREATE POLICY catalogo_empresa_all ON %I
        FOR ALL
        USING (empresa_id = get_current_empresa_id() OR is_super_admin_session())
        WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session())
    ', tbl);
  END LOOP;
END $$;
