-- Habilita Supabase Realtime na tabela `permissoes` para permitir que o
-- AuthProvider (src/core/auth/AuthProvider.tsx) reaja a UPDATEs feitos por um
-- admin enquanto o usuário afetado já está logado, sem precisar deslogar.
--
-- Idempotente: se a tabela já estiver na publication, o DO block ignora o
-- erro de duplicidade em vez de falhar a migration.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.permissoes;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'permissoes já está na publication supabase_realtime';
END $$;

NOTIFY pgrst, 'reload schema';
