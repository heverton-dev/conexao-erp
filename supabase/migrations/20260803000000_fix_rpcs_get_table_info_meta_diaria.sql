-- ============================================================
-- Migration: RPCs get_table_info e set_meta_diaria_visitas
-- Data: 2026-08-03
-- Descrição: cria as 2 RPCs que o código já chama (supabase.rpc(...)) mas
--   que não existem no banco (achado B2 de docs/agents/varredura-2026-08-03.md).
--   get_table_info: usada em /global/banco (fallback já existe no front-end,
--   mas a RPC evita N+1 queries por tabela). Retorna (nome, linhas) — nomes
--   confirmados contra o uso em src/routes/global.banco.tsx.
--   set_meta_diaria_visitas: usada em /crm/equipe para definir meta diária
--   de visitas de um consultor. Coluna alvo confirmada via
--   information_schema.columns: usuarios.meta_diaria_visitas (integer, not null).
--   Independente da reconciliação de drift/empresa_id.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION get_table_info()
RETURNS TABLE(nome text, linhas bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.relname::text, c.reltuples::bigint
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'
  ORDER BY c.reltuples DESC;
END;
$$;

CREATE OR REPLACE FUNCTION set_meta_diaria_visitas(_user_id uuid, _meta integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE usuarios SET meta_diaria_visitas = _meta WHERE id = _user_id;
END;
$$;

COMMIT;
