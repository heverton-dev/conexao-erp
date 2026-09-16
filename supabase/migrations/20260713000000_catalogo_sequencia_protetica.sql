CREATE TABLE catalogo_sequencia_protetica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  abutment_sku text NOT NULL,
  tipo_workflow text NOT NULL CHECK (tipo_workflow IN ('analógico', 'digital')),
  etapa_ordem int NOT NULL,
  etapa_nome text NOT NULL,
  acessorio_sku text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE catalogo_sequencia_protetica ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_seq_prot_empresa ON catalogo_sequencia_protetica
  FOR ALL USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

CREATE INDEX idx_catalogo_seq_prot_abutment ON catalogo_sequencia_protetica(abutment_sku, empresa_id);
