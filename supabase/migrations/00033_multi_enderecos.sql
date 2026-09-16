-- ============================================================
-- Migration 00033: Multi-endereços (empresa, entrega, cobrança)
-- ============================================================

-- 1. Criar enum tipo_endereco
CREATE TYPE public.tipo_endereco AS ENUM ('empresa', 'entrega', 'cobranca');

-- 2. Migrar coluna tipo_endereco de text para enum
ALTER TABLE public.cadastros_enderecos ALTER COLUMN tipo_endereco DROP DEFAULT;
ALTER TABLE public.cadastros_enderecos
  ALTER COLUMN tipo_endereco TYPE public.tipo_endereco
  USING CASE
    WHEN tipo_endereco IS NULL OR tipo_endereco = '' THEN 'empresa'::public.tipo_endereco
    WHEN tipo_endereco = 'clinica' THEN 'empresa'::public.tipo_endereco
    ELSE tipo_endereco::public.tipo_endereco
  END;
ALTER TABLE public.cadastros_enderecos ALTER COLUMN tipo_endereco SET NOT NULL;

-- 3. Remover UNIQUE(cadastro_id), adicionar UNIQUE(cadastro_id, tipo_endereco)
DO $$
DECLARE
  con_name text;
BEGIN
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.cadastros_enderecos'::regclass
    AND contype = 'u'
    AND conkey = (
      SELECT array_agg(attnum ORDER BY attnum)
      FROM pg_attribute
      WHERE attrelid = 'public.cadastros_enderecos'::regclass
        AND attname = 'cadastro_id'
    );
  IF con_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cadastros_enderecos DROP CONSTRAINT ' || con_name;
  END IF;
END $$;

ALTER TABLE public.cadastros_enderecos ADD CONSTRAINT unique_cadastro_tipo_endereco UNIQUE (cadastro_id, tipo_endereco);

-- 4. Backfill: garantir que registros existentes tenham tipo = 'empresa'
UPDATE public.cadastros_enderecos SET tipo_endereco = 'empresa' WHERE tipo_endereco IS NULL;

-- 5. Atualizar view clientes: joins por tipo de endereço
DROP VIEW IF EXISTS public.clientes;
CREATE VIEW public.clientes AS
SELECT
  c.id, c.codigo_cliente, c.status, c.tipo_pessoa, c.colaborador,
  c.observacoes, c.created_by, c.created_at, c.updated_at,
  c.token_acesso, c.nome_temporario, c.tipo_acao, c.forma_compartilhamento,
  c.link_expiracao, c.data_criacao_link, c.data_finalizacao,
  c.comentario_reprovacao, c.revisado, c.consulta_cnpj_realizada,
  c.consulta_cro_realizada, c.status_verificacao_token, c.lead_email,
  c.lead_whatsapp, c.lead_nome, c.data_consulta, c.revisoes, c.is_demo,
  c.link_acessado, c.inicio_preenchimento, c."2fa_canal", c."2fa_contato",
  c."2fa_token", c."2fa_expiracao", c.dados_extras, c.campos_correcao,
  c.empresa_id,
  e_empresa.id          AS endereco_empresa_id,
  e_empresa.cep         AS endereco_empresa_cep,
  e_empresa.rua         AS endereco_empresa_rua,
  e_empresa.numero      AS endereco_empresa_numero,
  e_empresa.bairro      AS endereco_empresa_bairro,
  e_empresa.complemento AS endereco_empresa_complemento,
  e_empresa.cidade      AS endereco_empresa_cidade,
  e_empresa.estado      AS endereco_empresa_estado,
  e_entrega.id          AS endereco_entrega_id,
  e_entrega.cep         AS endereco_entrega_cep,
  e_entrega.rua         AS endereco_entrega_rua,
  e_entrega.numero      AS endereco_entrega_numero,
  e_entrega.bairro      AS endereco_entrega_bairro,
  e_entrega.complemento AS endereco_entrega_complemento,
  e_entrega.cidade      AS endereco_entrega_cidade,
  e_entrega.estado      AS endereco_entrega_estado,
  e_cobranca.id          AS endereco_cobranca_id,
  e_cobranca.cep         AS endereco_cobranca_cep,
  e_cobranca.rua         AS endereco_cobranca_rua,
  e_cobranca.numero      AS endereco_cobranca_numero,
  e_cobranca.bairro      AS endereco_cobranca_bairro,
  e_cobranca.complemento AS endereco_cobranca_complemento,
  e_cobranca.cidade      AS endereco_cobranca_cidade,
  e_cobranca.estado      AS endereco_cobranca_estado
FROM public.cadastros c
LEFT JOIN public.cadastros_enderecos e_empresa  ON e_empresa.cadastro_id  = c.id AND e_empresa.tipo_endereco  = 'empresa'
LEFT JOIN public.cadastros_enderecos e_entrega  ON e_entrega.cadastro_id  = c.id AND e_entrega.tipo_endereco  = 'entrega'
LEFT JOIN public.cadastros_enderecos e_cobranca ON e_cobranca.cadastro_id = c.id AND e_cobranca.tipo_endereco = 'cobranca';

-- ============================================================
-- Form Schema: expandir etapas de endereço
-- ============================================================

