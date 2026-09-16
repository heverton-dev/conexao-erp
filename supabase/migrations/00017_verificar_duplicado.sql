-- ============================================================
-- Migration 00017: Verificação de CPF/CNPJ Duplicado
-- ============================================================

-- Função pública que verifica se um CPF ou CNPJ já existe em
-- cadastros com status que indiquem solicitação ativa.
-- Retorna JSONB: { duplicado: bool, tipo: "CPF"|"CNPJ"|null, cadastro_id: uuid|null }
CREATE OR REPLACE FUNCTION public.verificar_documento_duplicado(
  documento_texto TEXT,
  tipo_documento  TEXT  -- 'CPF' ou 'CNPJ'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc_limpo TEXT;
  v_cadastro_id UUID;
BEGIN
  -- Remove tudo que não for dígito
  v_doc_limpo := regexp_replace(documento_texto, '\D', '', 'g');

  IF tipo_documento = 'CPF' THEN
    SELECT id INTO v_cadastro_id
    FROM public.cadastros
    WHERE regexp_replace(cpf, '\D', '', 'g') = v_doc_limpo
      AND status NOT IN ('reprovado', 'cancelado')
    LIMIT 1;

  ELSIF tipo_documento = 'CNPJ' THEN
    SELECT id INTO v_cadastro_id
    FROM public.cadastros
    WHERE regexp_replace(cnpj, '\D', '', 'g') = v_doc_limpo
      AND status NOT IN ('reprovado', 'cancelado')
    LIMIT 1;
  END IF;

  IF v_cadastro_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'duplicado', true,
      'tipo', tipo_documento,
      'cadastro_id', v_cadastro_id
    );
  ELSE
    RETURN jsonb_build_object(
      'duplicado', false,
      'tipo', tipo_documento,
      'cadastro_id', null
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verificar_documento_duplicado(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verificar_documento_duplicado(TEXT, TEXT) TO authenticated;
