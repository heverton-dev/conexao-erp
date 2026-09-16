-- ============================================================
-- 20260721010000_force_clean_rls_catalogo.sql
-- Força limpeza completa de RLS nas tabelas de hierarquia
-- Remove TODAS as policies (incluindo as que referenciam empresa_id)
-- e desabilita RLS para garantir acesso livre
-- ============================================================

-- Função auxiliar: dropa TODAS as policies de uma tabela
DO $$
DECLARE
  tbl RECORD;
  pol RECORD;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'catalogo_categorias', 'catalogo_ips_conexoes', 'catalogo_ips_familias',
      'catalogo_ips_linhas', 'catalogo_implantes', 'catalogo_kits',
      'catalogo_abutments', 'catalogo_chaves', 'catalogo_fresas',
      'catalogo_cicatrizadores', 'catalogo_componentes', 'catalogo_parafusos',
      'catalogo_parafusos_retensao', 'catalogo_opcionais', 'catalogo_complementares',
      'catalogo_tipos_chaves', 'catalogo_tipos_fresas', 'catalogo_tipos_complementares',
      'catalogo_tipos_opcionais', 'catalogo_cps_tipos_reabilitacao',
      'catalogo_cps_tipos_abutments', 'catalogo_cps_tipos_componentes',
      'catalogo_cps_tipos_parafusos', 'catalogo_cps_tipos_cicatrizadores',
      'catalogo_cps_tipos_workflows', 'catalogo_cps_etapas_workflows',
      'catalogo_implante_chaves', 'catalogo_implante_kit', 'catalogo_implante_abutment',
      'catalogo_kit_chaves', 'catalogo_kit_fresas', 'catalogo_kit_complementares',
      'catalogo_kit_opcionais', 'catalogo_kit_implantes',
      'catalogo_protocolos_fresagens', 'catalogo_protocolos_fresas_itens',
      'catalogo_protocolo_fresagem', 'catalogo_configuracoes', 'catalogo_design_config',
      'catalogo_grupo_precos', 'catalogo_grupos_clientes',
      'catalogo_clientes', 'catalogo_cliente_permissoes', 'catalogo_pedidos',
      'catalogo_pedido_itens', 'catalogo_orcamentos', 'catalogo_orcamento_itens',
      'catalogo_solicitacoes_acesso', 'catalogo_imagens_produto', 'catalogo_favoritos',
      'catalogo_promocionais', 'catalogo_promocional_itens', 'catalogo_cupons',
      'catalogo_fretes', 'catalogo_instrumentais', 'catalogo_instrumental_geral',
      'catalogo_fresagens', 'catalogo_sequencia_protetica', 'catalogo_tipos_kits',
      'catalogo_tipos_ossos', 'catalogo_cps_tipos_reabilitacao_familias'
    ]) AS tbl_name
  LOOP
    -- Verificar se tabela existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl.tbl_name
    ) THEN
      CONTINUE;
    END IF;

    -- Dropar TODAS as policies (usa loop dinâmico)
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl.tbl_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tbl_name);
    END LOOP;

    -- Desabilitar RLS
    EXECUTE format('ALTER TABLE IF EXISTS %I DISABLE ROW LEVEL SECURITY', tbl.tbl_name);

    RAISE NOTICE 'RLS limpo e desabilitado para %', tbl.tbl_name;
  END LOOP;
END $$;

-- Recarregar schema do PostgREST
NOTIFY pgrst, 'reload schema';
