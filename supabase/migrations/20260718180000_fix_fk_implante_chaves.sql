-- ============================================================
-- Migration: Corrigir FK de catalogo_implante_chaves → catalogo_chaves
-- ============================================================

-- catalogo_implante_chaves → catalogo_chaves (via id)
ALTER TABLE public.catalogo_implante_chaves
  ADD CONSTRAINT fk_implante_chaves_chave
  FOREIGN KEY (chave_id)
  REFERENCES public.catalogo_chaves(id)
  ON DELETE CASCADE;

-- catalogo_implante_chaves → catalogo_implantes (via sku + empresa_id)
-- Não adiciona FK porque implante_sku é TEXT (SKU), não UUID
