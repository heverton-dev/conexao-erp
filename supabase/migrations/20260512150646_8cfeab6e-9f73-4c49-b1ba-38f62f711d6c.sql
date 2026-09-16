-- 1) Tabela de configuração global
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica app_config" ON public.app_config;
CREATE POLICY "Leitura publica app_config"
  ON public.app_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admin total app_config" ON public.app_config;
CREATE POLICY "Super admin total app_config"
  ON public.app_config FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

INSERT INTO public.app_config (key, value) VALUES
  ('demo_super_admin_enabled', 'true'::jsonb),
  ('demo_gestor_enabled', 'true'::jsonb),
  ('demo_consultor_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2) Promover automaticamente os e-mails-mestres ao logar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_role public.app_role;
begin
  v_role := coalesce(
    (new.raw_user_meta_data->>'role')::public.app_role,
    case
      when new.email in ('hevertoneduardoperes@gmail.com','demo.superadmin@conexao.demo') then 'super_admin'::public.app_role
      when new.email = 'demo.gestor@conexao.demo' then 'gestor'::public.app_role
      else 'consultor'::public.app_role
    end
  );
  insert into public.usuarios (id, nome_completo, email_corporativo, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', split_part(new.email, '@', 1)),
    new.email,
    v_role
  )
  on conflict (id) do update set role = excluded.role;
  return new;
end; $function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();