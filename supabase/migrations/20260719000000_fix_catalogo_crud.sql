-- FIX 1: Adicionar coluna diametro_plataforma_mm em catalogo_implantes (ausente no schema)
ALTER TABLE catalogo_implantes ADD COLUMN IF NOT EXISTS diametro_plataforma_mm numeric;

-- FIX 2: Criar tabela catalogo_parafusos_retensao (não existe no schema)
CREATE TABLE IF NOT EXISTS catalogo_parafusos_retensao (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  sku text NOT NULL,
  nome text NOT NULL,
  torque_ncm numeric,
  vinculo_tipo text, -- 'abutment' | 'componente'
  vinculo_sku text,
  chave_id uuid REFERENCES catalogo_chaves_ferramental(id),
  chave_sku text,
  material text,
  sigla text,
  descricao text,
  preco numeric,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(empresa_id, sku)
);

-- RLS para parafusos_retensao
ALTER TABLE catalogo_parafusos_retensao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parafusos_retensao_empresa" ON catalogo_parafusos_retensao
  USING (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (empresa_id = (SELECT empresa_id FROM profiles WHERE id = auth.uid()));

-- FIX 3: Tornar tipo_reabilitacao_id nullable em catalogo_abutments (já deveria ser nullable)
ALTER TABLE catalogo_abutments ALTER COLUMN tipo_reabilitacao_id DROP NOT NULL;

-- FIX 4: Seed tipos_reabilitacao para empresas que não possuem
INSERT INTO catalogo_tipos_reabilitacao (empresa_id, nome, sigla, ativo)
SELECT e.id, t.nome, t.sigla, true
FROM empresas e
CROSS JOIN (VALUES ('Direto', 'DIR'), ('Indireto', 'IND')) AS t(nome, sigla)
WHERE e.ativo = true
AND NOT EXISTS (
  SELECT 1 FROM catalogo_tipos_reabilitacao r
  WHERE r.empresa_id = e.id AND r.sigla = t.sigla
);
