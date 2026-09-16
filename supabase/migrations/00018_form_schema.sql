-- ============================================================
-- Migration 00018: form_schema — Personalização do Formulário
-- ============================================================

CREATE TABLE IF NOT EXISTS public.form_schema (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_pessoa  TEXT NOT NULL CHECK (tipo_pessoa IN ('PF','PJ','ambos')),
  etapa        TEXT NOT NULL CHECK (etapa IN ('dados','endereco','documentos')),
  campo_key    TEXT NOT NULL,
  label        TEXT NOT NULL,
  tipo_input   TEXT NOT NULL DEFAULT 'text',
  opcoes       JSONB DEFAULT '[]'::jsonb,
  obrigatorio  BOOL NOT NULL DEFAULT true,
  visivel      BOOL NOT NULL DEFAULT true,
  ordem        INT  NOT NULL DEFAULT 0,
  is_custom    BOOL NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tipo_pessoa, campo_key)
);

ALTER TABLE public.form_schema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_schema_read_all" ON public.form_schema
  FOR SELECT USING (true);

CREATE POLICY "form_schema_write_superadmin" ON public.form_schema
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- ─── Seed: Campos PF ─────────────────────────────────────────────────────────
INSERT INTO public.form_schema
  (tipo_pessoa, etapa, campo_key, label, tipo_input, obrigatorio, visivel, ordem, is_custom)
VALUES
  ('PF','dados','nome',              'Nome Completo',        'text',  true,  true,  1,  false),
  ('PF','dados','data_nascimento',   'Data de Nascimento',   'date',  true,  true,  2,  false),
  ('PF','dados','estado',            'Estado (UF)',          'text',  false, true,  3,  false),
  ('PF','dados','cro',               'Número do CRO/TPD',   'text',  true,  true,  4,  false),
  ('PF','dados','cro_uf',            'UF do CRO',           'text',  false, true,  5,  false),
  ('PF','dados','data_emissao_cro',  'Data Emissão CRO/TPD','date',  false, true,  6,  false),
  ('PF','dados','cpf',               'CPF',                 'tel',   true,  true,  7,  false),
  ('PF','dados','email_comunicacao', 'E-mail Comunicação',  'email', true,  true,  8,  false),
  ('PF','dados','email_nf',          'E-mail para NF',      'email', false, true,  9,  false),
  ('PF','dados','tel_fixo',          'Telefone Fixo',       'tel',   false, true,  10, false),
  ('PF','dados','celular1',          'Celular 01',          'tel',   false, true,  11, false),
  ('PF','dados','celular2',          'Celular 02',          'tel',   false, true,  12, false),

-- ─── Seed: Campos PJ ─────────────────────────────────────────────────────────
  ('PJ','dados','razao_social',       'Razão Social',           'text',  true,  true,  1,  false),
  ('PJ','dados','nome_fantasia',      'Nome Fantasia',          'text',  true,  true,  2,  false),
  ('PJ','dados','cnpj',               'CNPJ',                   'tel',   true,  true,  3,  false),
  ('PJ','dados','inscricao_estadual', 'Inscrição Estadual',     'text',  true,  true,  4,  false),
  ('PJ','dados','cro',                'Número do CRO/TPD',      'text',  true,  true,  5,  false),
  ('PJ','dados','cro_uf',             'UF do CRO',              'text',  false, true,  6,  false),
  ('PJ','dados','data_emissao_cro',   'Data Emissão CRO/TPD',   'date',  false, true,  7,  false),
  ('PJ','dados','email_comunicacao',  'E-mail Comunicação',     'email', true,  true,  8,  false),
  ('PJ','dados','email_nf',           'E-mail para NF',         'email', false, true,  9,  false),
  ('PJ','dados','tel_fixo',           'Telefone Fixo',          'tel',   false, true,  10, false),
  ('PJ','dados','celular1',           'Celular 01',             'tel',   false, true,  11, false),
  ('PJ','dados','celular2',           'Celular 02',             'tel',   false, true,  12, false),

-- ─── Seed: Endereço (ambos) ──────────────────────────────────────────────────
  ('ambos','endereco','cep',          'CEP',                    'cep',   true,  true,  1,  false),
  ('ambos','endereco','rua',          'Rua',                    'text',  true,  true,  2,  false),
  ('ambos','endereco','numero',       'Número',                 'text',  true,  true,  3,  false),
  ('ambos','endereco','bairro',       'Bairro',                 'text',  true,  true,  4,  false),
  ('ambos','endereco','complemento',  'Complemento',            'text',  false, true,  5,  false),
  ('ambos','endereco','cidade',       'Cidade',                 'text',  true,  true,  6,  false),
  ('ambos','endereco','estado_end',   'Estado',                 'text',  true,  true,  7,  false),

-- ─── Seed: Documentos PF ────────────────────────────────────────────────────
  ('PF','documentos','cro_frente',           'CRO/TPD — Frente',                  'documento', true,  true, 1, false),
  ('PF','documentos','cro_verso',            'CRO/TPD — Verso',                   'documento', true,  true, 2, false),
  ('PF','documentos','cnh_frente',           'CNH/CPF/RG — Frente',               'documento', true,  true, 3, false),
  ('PF','documentos','cnh_verso',            'CNH/CPF/RG — Verso',                'documento', true,  true, 4, false),
  ('PF','documentos','comprovante_endereco', 'Comprovante de Endereço',            'documento', true,  true, 5, false),

-- ─── Seed: Documentos PJ ────────────────────────────────────────────────────
  ('PJ','documentos','cro_frente',           'CRO/TPD — Frente',                  'documento', true,  true, 1, false),
  ('PJ','documentos','cro_verso',            'CRO/TPD — Verso',                   'documento', true,  true, 2, false),
  ('PJ','documentos','cnh_frente',           'CNH/CPF/RG — Frente',               'documento', true,  true, 3, false),
  ('PJ','documentos','cnh_verso',            'CNH/CPF/RG — Verso',                'documento', true,  true, 4, false),
  ('PJ','documentos','comprovante_endereco', 'Comprovante de Endereço',            'documento', true,  true, 5, false),
  ('PJ','documentos','contrato_social',      'Contrato Social',                    'documento', true,  true, 6, false),
  ('PJ','documentos','declaracao_prestacao', 'Declaração de Prestação de Serviço', 'documento', true,  true, 7, false)

ON CONFLICT (tipo_pessoa, campo_key) DO NOTHING;
