-- ============================================================
-- Migration 00020: coluna ordem em api_connectors, notificacoes_templates e webhooks
-- ============================================================

ALTER TABLE public.api_connectors
  ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

ALTER TABLE public.notificacoes_templates
  ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

ALTER TABLE public.webhooks
  ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

COMMENT ON COLUMN public.api_connectors.ordem IS 'Ordem de disparo sequencial da ação do gatilho';
COMMENT ON COLUMN public.notificacoes_templates.ordem IS 'Ordem de disparo sequencial da notificação do gatilho';
COMMENT ON COLUMN public.webhooks.ordem IS 'Ordem de disparo sequencial do webhook legado do gatilho';
