-- Migration: Corrigir catalogo_design_config
-- Problema: tabela sem PK após remoção de empresa_id na migração single-tenant
-- Resultado: upsert sempre cria rows duplicados

-- 1. Adicionar coluna id
ALTER TABLE catalogo_design_config 
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Preencher ids para rows existentes
UPDATE catalogo_design_config SET id = gen_random_uuid() WHERE id IS NULL;

-- 2. Definir PK
ALTER TABLE catalogo_design_config 
  ADD PRIMARY KEY (id);

-- 3. Garantir single-row (single-tenant)
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogo_design_config_single 
  ON catalogo_design_config ((true));

-- 4. Limpar duplicados: manter apenas o mais recente
DELETE FROM catalogo_design_config 
WHERE id NOT IN (
  SELECT id FROM catalogo_design_config 
  ORDER BY updated_at DESC 
  LIMIT 1
);

-- 5. Corrigir config corrupto (char-by-char storage)
UPDATE catalogo_design_config 
SET config = (
  SELECT string_agg(value, '') 
  FROM jsonb_each_text(config) 
  WHERE key ~ '^[0-9]+$'
)::jsonb
WHERE config ? '0' AND config->>'0' = '{';
