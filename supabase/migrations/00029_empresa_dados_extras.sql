ALTER TABLE empresas ADD COLUMN IF NOT EXISTS razao_social text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS nome_app text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS celular text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logradouro text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS numero text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS bairro text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS estado text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS youtube text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS site text;

ALTER TABLE empresas_config ADD COLUMN IF NOT EXISTS db_config jsonb DEFAULT '{}'::jsonb;
