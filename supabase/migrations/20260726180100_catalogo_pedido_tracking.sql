-- ============================================================
-- Migration: Tracking de Pedidos
-- Data: 2026-07-26
-- Descrição: Adiciona colunas de tracking e datas aos pedidos
--            para acompanhamento pelo cliente.
-- ============================================================

BEGIN;

-- Colunas de tracking
ALTER TABLE catalogo_pedidos ADD COLUMN IF NOT EXISTS tracking_code TEXT;
ALTER TABLE catalogo_pedidos ADD COLUMN IF NOT EXISTS data_envio TIMESTAMPTZ;
ALTER TABLE catalogo_pedidos ADD COLUMN IF NOT EXISTS data_entrega TIMESTAMPTZ;
ALTER TABLE catalogo_pedidos ADD COLUMN IF NOT EXISTS observacoes_admin TEXT;

-- Índice para busca por tracking
CREATE INDEX IF NOT EXISTS idx_catalogo_pedidos_tracking ON catalogo_pedidos(tracking_code) WHERE tracking_code IS NOT NULL;

COMMIT;
