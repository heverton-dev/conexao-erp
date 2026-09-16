-- ============================================================
-- MIGRAÇÃO: Single Tenant — Remover empresa_id do módulo Catálogo
-- Data: 2026-07-20
-- Descrição: Remove coluna empresa_id de todas as tabelas do catálogo
--            O sistema é single-tenant (CONEXÃO IMPLANTES).
--            empresa_id não é mais necessário.
-- Nota: IF EXISTS em todas as tabelas para ser idempotente
--       (algumas tabelas foram dropadas/renomeadas em migrations anteriores)
-- ============================================================

-- ============================================================
-- 1. TABELAS DE HIERARQUIA (Categoria → Conexão → Família → Linha)
-- ============================================================
ALTER TABLE IF EXISTS catalogo_categorias DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_ips_conexoes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_ips_familias DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_ips_linhas DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 2. TABELAS DE PRODUTOS
-- ============================================================
ALTER TABLE IF EXISTS catalogo_implantes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kits DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_abutments DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_chaves DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_fresas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cicatrizadores DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_componentes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_parafusos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_parafusos_retensao DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_opcionais DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_complementares DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 3. TABELAS DE TIPOS
-- ============================================================
ALTER TABLE IF EXISTS catalogo_tipos_chaves DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_fresas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_complementares DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_tipos_opcionais DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_reabilitacao DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_abutments DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_componentes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_parafusos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_cicatrizadores DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_tipos_workflows DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cps_etapas_workflows DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 4. TABELAS DE RELACIONAMENTO N:M (Pivot)
-- ============================================================
ALTER TABLE IF EXISTS catalogo_implante_chaves DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_implante_kit DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_implante_abutment DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_chaves DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_fresas DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_complementares DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_opcionais DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_familias DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_implantes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_kit_composicao DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 5. TABELAS DE PROTOCOLO
-- ============================================================
ALTER TABLE IF EXISTS catalogo_protocolos_fresagens DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_protocolos_fresas_itens DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_protocolo_fresagem DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 6. TABELAS DE CONFIGURAÇÃO
-- ============================================================
ALTER TABLE IF EXISTS catalogo_configuracoes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_design_config DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_grupo_precos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_grupos_clientes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_categorias_kit DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 7. TABELAS DE CLIENTES/PEDIDOS
-- ============================================================
ALTER TABLE IF EXISTS catalogo_clientes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cliente_permissoes DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_pedidos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_pedido_itens DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_orcamentos DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_orcamento_itens DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_solicitacoes_acesso DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 8. TABELAS DE IMAGENS/FAVORITOS
-- ============================================================
ALTER TABLE IF EXISTS catalogo_imagens_produto DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_favoritos DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 9. TABELAS PROMOCIONAIS/CUPONS/FRETE
-- ============================================================
ALTER TABLE IF EXISTS catalogo_promocionais DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_promocional_itens DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_cupons DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_fretes DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 10. TABELAS INSTRUMENTAIS
-- ============================================================
ALTER TABLE IF EXISTS catalogo_instrumentais DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_instrumental_geral DROP COLUMN IF EXISTS empresa_id;
ALTER TABLE IF EXISTS catalogo_fresagens DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- 11. TABELAS DE SEQUÊNCIA PROTÉTICA
-- ============================================================
ALTER TABLE IF EXISTS catalogo_sequencia_protetica DROP COLUMN IF EXISTS empresa_id;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
DO $$
DECLARE
  tbl TEXT;
  col_count INTEGER;
  tables_with_empresa TEXT[] := ARRAY[
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
    'catalogo_kit_opcionais', 'catalogo_kit_familias', 'catalogo_kit_implantes',
    'catalogo_kit_composicao', 'catalogo_protocolos_fresagens',
    'catalogo_protocolos_fresas_itens', 'catalogo_protocolo_fresagem',
    'catalogo_configuracoes', 'catalogo_design_config', 'catalogo_grupo_precos',
    'catalogo_grupos_clientes', 'catalogo_categorias_kit',
    'catalogo_clientes', 'catalogo_cliente_permissoes', 'catalogo_pedidos',
    'catalogo_pedido_itens', 'catalogo_orcamentos', 'catalogo_orcamento_itens',
    'catalogo_solicitacoes_acesso', 'catalogo_imagens_produto', 'catalogo_favoritos',
    'catalogo_promocionais', 'catalogo_promocional_itens', 'catalogo_cupons',
    'catalogo_fretes', 'catalogo_instrumentais', 'catalogo_instrumental_geral',
    'catalogo_fresagens', 'catalogo_sequencia_protetica'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_empresa LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      RAISE NOTICE 'Tabela % nao existe, pulando verificacao...', tbl;
      CONTINUE;
    END IF;

    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = tbl
    AND column_name = 'empresa_id';

    IF col_count > 0 THEN
      RAISE EXCEPTION 'Tabela % ainda possui empresa_id!', tbl;
    END IF;
  END LOOP;

  RAISE NOTICE 'Todas as tabelas catalogo nao possuem mais empresa_id';
END $$;

-- ============================================================
-- RELOAD SCHEMA CACHE (PostgREST)
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
