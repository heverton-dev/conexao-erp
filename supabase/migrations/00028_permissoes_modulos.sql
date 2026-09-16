ALTER TABLE permissoes
ADD COLUMN modulos_acesso jsonb NOT NULL DEFAULT '{}'::jsonb;
