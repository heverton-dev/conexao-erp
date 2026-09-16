-- ============================================================
-- Migration 00045: Corrigir empresa_id dos materiais do Hub
-- ============================================================
-- Problema: A seed 00044 usa "LIMIT 1" para pegar a primeira empresa,
-- mas o RLS verifica empresa_id = get_current_empresa_id() baseado no perfil do usuário.
-- Se o usuário pertence a uma empresa diferente, os materiais não aparecem.

DO $$
DECLARE
  v_user UUID;
  v_user_empresa UUID;
  v_count INTEGER;
BEGIN
  -- Pega o primeiro usuário auth
  SELECT id INTO v_user FROM auth.users LIMIT 1;
  
  IF v_user IS NULL THEN
    RAISE NOTICE 'Nenhum usuário encontrado';
    RETURN;
  END IF;
  
  -- Pega a empresa do perfil desse usuário
  SELECT empresa_id INTO v_user_empresa FROM profiles WHERE id = v_user;
  
  RAISE NOTICE 'Usuário: %, Empresa do perfil: %', v_user, v_user_empresa;
  
  -- Verifica quantos materiais existem e qual empresa_id eles têm
  SELECT COUNT(*) INTO v_count FROM hub_materials;
  RAISE NOTICE 'Total de materiais: %', v_count;
  
  -- Atualiza TODOS os materiais para usar a empresa do usuário logado
  IF v_user_empresa IS NOT NULL THEN
    UPDATE hub_materials SET empresa_id = v_user_empresa;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Materiais atualizados para empresa_id=%: %', v_user_empresa, v_count;
    
    UPDATE hub_collections SET empresa_id = v_user_empresa;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Trilhas atualizadas para empresa_id=%: %', v_user_empresa, v_count;
  ELSE
    RAISE NOTICE 'AVISO: Usuário não tem empresa_id no perfil!';
    RAISE NOTICE 'O usuário precisa ter empresa_id definido em profiles para o RLS funcionar.';
  END IF;
END $$;
