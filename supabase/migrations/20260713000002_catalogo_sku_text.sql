-- Migration: Converter sku de UUID para TEXT em todas as tabelas de produto
-- O seed usa SKUs alfanuméricos (ex: 'IMP-NP-3508'), não UUIDs válidos
-- Isso quebra a seed em banco novo. Corrigir o tipo da coluna.

-- catalogo_implantes
ALTER TABLE catalogo_implantes ALTER COLUMN sku TYPE TEXT;
ALTER TABLE catalogo_imagens_implante ALTER COLUMN implante_sku TYPE TEXT;

-- catalogo_fresas
ALTER TABLE catalogo_fresas ALTER COLUMN sku TYPE TEXT;

-- catalogo_abutments
ALTER TABLE catalogo_abutments ALTER COLUMN sku TYPE TEXT;

-- catalogo_acessorios
ALTER TABLE catalogo_acessorios ALTER COLUMN sku TYPE TEXT;

-- catalogo_chaves_ferramental
ALTER TABLE catalogo_chaves_ferramental ALTER COLUMN sku TYPE TEXT;

-- catalogo_instrumentais_gerais
ALTER TABLE catalogo_instrumentais_gerais ALTER COLUMN sku TYPE TEXT;

-- catalogo_kits
ALTER TABLE catalogo_kits ALTER COLUMN sku TYPE TEXT;

-- FK indiretas que referenciam sku
ALTER TABLE catalogo_protocolo_fresagem ALTER COLUMN implante_sku TYPE TEXT;
ALTER TABLE catalogo_protocolo_fresagem ALTER COLUMN fresa_sku TYPE TEXT;
ALTER TABLE catalogo_acessorio_ferramental ALTER COLUMN acessorio_sku TYPE TEXT;
ALTER TABLE catalogo_acessorio_ferramental ALTER COLUMN ferramenta_sku TYPE TEXT;
ALTER TABLE catalogo_sequencia_protetica ALTER COLUMN abutment_sku TYPE TEXT;
ALTER TABLE catalogo_sequencia_protetica ALTER COLUMN acessorio_sku TYPE TEXT;
ALTER TABLE catalogo_kit_composicao ALTER COLUMN fresa_sku TYPE TEXT;
ALTER TABLE catalogo_kit_composicao ALTER COLUMN chave_sku TYPE TEXT;
ALTER TABLE catalogo_kit_composicao ALTER COLUMN acessorio_sku TYPE TEXT;
ALTER TABLE catalogo_kit_composicao ALTER COLUMN instrumental_sku TYPE TEXT;
ALTER TABLE catalogo_kit_composicao ALTER COLUMN implante_sku TYPE TEXT;
ALTER TABLE catalogo_kit_familias ALTER COLUMN kit_sku TYPE TEXT;
ALTER TABLE catalogo_grupo_precos ALTER COLUMN produto_sku TYPE TEXT;
ALTER TABLE catalogo_favoritos ALTER COLUMN produto_sku TYPE TEXT;
ALTER TABLE catalogo_orcamento_itens ALTER COLUMN produto_sku TYPE TEXT;
ALTER TABLE catalogo_pedido_itens ALTER COLUMN produto_sku TYPE TEXT;

-- guias_reabilitacao (legado)
ALTER TABLE catalogo_guias_reabilitacao ALTER COLUMN acessorio_sku TYPE TEXT;