-- 6. Remover CHECK antigo
ALTER TABLE public.form_schema DROP CONSTRAINT IF EXISTS form_schema_etapa_check;

-- 7. Migrar registros existentes de endereco para endereco_empresa (precisa vir ANTES do novo CHECK)
UPDATE public.form_schema SET etapa = 'endereco_empresa' WHERE etapa = 'endereco';

-- 8. Adicionar novo CHECK com as novas etapas
ALTER TABLE public.form_schema ADD CONSTRAINT form_schema_etapa_check
  CHECK (etapa IN ('dados','endereco_empresa','endereco_entrega','endereco_cobranca','documentos'));

-- 9. Remover UNIQUE antigo (tipo_pessoa, campo_key) e criar (tipo_pessoa, etapa, campo_key)
ALTER TABLE public.form_schema DROP CONSTRAINT IF EXISTS form_schema_tipo_pessoa_campo_key_key;
ALTER TABLE public.form_schema ADD UNIQUE (tipo_pessoa, etapa, campo_key);

-- 10. Clonar campos de endereco_empresa para endereco_entrega e endereco_cobranca
INSERT INTO public.form_schema (tipo_pessoa, etapa, campo_key, label, tipo_input, opcoes, obrigatorio, visivel, ordem, is_custom)
SELECT tipo_pessoa, 'endereco_entrega', campo_key, label, tipo_input, opcoes, obrigatorio, visivel, ordem, is_custom
FROM public.form_schema WHERE etapa = 'endereco_empresa'
ON CONFLICT (tipo_pessoa, etapa, campo_key) DO NOTHING;

INSERT INTO public.form_schema (tipo_pessoa, etapa, campo_key, label, tipo_input, opcoes, obrigatorio, visivel, ordem, is_custom)
SELECT tipo_pessoa, 'endereco_cobranca', campo_key, label, tipo_input, opcoes, obrigatorio, visivel, ordem, is_custom
FROM public.form_schema WHERE etapa = 'endereco_empresa'
ON CONFLICT (tipo_pessoa, etapa, campo_key) DO NOTHING;

-- ============================================================
-- RPC: update_cadastro_from_precadastro aceita array de endereços
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_cadastro_from_precadastro(
  token_text text,
  tipo_pessoa text,
  pf_data jsonb,
  pj_data jsonb,
  enderecos_data jsonb  -- array de {tipo, cep, rua, numero, bairro, complemento, cidade, estado}
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cad_id uuid;
BEGIN
  SELECT id INTO cad_id FROM public.cadastros WHERE token_acesso = token_text;
  IF cad_id IS NULL THEN RAISE EXCEPTION 'Token invalido'; END IF;

  UPDATE public.cadastros SET
    tipo_pessoa = update_cadastro_from_precadastro.tipo_pessoa,
    status = 'dados_enviados',
    data_finalizacao = now()
  WHERE id = cad_id;

  IF tipo_pessoa = 'PF' THEN
    INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf, data_emissao_cro, email_comunicacao, email_nf, tel_fixo, celular1, celular2, estado)
    VALUES (
      cad_id,
      pf_data ->> 'nome',
      pf_data ->> 'cpf',
      (pf_data ->> 'data_nascimento')::date,
      pf_data ->> 'cro',
      pf_data ->> 'cro_uf',
      (pf_data ->> 'data_emissao_cro')::date,
      pf_data ->> 'email_comunicacao',
      pf_data ->> 'email_nf',
      pf_data ->> 'tel_fixo',
      pf_data ->> 'celular1',
      pf_data ->> 'celular2',
      pf_data ->> 'estado'
    )
    ON CONFLICT (cadastro_id) DO UPDATE SET
      nome = EXCLUDED.nome, cpf = EXCLUDED.cpf;
  ELSE
    INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cnpj, inscricao_estadual, cro, cro_uf, data_emissao_cro, email_comunicacao, email_nf, tel_fixo, celular1, celular2)
    VALUES (
      cad_id,
      pj_data ->> 'razao_social',
      pj_data ->> 'nome_fantasia',
      pj_data ->> 'cnpj',
      pj_data ->> 'inscricao_estadual',
      pj_data ->> 'cro',
      pj_data ->> 'cro_uf',
      (pj_data ->> 'data_emissao_cro')::date,
      pj_data ->> 'email_comunicacao',
      pj_data ->> 'email_nf',
      pj_data ->> 'tel_fixo',
      pj_data ->> 'celular1',
      pj_data ->> 'celular2'
    )
    ON CONFLICT (cadastro_id) DO UPDATE SET
      razao_social = EXCLUDED.razao_social, cnpj = EXCLUDED.cnpj;
  END IF;

  -- Substitui todos os endereços do cadastro
  DELETE FROM public.cadastros_enderecos WHERE cadastro_id = cad_id;

  INSERT INTO public.cadastros_enderecos (cadastro_id, tipo_endereco, cep, rua, numero, bairro, complemento, cidade, estado)
  SELECT
    cad_id,
    (elem ->> 'tipo')::public.tipo_endereco,
    elem ->> 'cep',
    elem ->> 'rua',
    elem ->> 'numero',
    elem ->> 'bairro',
    elem ->> 'complemento',
    elem ->> 'cidade',
    elem ->> 'estado'
  FROM jsonb_array_elements(enderecos_data) AS elem;
END;
$$;
