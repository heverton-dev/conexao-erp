-- Corrige a Central de Ações: dispararEventoModulo() filtra webhooks por
-- modulo_key + evento_key, mas a UI só gravava modulo_key + evento.
-- Também estende conectores_api e notificacoes_modelos com as mesmas
-- colunas, já que dispararEventoModulo passa a consultar as três tabelas.

ALTER TABLE api_connectors
ADD COLUMN IF NOT EXISTS evento_key text DEFAULT NULL;

ALTER TABLE notificacoes_templates
ADD COLUMN IF NOT EXISTS evento_key text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_api_connectors_modulo_key ON api_connectors (modulo_key);
CREATE INDEX IF NOT EXISTS idx_notificacoes_templates_modulo_key ON notificacoes_templates (modulo_key);

-- Backfill: automações já cadastradas com modulo_key preenchido mas
-- evento_key nulo (criadas antes desta correção) voltam a funcionar
-- sem precisar ser recriadas manualmente.
UPDATE webhooks SET evento_key = evento
WHERE modulo_key IS NOT NULL AND evento_key IS NULL;

UPDATE api_connectors SET evento_key = evento
WHERE modulo_key IS NOT NULL AND evento_key IS NULL;

UPDATE notificacoes_templates SET evento_key = evento
WHERE modulo_key IS NOT NULL AND evento_key IS NULL;
