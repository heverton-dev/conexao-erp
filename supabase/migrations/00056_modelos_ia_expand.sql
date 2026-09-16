-- ============================================================
-- 00056_modelos_ia_expand.sql
-- Expande modelos_ia com capabilities e metadata do models.dev
-- (merge com DesignArena: win_rate + top_arena permanecem)
-- ============================================================

alter table public.modelos_ia
  add column if not exists reasoning boolean,
  add column if not exists tool_call boolean,
  add column if not exists structured_output boolean,
  add column if not exists temperature boolean,
  add column if not exists open_weights boolean,
  add column if not exists knowledge text,
  add column if not exists release_date text,
  add column if not exists last_updated text,
  add column if not exists modalities_input text,
  add column if not exists modalities_output text,
  add column if not exists providers_count int default 0;
