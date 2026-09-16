-- Migration: Adicionar preços reais nos produtos do catálogo
-- Adiciona coluna preco em implantes, abutments, kits, fresas, acessórios, chaves e instrumentais

ALTER TABLE catalogo_implantes ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;
ALTER TABLE catalogo_abutments ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;
ALTER TABLE catalogo_kits ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;
ALTER TABLE catalogo_fresas ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;
ALTER TABLE catalogo_acessorios ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;
ALTER TABLE catalogo_chaves_ferramental ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;
ALTER TABLE catalogo_instrumentais_gerais ADD COLUMN preco DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN catalogo_implantes.preco IS 'Preço unitário de venda em BRL';
COMMENT ON COLUMN catalogo_abutments.preco IS 'Preço unitário de venda em BRL';
COMMENT ON COLUMN catalogo_kits.preco IS 'Preço do kit completo em BRL';
COMMENT ON COLUMN catalogo_fresas.preco IS 'Preço unitário de venda em BRL';
COMMENT ON COLUMN catalogo_acessorios.preco IS 'Preço unitário de venda em BRL';
COMMENT ON COLUMN catalogo_chaves_ferramental.preco IS 'Preço unitário de venda em BRL';
COMMENT ON COLUMN catalogo_instrumentais_gerais.preco IS 'Preço unitário de venda em BRL';

-- Seed: preços base do Lovable (mockados no carrinho.service.ts)
UPDATE catalogo_implantes SET preco = 480 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_abutments SET preco = 220 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_kits SET preco = 3200 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_fresas SET preco = 85 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_acessorios SET preco = 95 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_chaves_ferramental SET preco = 120 WHERE preco = 0 OR preco IS NULL;
UPDATE catalogo_instrumentais_gerais SET preco = 150 WHERE preco = 0 OR preco IS NULL;
