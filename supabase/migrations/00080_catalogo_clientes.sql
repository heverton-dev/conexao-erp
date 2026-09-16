-- ============================================================
-- Migration: Catálogo — Clientes, Grupos, Orçamentos, Pedidos
-- Adiciona: credenciais de acesso, grupos de pricing, orçamentos,
--           pedidos, favoritos, solicitações de acesso
-- ============================================================

-- ============================================================
-- 1. GRUPOS de clientes (cada empresa cria seus grupos)
-- ============================================================
CREATE TABLE catalogo_grupos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_tipo TEXT NOT NULL DEFAULT 'percentual'
    CHECK (preco_tipo IN ('percentual', 'fixo')),
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, nome)
);

-- ============================================================
-- 2. CLIENTES do catálogo (credenciais de acesso)
-- ============================================================
CREATE TABLE catalogo_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cadastro_id UUID REFERENCES cadastros(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  grupo_id UUID REFERENCES catalogo_grupos_clientes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  tipo TEXT NOT NULL DEFAULT 'cliente'
    CHECK (tipo IN ('cliente', 'parceiro', 'revendedor')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, email)
);

-- ============================================================
-- 3. PREÇOS por grupo+produto (override)
-- ============================================================
CREATE TABLE catalogo_grupo_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES catalogo_grupos_clientes(id) ON DELETE CASCADE,
  produto_sku UUID NOT NULL,
  produto_tipo TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, grupo_id, produto_sku)
);

-- ============================================================
-- 4. PERMISSÕES granulares por cliente
-- ============================================================
CREATE TABLE catalogo_cliente_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES catalogo_clientes(id) ON DELETE CASCADE,
  permissao_key TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, cliente_id, permissao_key)
);

-- ============================================================
-- 5. FAVORITOS
-- ============================================================
CREATE TABLE catalogo_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES catalogo_clientes(id) ON DELETE CASCADE,
  produto_sku UUID NOT NULL,
  produto_tipo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, cliente_id, produto_sku)
);

-- ============================================================
-- 6. ORÇAMENTOS (criados por colaboradores)
-- ============================================================
CREATE TABLE catalogo_orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES catalogo_clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  token_acesso TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN (
      'rascunho',
      'enviado',
      'aprovado',
      'reprovado',
      'pedido',
      'expirado'
    )),
  validade_dias INT DEFAULT 7,
  observacoes TEXT,
  valor_subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  aprovado_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. ITENS DO ORÇAMENTO
-- ============================================================
CREATE TABLE catalogo_orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  orcamento_id UUID NOT NULL REFERENCES catalogo_orcamentos(id) ON DELETE CASCADE,
  produto_sku UUID NOT NULL,
  produto_tipo TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. PEDIDOS
-- ============================================================
CREATE TABLE catalogo_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES catalogo_clientes(id) ON DELETE SET NULL,
  orcamento_id UUID REFERENCES catalogo_orcamentos(id) ON DELETE SET NULL,
  colaborador_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN (
      'pendente',
      'pago',
      'confirmado',
      'separando',
      'enviado',
      'entregue',
      'cancelado'
    )),
  valor_subtotal DECIMAL(10,2) NOT NULL,
  valor_frete DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL,
  cupom_codigo TEXT,
  cupom_desconto DECIMAL(10,2) DEFAULT 0,
  endereco_entrega JSONB,
  observacoes TEXT,
  tracking_code TEXT,
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catalogo_pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_id UUID NOT NULL REFERENCES catalogo_pedidos(id) ON DELETE CASCADE,
  produto_sku UUID NOT NULL,
  produto_tipo TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. SOLICITAÇÕES DE ACESSO (visitante → cliente)
-- ============================================================
CREATE TABLE catalogo_solicitacoes_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- catalogo_grupos_clientes
ALTER TABLE catalogo_grupos_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_grupos_empresa" ON catalogo_grupos_clientes
  FOR ALL TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_clientes
