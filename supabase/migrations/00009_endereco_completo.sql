ALTER TABLE cadastros_enderecos ADD COLUMN IF NOT EXISTS endereco_completo text;
ALTER TABLE cadastros_enderecos ADD COLUMN IF NOT EXISTS tipo_endereco text DEFAULT 'clinica';
UPDATE cadastros_enderecos SET tipo_endereco = 'clinica' WHERE tipo_endereco IS NULL;