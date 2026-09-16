-- Remove o trigger que força a criação das 4 colunas estáticas ao inserir um funil
DROP TRIGGER IF EXISTS trg_funis_colunas_padrao ON funis;
