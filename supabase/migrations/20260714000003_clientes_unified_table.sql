-- ============================================================
-- Migration: Tabela clientes unificada (multi-tenant)
-- Substitui a VIEW por uma tabela física com suporte a
-- cadastros aprovados, CRM e importação via CSV
-- ============================================================

-- 1. Backup de dados existentes (tanto VIEW quanto TABLE legada)
CREATE TEMPORARY TABLE _backup_clientes AS
SELECT * FROM public.clientes;

-- 2. Dropar VIEW/TABLE existente
DROP VIEW IF EXISTS public.clientes CASCADE;

-- 3. Criar tabela física unificada
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,

  -- Referência ao cadastro (lead)
  cadastro_id UUID REFERENCES public.cadastros(id) ON DELETE SET NULL,
  codigo_cliente TEXT,
  tipo_pessoa TEXT CHECK (tipo_pessoa IN ('PF', 'PJ')),

  -- Dados pessoais
  nome_doutor TEXT NOT NULL,
  nome_clinica TEXT,
  telefone_contato TEXT,
  lead_email TEXT,
  lead_whatsapp TEXT,

  -- CRM / Consultor
  consultor_atual_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  cidade TEXT,
  ultima_visita TIMESTAMPTZ,

  -- Endereço (denormalizado)
  cep TEXT,
  rua TEXT,
  numero TEXT,
  bairro TEXT,
  complemento TEXT,
  estado TEXT,

  -- Observações
  observacoes TEXT DEFAULT '',
  colaborador TEXT,

  -- Controle de origem
  fonte TEXT NOT NULL DEFAULT 'cadastros' CHECK (fonte IN ('cadastros', 'csv', 'manual', 'crm')),
  dados_extras JSONB DEFAULT '{}',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 4. Índices
CREATE INDEX idx_clientes_empresa ON public.clientes(empresa_id);
CREATE INDEX idx_clientes_cadastro ON public.clientes(cadastro_id);
CREATE INDEX idx_clientes_consultor ON public.clientes(consultor_atual_id);
CREATE INDEX idx_clientes_empresa_codigo ON public.clientes(empresa_id, codigo_cliente);
CREATE INDEX idx_clientes_empresa_status ON public.clientes(empresa_id, status);

-- 5. RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- SELECT: usuários veem clientes da sua empresa
CREATE POLICY "usuarios_veem_clientes_empresa"
  ON public.clientes FOR SELECT
  USING (empresa_id = (
    SELECT empresa_id FROM public.usuarios
    WHERE id = auth.uid()
  ));

-- SELECT: consultores veem seus próprios clientes (por consultor_atual_id)
CREATE POLICY "consultor_ve_seus_clientes"
  ON public.clientes FOR SELECT
  USING (consultor_atual_id = auth.uid());

-- INSERT: usuários podem inserir clientes na sua empresa
CREATE POLICY "inserir_clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (empresa_id = (
    SELECT empresa_id FROM public.usuarios
    WHERE id = auth.uid()
  ));

-- UPDATE: usuários podem atualizar clientes da sua empresa
CREATE POLICY "atualizar_clientes"
  ON public.clientes FOR UPDATE
  USING (empresa_id = (
    SELECT empresa_id FROM public.usuarios
    WHERE id = auth.uid()
  ));

-- DELETE: usuários podem deletar clientes da sua empresa
CREATE POLICY "deletar_clientes"
  ON public.clientes FOR DELETE
  USING (empresa_id = (
    SELECT empresa_id FROM public.usuarios
    WHERE id = auth.uid()
  ));

-- 6. Migrar dados do backup (TABLE legada do CRM tem prioridade)
INSERT INTO public.clientes (
  id, empresa_id, nome_doutor, nome_clinica, telefone_contato,
  consultor_atual_id, status, cidade, ultima_visita,
  criado_em, atualizado_em, fonte
)
SELECT
  b.id,
  COALESCE(b.empresa_id, (SELECT id FROM public.empresas LIMIT 1)) AS empresa_id,
  COALESCE(b.nome_doutor, 'Sem nome') AS nome_doutor,
  b.nome_clinica,
  b.telefone_contato,
  b.consultor_atual_id,
  COALESCE(b.status, 'ativo') AS status,
  b.cidade,
  b.ultima_visita,
  COALESCE(b.criado_em, now()) AS criado_em,
  COALESCE(b.atualizado_em, now()) AS atualizado_em,
  'crm' AS fonte
FROM _backup_clientes b
WHERE b.id IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Migrar cadastros aprovados que não estão na tabela ainda
INSERT INTO public.clientes (
  empresa_id, cadastro_id, codigo_cliente, tipo_pessoa,
  nome_doutor, nome_clinica, telefone_contato,
  lead_email, lead_whatsapp, observacoes, colaborador,
  status, fonte, criado_em
)
SELECT
  c.empresa_id,
  c.id AS cadastro_id,
  c.codigo_cliente,
  c.tipo_pessoa,
  COALESCE(c.lead_nome, c.nome_temporario, 'Sem nome') AS nome_doutor,
  NULL AS nome_clinica,
  c.lead_whatsapp AS telefone_contato,
  c.lead_email,
  c.lead_whatsapp,
  c.observacoes,
  c.colaborador,
  'ativo' AS status,
  'cadastros' AS fonte,
  c.created_at
FROM public.cadastros c
WHERE c.status = 'aprovado'
  AND c.empresa_id IS NOT NULL
  AND c.id NOT IN (SELECT cadastro_id FROM public.clientes WHERE cadastro_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Limpar tabela temporária
DROP TABLE IF EXISTS _backup_clientes;

-- 8. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_clientes_updated_at();
