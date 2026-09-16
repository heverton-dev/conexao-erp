
-- 1. Colunas novas em usuarios
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS diretor_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS celular_corporativo varchar;

-- 2. Migra super_admin -> dev
UPDATE public.usuarios SET role = 'dev' WHERE role::text = 'super_admin';

-- 3. Colunas novas em convites_acesso
ALTER TABLE public.convites_acesso
  ADD COLUMN IF NOT EXISTS celular_corporativo varchar,
  ADD COLUMN IF NOT EXISTS diretor_vinculado_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nome_destino varchar;

-- 4. Funções de hierarquia
CREATE OR REPLACE FUNCTION public.is_diretor_de_gestor(_diretor_id uuid, _gestor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = _gestor_id AND diretor_id = _diretor_id AND role = 'gestor'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_diretor_de_consultor(_diretor_id uuid, _consultor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios c
    JOIN public.usuarios g ON g.id = c.gestor_id
    WHERE c.id = _consultor_id AND g.diretor_id = _diretor_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_diretor_de_cliente(_diretor_id uuid, _consultor_atual uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_diretor_de_consultor(_diretor_id, _consultor_atual)
      OR public.is_diretor_de_gestor(_diretor_id, _consultor_atual)
$$;

-- 5. Atualiza handle_new_user para os novos roles e novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
  v_gestor uuid;
  v_diretor uuid;
BEGIN
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.app_role,
    CASE
      WHEN NEW.email IN ('hevertoneduardoperes@gmail.com','demo.dev@conexao.demo','demo.superadmin@conexao.demo') THEN 'dev'::public.app_role
      WHEN NEW.email = 'demo.diretor@conexao.demo' THEN 'diretor_comercial'::public.app_role
      WHEN NEW.email = 'demo.gestor@conexao.demo' THEN 'gestor'::public.app_role
      ELSE 'consultor'::public.app_role
    END
  );
  v_gestor := NULLIF(NEW.raw_user_meta_data->>'gestor_id','')::uuid;
  v_diretor := NULLIF(NEW.raw_user_meta_data->>'diretor_id','')::uuid;

  INSERT INTO public.usuarios (id, nome_completo, email_corporativo, role, gestor_id, diretor_id, celular_corporativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email,'@',1)),
    NEW.email,
    v_role,
    v_gestor,
    v_diretor,
    NEW.raw_user_meta_data->>'celular_corporativo'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    gestor_id = COALESCE(EXCLUDED.gestor_id, public.usuarios.gestor_id),
    diretor_id = COALESCE(EXCLUDED.diretor_id, public.usuarios.diretor_id),
    celular_corporativo = COALESCE(EXCLUDED.celular_corporativo, public.usuarios.celular_corporativo);
  RETURN NEW;
END; $$;

-- Garante trigger em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Tabela de logs de transferência de consultor
CREATE TABLE IF NOT EXISTS public.logs_transferencia_consultor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultor_id uuid NOT NULL,
  de_gestor_id uuid,
  para_gestor_id uuid,
  transferido_por_id uuid,
  data_transferencia timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.logs_transferencia_consultor ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dev e diretor veem logs consultor" ON public.logs_transferencia_consultor;
CREATE POLICY "Dev e diretor veem logs consultor" ON public.logs_transferencia_consultor
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'dev') OR
    transferido_por_id = auth.uid() OR
    is_diretor_de_gestor(auth.uid(), de_gestor_id) OR
    is_diretor_de_gestor(auth.uid(), para_gestor_id)
  );

