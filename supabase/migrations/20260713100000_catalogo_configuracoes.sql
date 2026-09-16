-- Tabela para configurações gerais do catálogo por empresa
CREATE TABLE IF NOT EXISTS catalogo_configuracoes (
  empresa_id UUID PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
  nome_loja TEXT NOT NULL DEFAULT 'ERP Odonto',
  cnpj TEXT DEFAULT '',
  email_contato TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  manutencao BOOLEAN NOT NULL DEFAULT false,
  msg_manutencao TEXT NOT NULL DEFAULT 'Estamos em manutenção. Volte em breve!',
  exibir_precos BOOLEAN NOT NULL DEFAULT true,
  exibir_estoque BOOLEAN NOT NULL DEFAULT false,
  checkout_habilitado BOOLEAN NOT NULL DEFAULT true,
  cupons_habilitado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE catalogo_configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalogo_configuracoes_empresa ON catalogo_configuracoes
  FOR ALL
  USING (
    empresa_id = auth.uid()::uuid
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_catalogo_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_catalogo_configuracoes_updated_at
  BEFORE UPDATE ON catalogo_configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_catalogo_configuracoes_updated_at();

-- Índice
CREATE INDEX idx_catalogo_configuracoes_empresa ON catalogo_configuracoes(empresa_id);
