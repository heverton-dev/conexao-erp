-- ============================================================
-- Adiciona ON UPDATE CASCADE em todas as FKs do modulo catalogo
-- Motivo: varias tabelas usam SKU (chave natural, editavel nos
-- formularios de cadastro) como PK. Sem ON UPDATE CASCADE, renomear
-- um SKU trava com "update or delete ... violates foreign key
-- constraint" (NO ACTION e o default). ON DELETE de cada FK e
-- preservado, so o ON UPDATE e adicionado/normalizado para CASCADE.
-- ============================================================

ALTER TABLE catalogo_abutment_chaves DROP CONSTRAINT IF EXISTS catalogo_abutment_chaves_abutment_sku_fkey;
ALTER TABLE catalogo_abutment_chaves ADD CONSTRAINT catalogo_abutment_chaves_abutment_sku_fkey FOREIGN KEY (abutment_sku) REFERENCES catalogo_abutments(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_abutment_chaves DROP CONSTRAINT IF EXISTS fk_abutment_chaves_chave;
ALTER TABLE catalogo_abutment_chaves ADD CONSTRAINT fk_abutment_chaves_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_abutment_kits DROP CONSTRAINT IF EXISTS catalogo_abutment_kits_abutment_sku_fkey;
ALTER TABLE catalogo_abutment_kits ADD CONSTRAINT catalogo_abutment_kits_abutment_sku_fkey FOREIGN KEY (abutment_sku) REFERENCES catalogo_abutments(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_abutment_kits DROP CONSTRAINT IF EXISTS catalogo_abutment_kits_kit_sku_fkey;
ALTER TABLE catalogo_abutment_kits ADD CONSTRAINT catalogo_abutment_kits_kit_sku_fkey FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_abutment_parafusos DROP CONSTRAINT IF EXISTS catalogo_abutment_parafusos_abutment_sku_fkey;
ALTER TABLE catalogo_abutment_parafusos ADD CONSTRAINT catalogo_abutment_parafusos_abutment_sku_fkey FOREIGN KEY (abutment_sku) REFERENCES catalogo_abutments(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_abutment_parafusos DROP CONSTRAINT IF EXISTS fk_abutment_parafusos_parafuso;
ALTER TABLE catalogo_abutment_parafusos ADD CONSTRAINT fk_abutment_parafusos_parafuso FOREIGN KEY (parafuso_sku) REFERENCES catalogo_parafusos(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_chave;
ALTER TABLE catalogo_abutments ADD CONSTRAINT fk_abutments_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_familia;
ALTER TABLE catalogo_abutments ADD CONSTRAINT fk_abutments_familia FOREIGN KEY (familia_id) REFERENCES catalogo_ips_familias(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_parafuso;
ALTER TABLE catalogo_abutments ADD CONSTRAINT fk_abutments_parafuso FOREIGN KEY (parafuso_id) REFERENCES catalogo_parafusos(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_abutments DROP CONSTRAINT IF EXISTS fk_abutments_tipo_abutment;
ALTER TABLE catalogo_abutments ADD CONSTRAINT fk_abutments_tipo_abutment FOREIGN KEY (tipo_abutment_id) REFERENCES catalogo_cps_tipos_abutments(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_chaves DROP CONSTRAINT IF EXISTS catalogo_chaves_tipo_chave_id_fkey;
ALTER TABLE catalogo_chaves ADD CONSTRAINT catalogo_chaves_tipo_chave_id_fkey FOREIGN KEY (tipo_chave_id) REFERENCES catalogo_tipos_chaves(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS fk_cicatrizadores_chave;
ALTER TABLE catalogo_cicatrizadores ADD CONSTRAINT fk_cicatrizadores_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_cicatrizadores DROP CONSTRAINT IF EXISTS fk_cicatrizadores_implante;
ALTER TABLE catalogo_cicatrizadores ADD CONSTRAINT fk_cicatrizadores_implante FOREIGN KEY (implante_id) REFERENCES catalogo_implantes(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_cliente_permissoes DROP CONSTRAINT IF EXISTS catalogo_cliente_permissoes_cliente_id_fkey;
ALTER TABLE catalogo_cliente_permissoes ADD CONSTRAINT catalogo_cliente_permissoes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES catalogo_clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_clientes DROP CONSTRAINT IF EXISTS catalogo_clientes_grupo_id_fkey;
ALTER TABLE catalogo_clientes ADD CONSTRAINT catalogo_clientes_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES catalogo_grupos_clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_complementares DROP CONSTRAINT IF EXISTS catalogo_complementares_tipo_complementar_id_fkey;
ALTER TABLE catalogo_complementares ADD CONSTRAINT catalogo_complementares_tipo_complementar_id_fkey FOREIGN KEY (tipo_complementar_id) REFERENCES catalogo_tipos_complementares(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS catalogo_componentes_tipo_abutment_id_fkey;
ALTER TABLE catalogo_componentes ADD CONSTRAINT catalogo_componentes_tipo_abutment_id_fkey FOREIGN KEY (tipo_abutment_id) REFERENCES catalogo_cps_tipos_abutments(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS catalogo_componentes_tipo_componente_id_fkey;
ALTER TABLE catalogo_componentes ADD CONSTRAINT catalogo_componentes_tipo_componente_id_fkey FOREIGN KEY (tipo_componente_id) REFERENCES catalogo_cps_tipos_componentes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS fk_componentes_chave;
ALTER TABLE catalogo_componentes ADD CONSTRAINT fk_componentes_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_componentes DROP CONSTRAINT IF EXISTS fk_componentes_parafuso;
ALTER TABLE catalogo_componentes ADD CONSTRAINT fk_componentes_parafuso FOREIGN KEY (parafuso_id) REFERENCES catalogo_parafusos(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_cps_etapas_workflows DROP CONSTRAINT IF EXISTS catalogo_cps_etapas_workflows_tipo_workflow_id_fkey;
ALTER TABLE catalogo_cps_etapas_workflows ADD CONSTRAINT catalogo_cps_etapas_workflows_tipo_workflow_id_fkey FOREIGN KEY (tipo_workflow_id) REFERENCES catalogo_cps_tipos_workflows(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_cps_tipos_abutments DROP CONSTRAINT IF EXISTS catalogo_cps_tipos_abutments_tipo_reabilitacao_id_fkey;
ALTER TABLE catalogo_cps_tipos_abutments ADD CONSTRAINT catalogo_cps_tipos_abutments_tipo_reabilitacao_id_fkey FOREIGN KEY (tipo_reabilitacao_id) REFERENCES catalogo_cps_tipos_reabilitacao(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_cps_tipos_componentes DROP CONSTRAINT IF EXISTS catalogo_cps_tipos_componentes_categoria_id_fkey;
ALTER TABLE catalogo_cps_tipos_componentes ADD CONSTRAINT catalogo_cps_tipos_componentes_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES catalogo_categorias(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_cps_tipos_reabilitacao_familias DROP CONSTRAINT IF EXISTS catalogo_cps_tipos_reabilitacao_famil_tipo_reabilitacao_id_fkey;
ALTER TABLE catalogo_cps_tipos_reabilitacao_familias ADD CONSTRAINT catalogo_cps_tipos_reabilitacao_famil_tipo_reabilitacao_id_fkey FOREIGN KEY (tipo_reabilitacao_id) REFERENCES catalogo_cps_tipos_reabilitacao(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_cps_tipos_reabilitacao_familias DROP CONSTRAINT IF EXISTS catalogo_cps_tipos_reabilitacao_familias_familia_id_fkey;
ALTER TABLE catalogo_cps_tipos_reabilitacao_familias ADD CONSTRAINT catalogo_cps_tipos_reabilitacao_familias_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES catalogo_ips_familias(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_cupons DROP CONSTRAINT IF EXISTS catalogo_cupons_grupo_id_fkey;
ALTER TABLE catalogo_cupons ADD CONSTRAINT catalogo_cupons_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES catalogo_grupos_clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_favoritos DROP CONSTRAINT IF EXISTS catalogo_favoritos_cliente_id_fkey;
ALTER TABLE catalogo_favoritos ADD CONSTRAINT catalogo_favoritos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES catalogo_clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_fresas DROP CONSTRAINT IF EXISTS catalogo_fresas_v2_tipo_fresa_id_fkey;
ALTER TABLE catalogo_fresas ADD CONSTRAINT catalogo_fresas_v2_tipo_fresa_id_fkey FOREIGN KEY (tipo_fresa_id) REFERENCES catalogo_tipos_fresas(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_grupo_desconto_categoria DROP CONSTRAINT IF EXISTS catalogo_grupo_desconto_categoria_grupo_id_fkey;
ALTER TABLE catalogo_grupo_desconto_categoria ADD CONSTRAINT catalogo_grupo_desconto_categoria_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES catalogo_grupos_clientes(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_implante_abutment DROP CONSTRAINT IF EXISTS fk_implante_abutment_abutment;
ALTER TABLE catalogo_implante_abutment ADD CONSTRAINT fk_implante_abutment_abutment FOREIGN KEY (abutment_sku) REFERENCES catalogo_abutments(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_implante_abutment DROP CONSTRAINT IF EXISTS fk_implante_abutment_implante;
ALTER TABLE catalogo_implante_abutment ADD CONSTRAINT fk_implante_abutment_implante FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_implante_chaves DROP CONSTRAINT IF EXISTS fk_implante_chaves_chave;
ALTER TABLE catalogo_implante_chaves ADD CONSTRAINT fk_implante_chaves_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_implante_chaves DROP CONSTRAINT IF EXISTS fk_implante_chaves_implante;
ALTER TABLE catalogo_implante_chaves ADD CONSTRAINT fk_implante_chaves_implante FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_implante_kit DROP CONSTRAINT IF EXISTS fk_implante_kit_kit;
ALTER TABLE catalogo_implante_kit ADD CONSTRAINT fk_implante_kit_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_implantes DROP CONSTRAINT IF EXISTS fk_implantes_categoria;
ALTER TABLE catalogo_implantes ADD CONSTRAINT fk_implantes_categoria FOREIGN KEY (categoria_id) REFERENCES catalogo_categorias(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_implantes DROP CONSTRAINT IF EXISTS fk_implantes_conexao;
ALTER TABLE catalogo_implantes ADD CONSTRAINT fk_implantes_conexao FOREIGN KEY (conexao_id) REFERENCES catalogo_ips_conexoes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_implantes DROP CONSTRAINT IF EXISTS fk_implantes_familia;
ALTER TABLE catalogo_implantes ADD CONSTRAINT fk_implantes_familia FOREIGN KEY (familia_id) REFERENCES catalogo_ips_familias(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_implantes DROP CONSTRAINT IF EXISTS fk_implantes_linha;
ALTER TABLE catalogo_implantes ADD CONSTRAINT fk_implantes_linha FOREIGN KEY (linha_id) REFERENCES catalogo_ips_linhas(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE catalogo_ips_conexoes DROP CONSTRAINT IF EXISTS catalogo_ips_conexoes_categoria_id_fkey;
ALTER TABLE catalogo_ips_conexoes ADD CONSTRAINT catalogo_ips_conexoes_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES catalogo_categorias(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_ips_familias DROP CONSTRAINT IF EXISTS catalogo_ips_familias_conexao_id_fkey;
ALTER TABLE catalogo_ips_familias ADD CONSTRAINT catalogo_ips_familias_conexao_id_fkey FOREIGN KEY (conexao_id) REFERENCES catalogo_ips_conexoes(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_ips_linhas DROP CONSTRAINT IF EXISTS catalogo_ips_linhas_familia_id_fkey;
ALTER TABLE catalogo_ips_linhas ADD CONSTRAINT catalogo_ips_linhas_familia_id_fkey FOREIGN KEY (familia_id) REFERENCES catalogo_ips_familias(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_chaves DROP CONSTRAINT IF EXISTS fk_kit_chaves_chave;
ALTER TABLE catalogo_kit_chaves ADD CONSTRAINT fk_kit_chaves_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_chaves DROP CONSTRAINT IF EXISTS fk_kit_chaves_kit;
ALTER TABLE catalogo_kit_chaves ADD CONSTRAINT fk_kit_chaves_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_cicatrizadores DROP CONSTRAINT IF EXISTS catalogo_kit_cicatrizadores_cicatrizador_sku_fkey;
ALTER TABLE catalogo_kit_cicatrizadores ADD CONSTRAINT catalogo_kit_cicatrizadores_cicatrizador_sku_fkey FOREIGN KEY (cicatrizador_sku) REFERENCES catalogo_cicatrizadores(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_cicatrizadores DROP CONSTRAINT IF EXISTS catalogo_kit_cicatrizadores_kit_sku_fkey;
ALTER TABLE catalogo_kit_cicatrizadores ADD CONSTRAINT catalogo_kit_cicatrizadores_kit_sku_fkey FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_complementares DROP CONSTRAINT IF EXISTS fk_kit_complementares_complementar;
ALTER TABLE catalogo_kit_complementares ADD CONSTRAINT fk_kit_complementares_complementar FOREIGN KEY (complementar_id) REFERENCES catalogo_complementares(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_complementares DROP CONSTRAINT IF EXISTS fk_kit_complementares_kit;
ALTER TABLE catalogo_kit_complementares ADD CONSTRAINT fk_kit_complementares_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_fresas DROP CONSTRAINT IF EXISTS fk_kit_fresas_fresa;
ALTER TABLE catalogo_kit_fresas ADD CONSTRAINT fk_kit_fresas_fresa FOREIGN KEY (fresa_id) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_fresas DROP CONSTRAINT IF EXISTS fk_kit_fresas_kit;
ALTER TABLE catalogo_kit_fresas ADD CONSTRAINT fk_kit_fresas_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_implantes DROP CONSTRAINT IF EXISTS fk_kit_implantes_kit;
ALTER TABLE catalogo_kit_implantes ADD CONSTRAINT fk_kit_implantes_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_kits_complementares DROP CONSTRAINT IF EXISTS catalogo_kit_kits_complementares_complementar_sku_fkey;
ALTER TABLE catalogo_kit_kits_complementares ADD CONSTRAINT catalogo_kit_kits_complementares_complementar_sku_fkey FOREIGN KEY (complementar_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_kits_complementares DROP CONSTRAINT IF EXISTS catalogo_kit_kits_complementares_kit_sku_fkey;
ALTER TABLE catalogo_kit_kits_complementares ADD CONSTRAINT catalogo_kit_kits_complementares_kit_sku_fkey FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_kits_relacionados DROP CONSTRAINT IF EXISTS catalogo_kit_kits_relacionados_kit_sku_fkey;
ALTER TABLE catalogo_kit_kits_relacionados ADD CONSTRAINT catalogo_kit_kits_relacionados_kit_sku_fkey FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_kits_relacionados DROP CONSTRAINT IF EXISTS catalogo_kit_kits_relacionados_relacionado_sku_fkey;
ALTER TABLE catalogo_kit_kits_relacionados ADD CONSTRAINT catalogo_kit_kits_relacionados_relacionado_sku_fkey FOREIGN KEY (relacionado_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_opcionais DROP CONSTRAINT IF EXISTS fk_kit_opcionais_kit;
ALTER TABLE catalogo_kit_opcionais ADD CONSTRAINT fk_kit_opcionais_kit FOREIGN KEY (kit_sku) REFERENCES catalogo_kits(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kit_opcionais DROP CONSTRAINT IF EXISTS fk_kit_opcionais_opcional;
ALTER TABLE catalogo_kit_opcionais ADD CONSTRAINT fk_kit_opcionais_opcional FOREIGN KEY (opcional_id) REFERENCES catalogo_opcionais(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_kits DROP CONSTRAINT IF EXISTS catalogo_kits_v2_tipo_kit_id_fkey;
ALTER TABLE catalogo_kits ADD CONSTRAINT catalogo_kits_v2_tipo_kit_id_fkey FOREIGN KEY (tipo_kit_id) REFERENCES catalogo_tipos_kits(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_opcionais DROP CONSTRAINT IF EXISTS catalogo_opcionais_tipo_opcional_id_fkey;
ALTER TABLE catalogo_opcionais ADD CONSTRAINT catalogo_opcionais_tipo_opcional_id_fkey FOREIGN KEY (tipo_opcional_id) REFERENCES catalogo_tipos_opcionais(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_orcamento_itens DROP CONSTRAINT IF EXISTS catalogo_orcamento_itens_orcamento_id_fkey;
ALTER TABLE catalogo_orcamento_itens ADD CONSTRAINT catalogo_orcamento_itens_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES catalogo_orcamentos(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_orcamentos DROP CONSTRAINT IF EXISTS catalogo_orcamentos_cliente_crm_id_fkey;
ALTER TABLE catalogo_orcamentos ADD CONSTRAINT catalogo_orcamentos_cliente_crm_id_fkey FOREIGN KEY (cliente_crm_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_orcamentos DROP CONSTRAINT IF EXISTS catalogo_orcamentos_cliente_id_fkey;
ALTER TABLE catalogo_orcamentos ADD CONSTRAINT catalogo_orcamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES catalogo_clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_parafusos DROP CONSTRAINT IF EXISTS catalogo_parafusos_tipo_parafuso_id_fkey;
ALTER TABLE catalogo_parafusos ADD CONSTRAINT catalogo_parafusos_tipo_parafuso_id_fkey FOREIGN KEY (tipo_parafuso_id) REFERENCES catalogo_cps_tipos_parafusos(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_parafusos DROP CONSTRAINT IF EXISTS fk_parafusos_chave;
ALTER TABLE catalogo_parafusos ADD CONSTRAINT fk_parafusos_chave FOREIGN KEY (chave_id) REFERENCES catalogo_chaves(sku) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_pedido_itens DROP CONSTRAINT IF EXISTS catalogo_pedido_itens_pedido_id_fkey;
ALTER TABLE catalogo_pedido_itens ADD CONSTRAINT catalogo_pedido_itens_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES catalogo_pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_pedidos DROP CONSTRAINT IF EXISTS catalogo_pedidos_cliente_crm_id_fkey;
ALTER TABLE catalogo_pedidos ADD CONSTRAINT catalogo_pedidos_cliente_crm_id_fkey FOREIGN KEY (cliente_crm_id) REFERENCES clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_pedidos DROP CONSTRAINT IF EXISTS catalogo_pedidos_cliente_id_fkey;
ALTER TABLE catalogo_pedidos ADD CONSTRAINT catalogo_pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES catalogo_clientes(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_pedidos DROP CONSTRAINT IF EXISTS catalogo_pedidos_orcamento_id_fkey;
ALTER TABLE catalogo_pedidos ADD CONSTRAINT catalogo_pedidos_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES catalogo_orcamentos(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE catalogo_promocional_itens DROP CONSTRAINT IF EXISTS catalogo_promocional_itens_promocional_id_fkey;
ALTER TABLE catalogo_promocional_itens ADD CONSTRAINT catalogo_promocional_itens_promocional_id_fkey FOREIGN KEY (promocional_id) REFERENCES catalogo_promocionais(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_protocolo_fresagem DROP CONSTRAINT IF EXISTS fk_protocolo_fresagem_fresa;
ALTER TABLE catalogo_protocolo_fresagem ADD CONSTRAINT fk_protocolo_fresagem_fresa FOREIGN KEY (fresa_sku) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_protocolo_fresagem DROP CONSTRAINT IF EXISTS fk_protocolo_fresagem_implante;
ALTER TABLE catalogo_protocolo_fresagem ADD CONSTRAINT fk_protocolo_fresagem_implante FOREIGN KEY (implante_sku) REFERENCES catalogo_implantes(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_protocolos_fresas_itens DROP CONSTRAINT IF EXISTS catalogo_protocolos_fresas_itens_protocolo_id_fkey;
ALTER TABLE catalogo_protocolos_fresas_itens ADD CONSTRAINT catalogo_protocolos_fresas_itens_protocolo_id_fkey FOREIGN KEY (protocolo_id) REFERENCES catalogo_protocolos_fresagens(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_protocolos_fresas_itens DROP CONSTRAINT IF EXISTS fk_protocolos_fresas_itens_fresa;
ALTER TABLE catalogo_protocolos_fresas_itens ADD CONSTRAINT fk_protocolos_fresas_itens_fresa FOREIGN KEY (fresa_id) REFERENCES catalogo_fresas(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_abutments DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_abutments_abutment_sku_fkey;
ALTER TABLE catalogo_seq_protetica_abutments ADD CONSTRAINT catalogo_seq_protetica_abutments_abutment_sku_fkey FOREIGN KEY (abutment_sku) REFERENCES catalogo_abutments(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_abutments DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_abutments_seq_id_fkey;
ALTER TABLE catalogo_seq_protetica_abutments ADD CONSTRAINT catalogo_seq_protetica_abutments_seq_id_fkey FOREIGN KEY (seq_id) REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_componentes DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_componentes_componente_sku_fkey;
ALTER TABLE catalogo_seq_protetica_componentes ADD CONSTRAINT catalogo_seq_protetica_componentes_componente_sku_fkey FOREIGN KEY (componente_sku) REFERENCES catalogo_componentes(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_componentes DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_componentes_seq_id_fkey;
ALTER TABLE catalogo_seq_protetica_componentes ADD CONSTRAINT catalogo_seq_protetica_componentes_seq_id_fkey FOREIGN KEY (seq_id) REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_etapa_componentes DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_etapa_componentes_componente_sku_fkey;
ALTER TABLE catalogo_seq_protetica_etapa_componentes ADD CONSTRAINT catalogo_seq_protetica_etapa_componentes_componente_sku_fkey FOREIGN KEY (componente_sku) REFERENCES catalogo_componentes(sku) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_etapa_componentes DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_etapa_componentes_etapa_id_fkey;
ALTER TABLE catalogo_seq_protetica_etapa_componentes ADD CONSTRAINT catalogo_seq_protetica_etapa_componentes_etapa_id_fkey FOREIGN KEY (etapa_id) REFERENCES catalogo_cps_etapas_workflows(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_etapa_componentes DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_etapa_componentes_seq_id_fkey;
ALTER TABLE catalogo_seq_protetica_etapa_componentes ADD CONSTRAINT catalogo_seq_protetica_etapa_componentes_seq_id_fkey FOREIGN KEY (seq_id) REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_etapas DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_etapas_etapa_id_fkey;
ALTER TABLE catalogo_seq_protetica_etapas ADD CONSTRAINT catalogo_seq_protetica_etapas_etapa_id_fkey FOREIGN KEY (etapa_id) REFERENCES catalogo_cps_etapas_workflows(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE catalogo_seq_protetica_etapas DROP CONSTRAINT IF EXISTS catalogo_seq_protetica_etapas_seq_id_fkey;
ALTER TABLE catalogo_seq_protetica_etapas ADD CONSTRAINT catalogo_seq_protetica_etapas_seq_id_fkey FOREIGN KEY (seq_id) REFERENCES catalogo_seq_proteticas(id) ON DELETE CASCADE ON UPDATE CASCADE;

NOTIFY pgrst, 'reload schema';
