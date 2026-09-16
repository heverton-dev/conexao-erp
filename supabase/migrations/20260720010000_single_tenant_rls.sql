-- ============================================================
-- MIGRAÇÃO: Single Tenant — Desabilitar RLS em todas as tabelas catálogo
-- Data: 2026-07-20
-- Descrição: Sistema é single-empresa (CONEXÃO IMPLANTES).
--            RLS desnecessário — todas as tabelas ficam abertas.
-- Nota: IF EXISTS em todas as tabelas para ser idempotente
-- ============================================================

-- Desabilitar RLS em todas as tabelas do catálogo
ALTER TABLE IF EXISTS catalogo_categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_ips_conexoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_ips_familias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_ips_linhas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_implantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_imagens_produto DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_chaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_abutments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cicatrizadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_fresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_componentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_protocolo_fresagem DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_protocolos_fresagens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_protocolos_fresas_itens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_reabilitacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_reabilitacao_familias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_abutments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_componentes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_parafusos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_cicatrizadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_tipos_workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cps_etapas_workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_implante_chaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_implante_kit DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_implante_abutment DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_familias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_composicao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_chaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_fresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_implantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_complementares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_kit_opcionais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_categorias_kit DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_tipos_chaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_tipos_fresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_tipos_complementares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_tipos_opcionais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_tipos_ossos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_tipos_kits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_opcionais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_complementares DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_parafusos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_parafusos_retensao DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_configuracoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_design_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_fretes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_promocionais DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_promocional_itens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_solicitacoes_acesso DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_grupos_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_grupo_precos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_cliente_permissoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_favoritos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_pedido_itens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_orcamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS catalogo_orcamento_itens DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas RLS existentes
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'catalogo%'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
  END LOOP;
END $$;
