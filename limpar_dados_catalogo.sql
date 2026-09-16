-- Script para limpar todos os dados do módulo Catálogo
-- CUIDADO: Este script irá apagar TODOS os dados de todas as tabelas que começam com "catalogo_"
-- O uso do CASCADE também irá limpar registros dependentes caso hajam FKs.

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- Seleciona todas as tabelas do schema public (ou o atual) que iniciam com "catalogo_"
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename LIKE 'catalogo_%'
    ) 
    LOOP 
        -- Executa o TRUNCATE dinamicamente para cada tabela, em cascata para ignorar ordem de restrições
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; 
        RAISE NOTICE 'Tabela truncada: %', r.tablename;
    END LOOP; 
END $$;
