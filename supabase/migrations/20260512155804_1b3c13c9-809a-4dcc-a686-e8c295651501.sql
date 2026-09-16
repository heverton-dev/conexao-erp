
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS meta_diaria_visitas integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.set_meta_diaria_visitas(_user_id uuid, _meta integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_target_role public.app_role;
  v_target_gestor uuid;
BEGIN
  IF _meta < 0 OR _meta > 1000 THEN
    RAISE EXCEPTION 'Meta inválida';
  END IF;

  SELECT role, gestor_id INTO v_target_role, v_target_gestor
  FROM public.usuarios WHERE id = _user_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  IF public.has_role(v_caller, 'dev') THEN
    NULL;
  ELSIF public.has_role(v_caller, 'diretor_comercial') THEN
    IF NOT (
      public.is_diretor_de_consultor(v_caller, _user_id)
      OR public.is_diretor_de_gestor(v_caller, _user_id)
    ) THEN
      RAISE EXCEPTION 'Sem permissão para definir meta deste usuário';
    END IF;
  ELSIF public.has_role(v_caller, 'gestor') THEN
    IF v_target_role <> 'consultor' OR v_target_gestor <> v_caller THEN
      RAISE EXCEPTION 'Gestor só pode definir meta dos próprios consultores';
    END IF;
  ELSE
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  UPDATE public.usuarios SET meta_diaria_visitas = _meta WHERE id = _user_id;
END;
$$;