CREATE OR REPLACE FUNCTION public.log_transferencia_consultor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'consultor' AND NEW.gestor_id IS DISTINCT FROM OLD.gestor_id THEN
    INSERT INTO public.logs_transferencia_consultor
      (consultor_id, de_gestor_id, para_gestor_id, transferido_por_id)
    VALUES (NEW.id, OLD.gestor_id, NEW.gestor_id, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_log_transf_consultor ON public.usuarios;
CREATE TRIGGER trg_log_transf_consultor
  AFTER UPDATE OF gestor_id ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.log_transferencia_consultor();

-- 7. Atualizar/recriar policies usando os novos roles
-- USUARIOS
DROP POLICY IF EXISTS "Super admin total usuarios" ON public.usuarios;
CREATE POLICY "Dev total usuarios" ON public.usuarios
  FOR ALL TO authenticated USING (has_role(auth.uid(),'dev')) WITH CHECK (has_role(auth.uid(),'dev'));

DROP POLICY IF EXISTS "Diretor ve sua arvore" ON public.usuarios;
CREATE POLICY "Diretor ve sua arvore" ON public.usuarios
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'diretor_comercial')
    AND (
      diretor_id = auth.uid()
      OR is_diretor_de_consultor(auth.uid(), id)
      OR id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Diretor reatribui consultor" ON public.usuarios;
CREATE POLICY "Diretor reatribui consultor" ON public.usuarios
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(),'diretor_comercial')
    AND role = 'consultor'
    AND is_diretor_de_consultor(auth.uid(), id)
  ) WITH CHECK (
    has_role(auth.uid(),'diretor_comercial')
    AND role = 'consultor'
    AND (gestor_id IS NULL OR is_diretor_de_gestor(auth.uid(), gestor_id))
  );

-- CLIENTES
DROP POLICY IF EXISTS "Super admin total clientes" ON public.clientes;
CREATE POLICY "Dev total clientes" ON public.clientes
  FOR ALL TO authenticated USING (has_role(auth.uid(),'dev')) WITH CHECK (has_role(auth.uid(),'dev'));

DROP POLICY IF EXISTS "Diretor ve clientes da arvore" ON public.clientes;
CREATE POLICY "Diretor ve clientes da arvore" ON public.clientes
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'diretor_comercial')
    AND is_diretor_de_consultor(auth.uid(), consultor_atual_id)
  );

DROP POLICY IF EXISTS "Diretor transfere clientes" ON public.clientes;
CREATE POLICY "Diretor transfere clientes" ON public.clientes
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(),'diretor_comercial')
    AND is_diretor_de_consultor(auth.uid(), consultor_atual_id)
  ) WITH CHECK (
    has_role(auth.uid(),'diretor_comercial')
    AND is_diretor_de_consultor(auth.uid(), consultor_atual_id)
  );

-- VISITAS
DROP POLICY IF EXISTS "Super admin total visitas" ON public.visitas;
CREATE POLICY "Dev total visitas" ON public.visitas
  FOR ALL TO authenticated USING (has_role(auth.uid(),'dev')) WITH CHECK (has_role(auth.uid(),'dev'));

DROP POLICY IF EXISTS "Diretor ve visitas da arvore" ON public.visitas;
CREATE POLICY "Diretor ve visitas da arvore" ON public.visitas
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'diretor_comercial')
    AND is_diretor_de_consultor(auth.uid(), consultor_executor_id)
  );

-- LOGS_TRANSFERENCIA
DROP POLICY IF EXISTS "Super admin total logs" ON public.logs_transferencia;
CREATE POLICY "Dev total logs" ON public.logs_transferencia
  FOR ALL TO authenticated USING (has_role(auth.uid(),'dev')) WITH CHECK (has_role(auth.uid(),'dev'));

DROP POLICY IF EXISTS "Diretor ve logs da arvore" ON public.logs_transferencia;
CREATE POLICY "Diretor ve logs da arvore" ON public.logs_transferencia
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'diretor_comercial')
    AND (
      is_diretor_de_consultor(auth.uid(), de_consultor_id)
      OR is_diretor_de_consultor(auth.uid(), para_consultor_id)
    )
  );

-- CONVITES
DROP POLICY IF EXISTS "Super admin total convites" ON public.convites_acesso;
CREATE POLICY "Dev total convites" ON public.convites_acesso
  FOR ALL TO authenticated USING (has_role(auth.uid(),'dev')) WITH CHECK (has_role(auth.uid(),'dev'));

-- APP_CONFIG
DROP POLICY IF EXISTS "Super admin total app_config" ON public.app_config;
CREATE POLICY "Dev total app_config" ON public.app_config
  FOR ALL TO authenticated USING (has_role(auth.uid(),'dev')) WITH CHECK (has_role(auth.uid(),'dev'));
