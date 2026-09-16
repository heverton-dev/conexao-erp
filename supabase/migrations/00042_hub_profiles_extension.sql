-- ============================================================
-- Migration 00042: Extensão profiles para Módulo HUB
-- ============================================================

-- Adicionar colunas do Hub na tabela profiles existente
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hub_points INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hub_status hub_app_status DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hub_allowed_types hub_material_type[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hub_preferences JSONB DEFAULT '{"theme":"dark","language":"pt-br"}';

-- Index para queries de ranking
CREATE INDEX IF NOT EXISTS profiles_hub_points_idx ON profiles(hub_points DESC);
CREATE INDEX IF NOT EXISTS profiles_hub_status_idx ON profiles(hub_status);
