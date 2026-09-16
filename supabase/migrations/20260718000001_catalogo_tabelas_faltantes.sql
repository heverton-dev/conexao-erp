-- ============================================================
-- Migration: Tabelas faltantes do módulo Catálogo
-- Data: 2026-07-18
-- Descrição: Cria tabelas referenciadas no código mas ausentes no banco
-- ============================================================

-- ============================================================
-- 1. catalogo_grupos_clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_grupos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_tipo TEXT NOT NULL DEFAULT 'percentual' CHECK (preco_tipo IN ('percentual', 'fixo')),
  desconto_percentual NUMERIC(5,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_grupos_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_grupos_clientes
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_grupos_clientes_empresa ON catalogo_grupos_clientes(empresa_id);

-- ============================================================
-- 2. catalogo_clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cadastro_id UUID,
  user_id UUID,
  grupo_id UUID REFERENCES catalogo_grupos_clientes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  tipo TEXT NOT NULL DEFAULT 'cliente' CHECK (tipo IN ('cliente', 'parceiro', 'revendedor')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_clientes
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_clientes_empresa ON catalogo_clientes(empresa_id);
CREATE INDEX idx_clientes_user ON catalogo_clientes(user_id);
CREATE INDEX idx_clientes_grupo ON catalogo_clientes(grupo_id);

-- ============================================================
-- 3. catalogo_cliente_permissoes
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_cliente_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES catalogo_clientes(id) ON DELETE CASCADE,
  permissao_key TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_cliente_permissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_cliente_permissoes
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE UNIQUE INDEX idx_cliente_perm_uniq ON catalogo_cliente_permissoes(cliente_id, permissao_key);

-- ============================================================
-- 4. catalogo_favoritos
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES catalogo_clientes(id) ON DELETE CASCADE,
  produto_sku TEXT NOT NULL,
  produto_tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_favoritos
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE UNIQUE INDEX idx_favoritos_uniq ON catalogo_favoritos(empresa_id, cliente_id, produto_sku);

-- ============================================================
-- 5. catalogo_solicitacoes_acesso
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_solicitacoes_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  responded_by UUID,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_solicitacoes_acesso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_solicitacoes_acesso
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_solicitacoes_empresa ON catalogo_solicitacoes_acesso(empresa_id);
CREATE INDEX idx_solicitacoes_status ON catalogo_solicitacoes_acesso(status);

-- ============================================================
-- 6. catalogo_orcamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID,
  cliente_id UUID REFERENCES catalogo_clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  token_acesso TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'reprovado', 'pedido', 'expirado')),
  validade_dias INTEGER NOT NULL DEFAULT 7,
  observacoes TEXT,
  valor_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_desconto NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  aprovado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_orcamentos
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_orcamentos_empresa ON catalogo_orcamentos(empresa_id);
CREATE INDEX idx_orcamentos_token ON catalogo_orcamentos(token_acesso);
CREATE INDEX idx_orcamentos_status ON catalogo_orcamentos(status);

-- ============================================================
-- 7. catalogo_orcamento_itens
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  orcamento_id UUID NOT NULL REFERENCES catalogo_orcamentos(id) ON DELETE CASCADE,
  produto_sku TEXT NOT NULL,
  produto_tipo TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_orcamento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_orcamento_itens
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_orcamento_itens_orcamento ON catalogo_orcamento_itens(orcamento_id);

-- ============================================================
-- 8. catalogo_pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES catalogo_clientes(id) ON DELETE SET NULL,
  orcamento_id UUID REFERENCES catalogo_orcamentos(id) ON DELETE SET NULL,
  colaborador_id UUID,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'confirmado', 'separando', 'enviado', 'entregue', 'cancelado')),
  valor_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_frete NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_desconto NUMERIC(12,2) NOT NULL DEFAULT 0,
  valor_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  cupom_codigo TEXT,
  cupom_desconto NUMERIC(12,2) NOT NULL DEFAULT 0,
  endereco_entrega JSONB,
  observacoes TEXT,
  tracking_code TEXT,
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_pedidos
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_pedidos_empresa ON catalogo_pedidos(empresa_id);
CREATE INDEX idx_pedidos_cliente ON catalogo_pedidos(cliente_id);
CREATE INDEX idx_pedidos_status ON catalogo_pedidos(status);

-- ============================================================
-- 9. catalogo_pedido_itens
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo_pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_id UUID NOT NULL REFERENCES catalogo_pedidos(id) ON DELETE CASCADE,
  produto_sku TEXT NOT NULL,
  produto_tipo TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE catalogo_pedido_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_isolation" ON catalogo_pedido_itens
  USING (empresa_id = (auth.jwt() ->> 'empresa_id')::uuid);

CREATE INDEX idx_pedido_itens_pedido ON catalogo_pedido_itens(pedido_id);

-- ============================================================
-- Triggers: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_catalogo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_catalogo_clientes_updated_at
  BEFORE UPDATE ON catalogo_clientes
  FOR EACH ROW EXECUTE FUNCTION update_catalogo_timestamp();

CREATE TRIGGER update_catalogo_grupos_clientes_updated_at
  BEFORE UPDATE ON catalogo_grupos_clientes
  FOR EACH ROW EXECUTE FUNCTION update_catalogo_timestamp();

CREATE TRIGGER update_catalogo_orcamentos_updated_at
  BEFORE UPDATE ON catalogo_orcamentos
  FOR EACH ROW EXECUTE FUNCTION update_catalogo_timestamp();

CREATE TRIGGER update_catalogo_pedidos_updated_at
  BEFORE UPDATE ON catalogo_pedidos
  FOR EACH ROW EXECUTE FUNCTION update_catalogo_timestamp();
