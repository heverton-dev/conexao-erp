-- ============================================================
-- Migration: Adicionar FK faltante para resource embedding
-- PostgREST precisa de FKs explícitas para resolver joins
-- no frontend: catalogo_implantes.linha_id → catalogo_ips_linhas.id
-- ============================================================

-- 1. Adicionar FK de linha_id para catalogo_ips_linhas.id
ALTER TABLE public.catalogo_implantes
  ADD CONSTRAINT fk_implantes_linha
  FOREIGN KEY (linha_id) 
  REFERENCES public.catalogo_ips_linhas(id)
  ON DELETE RESTRICT;

-- 2. Adicionar FKs para conexao_id, familia_id, categoria_id (se existirem como FKs no PostgREST)
-- Essas colunas existem em catalogo_implantes mas não têm FK
-- O frontend pode usá-las diretamente em queries futuras
ALTER TABLE public.catalogo_implantes
  ADD CONSTRAINT fk_implantes_conexao
  FOREIGN KEY (conexao_id) 
  REFERENCES public.catalogo_ips_conexoes(id)
  ON DELETE SET NULL;

ALTER TABLE public.catalogo_implantes
  ADD CONSTRAINT fk_implantes_familia
  FOREIGN KEY (familia_id) 
  REFERENCES public.catalogo_ips_familias(id)
  ON DELETE SET NULL;

ALTER TABLE public.catalogo_implantes
  ADD CONSTRAINT fk_implantes_categoria
  FOREIGN KEY (categoria_id) 
  REFERENCES public.catalogo_categorias(id)
  ON DELETE SET NULL;

-- Verificar
SELECT 'FKs adicionadas com sucesso' AS status;
