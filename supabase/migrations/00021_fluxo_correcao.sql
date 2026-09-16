-- Adiciona campos_correcao para gerenciar quais campos precisam de correcao no fluxo do lead
ALTER TABLE cadastros ADD COLUMN IF NOT EXISTS campos_correcao jsonb DEFAULT '[]'::jsonb;
