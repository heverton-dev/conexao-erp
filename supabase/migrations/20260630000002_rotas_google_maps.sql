-- ============================================================
-- Migration: Adiciona google_maps_api_key à rotas_config
-- Permite que cada empresa configure sua própria chave Google Maps
-- ============================================================

ALTER TABLE rotas_config
  ADD COLUMN IF NOT EXISTS google_maps_api_key TEXT NOT NULL DEFAULT '';
