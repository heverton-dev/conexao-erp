-- ============================================================
-- MIGRAÇÃO: Adicionar campos de Estoque e Preços Multi-moeda
-- Data: 2026-07-26
-- Descrição: Adiciona qtd_disponivel, qtd_minima_aviso, preco_euro, preco_dolar
--            a todas as tabelas de produtos do catálogo e a promocionais
-- ============================================================

-- Lista de todas as tabelas de produtos que precisam dos novos campos
DO $$
DECLARE
    tbl TEXT;
    product_tables TEXT[] := ARRAY[
        'catalogo_implantes',
        'catalogo_abutments',
        'catalogo_kits',
        'catalogo_parafusos',
        'catalogo_cicatrizadores',
        'catalogo_chaves',
        'catalogo_fresas',
        'catalogo_complementares',
        'catalogo_opcionais',
        'catalogo_componentes',
        'catalogo_acessorios',
        'catalogo_instrumentais_gerais',
        'catalogo_fresagens'
    ];
BEGIN
    FOREACH tbl IN ARRAY product_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS qtd_disponivel INTEGER DEFAULT 0', tbl);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS qtd_minima_aviso INTEGER DEFAULT 0', tbl);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS preco_euro DECIMAL(10,2) DEFAULT 0', tbl);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS preco_dolar DECIMAL(10,2) DEFAULT 0', tbl);
            RAISE NOTICE 'Campos adicionados em %', tbl;
        ELSE
            RAISE NOTICE 'Tabela % não existe, pulando', tbl;
        END IF;
    END LOOP;
END $$;

-- Tabela de promocionais (usa UUID como PK, não SKU)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalogo_promocionais') THEN
        ALTER TABLE catalogo_promocionais ADD COLUMN IF NOT EXISTS qtd_disponivel INTEGER DEFAULT 0;
        ALTER TABLE catalogo_promocionais ADD COLUMN IF NOT EXISTS qtd_minima_aviso INTEGER DEFAULT 0;
        ALTER TABLE catalogo_promocionais ADD COLUMN IF NOT EXISTS preco_euro DECIMAL(10,2) DEFAULT 0;
        ALTER TABLE catalogo_promocionais ADD COLUMN IF NOT EXISTS preco_dolar DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Campos adicionados em catalogo_promocionais';
    ELSE
        RAISE NOTICE 'Tabela catalogo_promocionais não existe, pulando';
    END IF;
END $$;

-- ============================================================
-- ÍNDICES para consultas de estoque baixo
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
    product_tables TEXT[] := ARRAY[
        'catalogo_implantes',
        'catalogo_abutments',
        'catalogo_kits',
        'catalogo_parafusos',
        'catalogo_cicatrizadores',
        'catalogo_chaves',
        'catalogo_fresas',
        'catalogo_complementares',
        'catalogo_opcionais',
        'catalogo_componentes',
        'catalogo_acessorios',
        'catalogo_instrumentais_gerais',
        'catalogo_fresagens'
    ];
BEGIN
    FOREACH tbl IN ARRAY product_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_estoque_baixo ON %s (qtd_disponivel, qtd_minima_aviso) WHERE qtd_disponivel <= qtd_minima_aviso AND ativo = true', tbl, tbl);
            RAISE NOTICE 'Índice estoque_baixo criado em %', tbl;
        END IF;
    END LOOP;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'catalogo_promocionais') THEN
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_catalogo_promocionais_estoque_baixo ON catalogo_promocionais (qtd_disponivel, qtd_minima_aviso) WHERE qtd_disponivel <= qtd_minima_aviso AND ativo = true');
        RAISE NOTICE 'Índice estoque_baixo criado em catalogo_promocionais';
    END IF;
END $$;

-- ============================================================
-- RLS: Habilitar e criar policies padrão (single-tenant)
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
    all_tables TEXT[] := ARRAY[
        'catalogo_implantes',
        'catalogo_abutments',
        'catalogo_kits',
        'catalogo_parafusos',
        'catalogo_cicatrizadores',
        'catalogo_chaves',
        'catalogo_fresas',
        'catalogo_complementares',
        'catalogo_opcionais',
        'catalogo_componentes',
        'catalogo_acessorios',
        'catalogo_instrumentais_gerais',
        'catalogo_fresagens',
        'catalogo_promocionais'
    ];
BEGIN
    FOREACH tbl IN ARRAY all_tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('DROP POLICY IF EXISTS allow_all ON %I', tbl);
            EXECUTE format('CREATE POLICY allow_all ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
            RAISE NOTICE 'RLS habilitado e policy allow_all criada em %', tbl;
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- TRIGGER updated_at para tabelas que não têm
-- ============================================================
DO $$
DECLARE
    tbl TEXT;
    tables_with_updated_at TEXT[] := ARRAY[
        'catalogo_implantes',
        'catalogo_abutments',
        'catalogo_kits',
        'catalogo_parafusos',
        'catalogo_cicatrizadores',
        'catalogo_chaves',
        'catalogo_fresas',
        'catalogo_complementares',
        'catalogo_opcionais',
        'catalogo_componentes',
        'catalogo_acessorios',
        'catalogo_instrumentais_gerais',
        'catalogo_fresagens',
        'catalogo_promocionais'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_with_updated_at LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            -- Verificar se coluna updated_at existe
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'updated_at') THEN
                EXECUTE format('DROP TRIGGER IF EXISTS update_timestamp ON %I', tbl);
                EXECUTE format('CREATE TRIGGER update_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_catalogo_timestamp()', tbl);
                RAISE NOTICE 'Trigger updated_at criado em %', tbl;
            END IF;
        END IF;
    END LOOP;
END $$;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================