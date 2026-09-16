-- Adiciona colunas de módulo à tabela webhooks
-- Permite vincular webhooks a eventos específicos de módulos

ALTER TABLE webhooks
ADD COLUMN IF NOT EXISTS modulo_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS evento_key text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS evento_custom text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;

-- Índice para busca rápida por módulo
CREATE INDEX IF NOT EXISTS idx_webhooks_modulo_key ON webhooks (modulo_key);
