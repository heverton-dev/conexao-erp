-- ============================================================
-- 20260718030000_tipos_ossos_refactor.sql
-- Refactor: catalogo_tipos_fresagens -> catalogo_tipos_ossos
-- ============================================================

-- 1. Migrar dados existentes para nova tabela
-- Valores atuais de tipo_osso em protocolos: D1, D3, D5, "Hard (I-II)", "Soft (III-IV)"
-- Criar tipos de osso padrão para cada empresa

-- 2. Criar tabela catalogo_tipos_ossos
CREATE TABLE IF NOT EXISTS catalogo_tipos_ossos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- 3. Habilitar RLS
ALTER TABLE catalogo_tipos_ossos ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_tipos_ossos_select ON catalogo_tipos_ossos
  FOR SELECT USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());
CREATE POLICY catalogo_tipos_ossos_insert ON catalogo_tipos_ossos
  FOR INSERT WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session());
CREATE POLICY catalogo_tipos_ossos_update ON catalogo_tipos_ossos
  FOR UPDATE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());
CREATE POLICY catalogo_tipos_ossos_delete ON catalogo_tipos_ossos
  FOR DELETE USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- 4. Seed: Inserir tipos de osso padrão para cada empresa existente
INSERT INTO catalogo_tipos_ossos (empresa_id, nome, sigla, ativo)
SELECT DISTINCT e.id, t.nome, t.sigla, true
FROM empresas e
CROSS JOIN (VALUES
  ('D1 - Muito Densa', 'D1'),
  ('D2 - Densa', 'D2'),
  ('D3 - Média', 'D3'),
  ('D4 - Baixa Densidade', 'D4'),
  ('D5 - Muito Baixa Densidade', 'D5')
) AS t(nome, sigla)
WHERE e.ativo = true
ON CONFLICT (empresa_id, nome) DO NOTHING;

-- 5. Mapear tipo_osso existente nos protocolos para o novo nome
-- D1 -> "D1 - Muito Densa", D2 -> "D2 - Densa", etc.
UPDATE catalogo_protocolos_fresagens
SET tipo_osso = CASE tipo_osso
  WHEN 'D1' THEN 'D1 - Muito Densa'
  WHEN 'D2' THEN 'D2 - Densa'
  WHEN 'D3' THEN 'D3 - Média'
  WHEN 'D4' THEN 'D4 - Baixa Densidade'
  WHEN 'D5' THEN 'D5 - Muito Baixa Densidade'
  WHEN 'Hard (I-II)' THEN 'D1 - Muito Densa'
  WHEN 'Soft (III-IV)' THEN 'D3 - Média'
  ELSE tipo_osso
END
WHERE tipo_osso IN ('D1','D2','D3','D4','D5','Hard (I-II)','Soft (III-IV)');

-- 6. Drop tabela antiga (após migração de dados)
DROP TABLE IF EXISTS catalogo_tipos_fresagens;

-- 7. Índices
CREATE INDEX IF NOT EXISTS idx_tipos_ossos_empresa ON catalogo_tipos_ossos(empresa_id);
