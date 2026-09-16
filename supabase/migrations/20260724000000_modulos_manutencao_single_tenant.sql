-- ============================================================
-- MIGRAÇÃO: modulos_manutencao — alinhar ao single-tenant
-- Data: 2026-07-24
-- Descrição: modulos_manutencao ficou de fora da migração
--            20260721000000_remove_empresa_id_all_tables.sql.
--            Remove a coluna e troca as policies por RLS aberta,
--            no mesmo padrão aplicado às demais tabelas.
-- ============================================================

DROP POLICY IF EXISTS modulos_manutencao_select ON modulos_manutencao;
DROP POLICY IF EXISTS modulos_manutencao_insert ON modulos_manutencao;
DROP POLICY IF EXISTS modulos_manutencao_update ON modulos_manutencao;
DROP POLICY IF EXISTS modulos_manutencao_delete ON modulos_manutencao;

ALTER TABLE IF EXISTS modulos_manutencao DROP COLUMN IF EXISTS empresa_id;

DROP INDEX IF EXISTS modulos_manutencao_empresa_modulo_idx;
DROP INDEX IF EXISTS modulos_manutencao_empresa_rota_idx;

CREATE INDEX IF NOT EXISTS modulos_manutencao_modulo_idx
  ON modulos_manutencao(modulo_key, ativo);

DROP POLICY IF EXISTS modulos_manutencao_all ON modulos_manutencao;
CREATE POLICY modulos_manutencao_all ON modulos_manutencao
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP FUNCTION IF EXISTS manutencao_minha_empresa();
DROP FUNCTION IF EXISTS manutencao_is_super_admin();

NOTIFY pgrst, 'reload schema';
