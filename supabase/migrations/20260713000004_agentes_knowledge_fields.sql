-- Migration: Adicionar campos de knowledge ao agentes_ia
-- Redes sociais (JSON) e link do Google Drive

ALTER TABLE agentes_ia
  ADD COLUMN IF NOT EXISTS redes_sociais JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;
