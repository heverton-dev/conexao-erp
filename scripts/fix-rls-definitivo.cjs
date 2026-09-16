/**
 * Script para aplicar a correção definitiva de RLS no catálogo
 * 
 * Problema: get_current_empresa_id() e is_super_admin_session() foram
 * sobrescritas SEM set search_path = '' pela migration 20260718,
 * causando retornos NULL e bloqueio de todas as queries do frontend.
 *
 * Correção: Restaura as funções com SECURITY DEFINER + SET search_path = ''
 * e recria policies separadas (SELECT/INSERT/UPDATE/DELETE).
 *
 * Uso: node scripts/fix-rls-definitivo.cjs
 */

const https = require('https');
const TOKEN = process.env.SUPABASE_SERVICE_TOKEN || '';
const PROJECT = 'cluuqzhizeqvkgvfdisx';

const sql = `
-- ============================================================
-- FIX DEFINITIVO: Funções helper RLS + policies do catálogo
-- Data: 2026-07-18
-- ============================================================

-- 1. Restaurar funções helper com SECURITY DEFINER + search_path = ''
-- (Evita recursão infinita e garante que as funções encontram public.profiles)

CREATE OR REPLACE FUNCTION public.get_current_empresa_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT empresa_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin_session()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR is_super_admin = true)
  );
$$;

-- 2. Recriar policies de RLS em TODAS as tabelas do catálogo
-- Usa FOR SELECT separado (mais compatível com Supabase PostgREST)

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
    'catalogo_parafusos_retensao', 'catalogo_parafusos_retencao',
    -- Clientes / pedidos / orçamentos
    'catalogo_clientes', 'catalogo_grupos_clientes', 'catalogo_cliente_permissoes',
    'catalogo_orcamentos', 'catalogo_orcamento_itens',
    'catalogo_pedidos', 'catalogo_pedido_itens',
    'catalogo_solicitacoes_acesso'
  ];
  pol_name TEXT;
  col_exists BOOLEAN;
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    -- Skip se tabela não existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      RAISE NOTICE 'Tabela % não existe, pulando...', tbl;
      CONTINUE;
    END IF;

    -- Verificar se a tabela tem coluna empresa_id
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name=tbl AND column_name='empresa_id'
    ) INTO col_exists;

    -- Habilitar RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    -- Drop TODAS as policies antigas
    FOR pol_name IN
      SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol_name, tbl);
    END LOOP;

    IF col_exists THEN
      -- Tabela COM empresa_id: política multi-tenant
      EXECUTE format('
        CREATE POLICY %I_select ON %I
          FOR SELECT USING (
            empresa_id = get_current_empresa_id()
            OR is_super_admin_session()
          )', tbl, tbl);
      EXECUTE format('
        CREATE POLICY %I_insert ON %I
          FOR INSERT WITH CHECK (
            empresa_id = get_current_empresa_id()
            OR is_super_admin_session()
          )', tbl, tbl);
      EXECUTE format('
        CREATE POLICY %I_update ON %I
          FOR UPDATE USING (
            empresa_id = get_current_empresa_id()
            OR is_super_admin_session()
          )', tbl, tbl);
      EXECUTE format('
        CREATE POLICY %I_delete ON %I
          FOR DELETE USING (
            empresa_id = get_current_empresa_id()
            OR is_super_admin_session()
          )', tbl, tbl);
    ELSE
      -- Tabela SEM empresa_id: política aberta para autenticados
      EXECUTE format('
        CREATE POLICY %I_auth_all ON %I
          FOR ALL TO authenticated
          USING (true)
          WITH CHECK (true)', tbl, tbl);
    END IF;

    RAISE NOTICE 'RLS configurado para % (empresa_id: %)', tbl, col_exists;
  END LOOP;
END $$;

-- 3. Garantir que a tabela profiles tem policy de SELECT
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
  DROP POLICY IF EXISTS profiles_select_empresa ON public.profiles;
  
  CREATE POLICY profiles_select_own ON public.profiles
    FOR SELECT USING (
      id = auth.uid()
      OR is_super_admin_session()
    );
    
  RAISE NOTICE 'Policy profiles_select_own criada';
END $$;
`;

const body = JSON.stringify({ query: sql });
const req = https.request({
  hostname: 'api.supabase.com',
  path: '/v1/projects/' + PROJECT + '/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ RLS corrigido com sucesso!');
      console.log(data.substring(0, 1000));
    } else {
      console.log('❌ Erro:');
      console.log(data.substring(0, 1000));
    }
  });
});

req.on('error', (e) => {
  console.error('Erro de conexão:', e.message);
});

req.write(body);
req.end();
