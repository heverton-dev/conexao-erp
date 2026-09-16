-- ============================================================
-- Migration 00019: coluna dados_extras em cadastros
-- ============================================================

ALTER TABLE public.cadastros
  ADD COLUMN IF NOT EXISTS dados_extras JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.cadastros.dados_extras IS
  'Campos customizados criados pelo SuperAdmin via form_schema (is_custom=true)';