ALTER TABLE catalogo_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_clientes_select" ON catalogo_clientes
  FOR SELECT TO authenticated
  USING (
    empresa_id = get_current_empresa_id()
    OR is_super_admin_session()
    OR user_id = auth.uid()
  );
CREATE POLICY "catalogo_clientes_insert" ON catalogo_clientes
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session());
CREATE POLICY "catalogo_clientes_update" ON catalogo_clientes
  FOR UPDATE TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_grupo_precos
ALTER TABLE catalogo_grupo_precos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_grupo_precos_empresa" ON catalogo_grupo_precos
  FOR ALL TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_cliente_permissoes
ALTER TABLE catalogo_cliente_permissoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_cliente_perm_empresa" ON catalogo_cliente_permissoes
  FOR ALL TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_favoritos
ALTER TABLE catalogo_favoritos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_favoritos_empresa" ON catalogo_favoritos
  FOR ALL TO authenticated
  USING (
    empresa_id = get_current_empresa_id()
    OR is_super_admin_session()
    OR EXISTS (
      SELECT 1 FROM catalogo_clientes
      WHERE id = catalogo_favoritos.cliente_id AND user_id = auth.uid()
    )
  );

-- catalogo_orcamentos
ALTER TABLE catalogo_orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_orcamentos_select" ON catalogo_orcamentos
  FOR SELECT TO authenticated
  USING (
    empresa_id = get_current_empresa_id()
    OR is_super_admin_session()
    OR colaborador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM catalogo_clientes
      WHERE id = catalogo_orcamentos.cliente_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "catalogo_orcamentos_insert" ON catalogo_orcamentos
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session());
CREATE POLICY "catalogo_orcamentos_update" ON catalogo_orcamentos
  FOR UPDATE TO authenticated
  USING (
    empresa_id = get_current_empresa_id()
    OR is_super_admin_session()
    OR colaborador_id = auth.uid()
  );

-- catalogo_orcamento_itens
ALTER TABLE catalogo_orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_orc_itens_empresa" ON catalogo_orcamento_itens
  FOR ALL TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_pedidos
ALTER TABLE catalogo_pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_pedidos_select" ON catalogo_pedidos
  FOR SELECT TO authenticated
  USING (
    empresa_id = get_current_empresa_id()
    OR is_super_admin_session()
    OR colaborador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM catalogo_clientes
      WHERE id = catalogo_pedidos.cliente_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "catalogo_pedidos_insert" ON catalogo_pedidos
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = get_current_empresa_id() OR is_super_admin_session());
CREATE POLICY "catalogo_pedidos_update" ON catalogo_pedidos
  FOR UPDATE TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_pedido_itens
ALTER TABLE catalogo_pedido_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_ped_itens_empresa" ON catalogo_pedido_itens
  FOR ALL TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- catalogo_solicitacoes_acesso
ALTER TABLE catalogo_solicitacoes_acesso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_solicitacoes_empresa" ON catalogo_solicitacoes_acesso
  FOR ALL TO authenticated
  USING (empresa_id = get_current_empresa_id() OR is_super_admin_session());

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_catalogo_clientes_empresa ON catalogo_clientes(empresa_id);
CREATE INDEX idx_catalogo_clientes_grupo ON catalogo_clientes(grupo_id);
CREATE INDEX idx_catalogo_grupo_precos_grupo ON catalogo_grupo_precos(grupo_id);
CREATE INDEX idx_catalogo_orcamentos_empresa ON catalogo_orcamentos(empresa_id);
CREATE INDEX idx_catalogo_orcamentos_colab ON catalogo_orcamentos(colaborador_id);
CREATE INDEX idx_catalogo_orcamentos_token ON catalogo_orcamentos(token_acesso);
CREATE INDEX idx_catalogo_pedidos_empresa ON catalogo_pedidos(empresa_id);
CREATE INDEX idx_catalogo_pedidos_cliente ON catalogo_pedidos(cliente_id);
