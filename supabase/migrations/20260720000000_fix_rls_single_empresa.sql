-- ============================================================
-- MIGRAÇÃO: Correção RLS para Single-Empresa
-- Data: 2026-07-20
-- Descrição: Simplificar RLS para permitir acesso a todos
--            (sistema single-empresa CONEXÃO IMPLANTES)
-- ============================================================

-- Catalogo Categorias
CREATE POLICY catalogo_categorias_all ON catalogo_categorias
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo IPS Conexoes
DROP POLICY IF EXISTS catalogo_ips_conexoes_empresa ON catalogo_ips_conexoes;
CREATE POLICY catalogo_ips_conexoes_all ON catalogo_ips_conexoes
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo IPS Familias
DROP POLICY IF EXISTS catalogo_ips_familias_empresa ON catalogo_ips_familias;
CREATE POLICY catalogo_ips_familias_all ON catalogo_ips_familias
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo IPS Linhas
DROP POLICY IF EXISTS catalogo_ips_linhas_empresa ON catalogo_ips_linhas;
CREATE POLICY catalogo_ips_linhas_all ON catalogo_ips_linhas
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Implantes
DROP POLICY IF EXISTS catalogo_implantes_empresa ON catalogo_implantes;
CREATE POLICY catalogo_implantes_all ON catalogo_implantes
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Imagens
DROP POLICY IF EXISTS catalogo_imagens_empresa ON catalogo_imagens_implante;
CREATE POLICY catalogo_imagens_all ON catalogo_imagens_produto
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Fresas
DROP POLICY IF EXISTS catalogo_fresas_empresa ON catalogo_fresas;
CREATE POLICY catalogo_fresas_all ON catalogo_fresas
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Protocolo Fresagem
DROP POLICY IF EXISTS catalogo_fresagem_empresa ON catalogo_protocolo_fresagem;
CREATE POLICY catalogo_fresagem_all ON catalogo_protocolo_fresagem
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Tipos Reabilitacao
DROP POLICY IF EXISTS catalogo_tipos_reab_empresa ON catalogo_tipos_reabilitacao;
CREATE POLICY catalogo_tipos_reab_all ON catalogo_tipos_reabilitacao
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Tipos Abutment
DROP POLICY IF EXISTS catalogo_tipos_abut_empresa ON catalogo_tipos_abutment;
CREATE POLICY catalogo_tipos_abut_all ON catalogo_tipos_abutment
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Abutments
DROP POLICY IF EXISTS catalogo_abutments_empresa ON catalogo_abutments;
CREATE POLICY catalogo_abutments_all ON catalogo_abutments
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Chaves
DROP POLICY IF EXISTS catalogo_chaves_empresa ON catalogo_chaves;
CREATE POLICY catalogo_chaves_all ON catalogo_chaves
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Kits
DROP POLICY IF EXISTS catalogo_kits_empresa ON catalogo_kits;
CREATE POLICY catalogo_kits_all ON catalogo_kits
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Cicatrizadores
DROP POLICY IF EXISTS catalogo_cicatrizadores_empresa ON catalogo_cicatrizadores;
CREATE POLICY catalogo_cicatrizadores_all ON catalogo_cicatrizadores
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Componentes
DROP POLICY IF EXISTS catalogo_componentes_empresa ON catalogo_componentes;
CREATE POLICY catalogo_componentes_all ON catalogo_componentes
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Categorias Kit
DROP POLICY IF EXISTS catalogo_cat_kit_empresa ON catalogo_categorias_kit;
CREATE POLICY catalogo_cat_kit_all ON catalogo_categorias_kit
  FOR ALL USING (true) WITH CHECK (true);

-- Catalogo Kit Familias (tabela dropada em 20260717000001)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='catalogo_kit_familias') THEN
    DROP POLICY IF EXISTS catalogo_kit_fam_empresa ON catalogo_kit_familias;
    CREATE POLICY catalogo_kit_fam_all ON catalogo_kit_familias
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Catalogo Kit Composicao (tabela dropada em 20260717000001)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='catalogo_kit_composicao') THEN
    DROP POLICY IF EXISTS catalogo_kit_comp_empresa ON catalogo_kit_composicao;
    CREATE POLICY catalogo_kit_comp_all ON catalogo_kit_composicao
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
