-- ============================================================
-- Reabilitar RLS nas 6 tabelas sensíveis do catálogo
-- que foram desabilitadas por 20260720010000_single_tenant_rls.sql
-- e limpas por 20260721010000_force_clean_rls_catalogo.sql
--
-- Tabelas: catalogo_clientes, catalogo_pedidos, catalogo_pedido_itens,
--          catalogo_favoritos, catalogo_orcamentos, catalogo_orcamento_itens
--
-- Função helper: public.is_admin_or_super() (já existe, SECURITY DEFINER)
-- ============================================================

-- ============================================================
-- 1. catalogo_clientes
-- ============================================================
ALTER TABLE public.catalogo_clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalogo_clientes_select ON public.catalogo_clientes;
DROP POLICY IF EXISTS catalogo_clientes_insert ON public.catalogo_clientes;
DROP POLICY IF EXISTS catalogo_clientes_update ON public.catalogo_clientes;
DROP POLICY IF EXISTS catalogo_clientes_delete ON public.catalogo_clientes;

CREATE POLICY catalogo_clientes_select ON public.catalogo_clientes
  FOR SELECT TO authenticated
  USING (is_admin_or_super() OR user_id = auth.uid());

CREATE POLICY catalogo_clientes_insert ON public.catalogo_clientes
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_super());

CREATE POLICY catalogo_clientes_update ON public.catalogo_clientes
  FOR UPDATE TO authenticated
  USING (is_admin_or_super() OR user_id = auth.uid())
  WITH CHECK (is_admin_or_super() OR user_id = auth.uid());

CREATE POLICY catalogo_clientes_delete ON public.catalogo_clientes
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

-- ============================================================
-- 2. catalogo_pedidos
-- ============================================================
ALTER TABLE public.catalogo_pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalogo_pedidos_select ON public.catalogo_pedidos;
DROP POLICY IF EXISTS catalogo_pedidos_insert ON public.catalogo_pedidos;
DROP POLICY IF EXISTS catalogo_pedidos_update ON public.catalogo_pedidos;
DROP POLICY IF EXISTS catalogo_pedidos_delete ON public.catalogo_pedidos;

CREATE POLICY catalogo_pedidos_select ON public.catalogo_pedidos
  FOR SELECT TO authenticated
  USING (
    is_admin_or_super()
    OR colaborador_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.catalogo_clientes c
      WHERE c.id = catalogo_pedidos.cliente_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY catalogo_pedidos_insert ON public.catalogo_pedidos
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_super() OR colaborador_id = auth.uid());

CREATE POLICY catalogo_pedidos_update ON public.catalogo_pedidos
  FOR UPDATE TO authenticated
  USING (is_admin_or_super() OR colaborador_id = auth.uid())
  WITH CHECK (is_admin_or_super() OR colaborador_id = auth.uid());

CREATE POLICY catalogo_pedidos_delete ON public.catalogo_pedidos
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

-- ============================================================
-- 3. catalogo_pedido_itens (herda acesso do pedido pai)
-- ============================================================
ALTER TABLE public.catalogo_pedido_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalogo_pedido_itens_select ON public.catalogo_pedido_itens;
DROP POLICY IF EXISTS catalogo_pedido_itens_insert ON public.catalogo_pedido_itens;
DROP POLICY IF EXISTS catalogo_pedido_itens_update ON public.catalogo_pedido_itens;
DROP POLICY IF EXISTS catalogo_pedido_itens_delete ON public.catalogo_pedido_itens;

CREATE POLICY catalogo_pedido_itens_select ON public.catalogo_pedido_itens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogo_pedidos p
      WHERE p.id = catalogo_pedido_itens.pedido_id
        AND (
          is_admin_or_super()
          OR p.colaborador_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.catalogo_clientes c
            WHERE c.id = p.cliente_id AND c.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY catalogo_pedido_itens_insert ON public.catalogo_pedido_itens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.catalogo_pedidos p
      WHERE p.id = catalogo_pedido_itens.pedido_id
        AND (is_admin_or_super() OR p.colaborador_id = auth.uid())
    )
  );

CREATE POLICY catalogo_pedido_itens_update ON public.catalogo_pedido_itens
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogo_pedidos p
      WHERE p.id = catalogo_pedido_itens.pedido_id
        AND (is_admin_or_super() OR p.colaborador_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.catalogo_pedidos p
      WHERE p.id = catalogo_pedido_itens.pedido_id
        AND (is_admin_or_super() OR p.colaborador_id = auth.uid())
    )
  );

CREATE POLICY catalogo_pedido_itens_delete ON public.catalogo_pedido_itens
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogo_pedidos p
      WHERE p.id = catalogo_pedido_itens.pedido_id
        AND (is_admin_or_super() OR p.colaborador_id = auth.uid())
    )
  );

-- ============================================================
-- 4. catalogo_favoritos
-- ============================================================
ALTER TABLE public.catalogo_favoritos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalogo_favoritos_select ON public.catalogo_favoritos;
DROP POLICY IF EXISTS catalogo_favoritos_insert ON public.catalogo_favoritos;
DROP POLICY IF EXISTS catalogo_favoritos_update ON public.catalogo_favoritos;
DROP POLICY IF EXISTS catalogo_favoritos_delete ON public.catalogo_favoritos;

CREATE POLICY catalogo_favoritos_select ON public.catalogo_favoritos
  FOR SELECT TO authenticated
  USING (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.catalogo_clientes c
      WHERE c.id = catalogo_favoritos.cliente_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY catalogo_favoritos_insert ON public.catalogo_favoritos
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.catalogo_clientes c
      WHERE c.id = catalogo_favoritos.cliente_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY catalogo_favoritos_update ON public.catalogo_favoritos
  FOR UPDATE TO authenticated
  USING (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.catalogo_clientes c
      WHERE c.id = catalogo_favoritos.cliente_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.catalogo_clientes c
      WHERE c.id = catalogo_favoritos.cliente_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY catalogo_favoritos_delete ON public.catalogo_favoritos
  FOR DELETE TO authenticated
  USING (
    is_admin_or_super()
    OR EXISTS (
      SELECT 1 FROM public.catalogo_clientes c
      WHERE c.id = catalogo_favoritos.cliente_id
        AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. catalogo_orcamentos — admin/colaborador autenticado APENAS
--    Acesso público por token é via RPC SECURITY DEFINER (ver 6)
-- ============================================================
ALTER TABLE public.catalogo_orcamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalogo_orcamentos_select ON public.catalogo_orcamentos;
DROP POLICY IF EXISTS catalogo_orcamentos_insert ON public.catalogo_orcamentos;
DROP POLICY IF EXISTS catalogo_orcamentos_update ON public.catalogo_orcamentos;
DROP POLICY IF EXISTS catalogo_orcamentos_delete ON public.catalogo_orcamentos;

CREATE POLICY catalogo_orcamentos_select ON public.catalogo_orcamentos
  FOR SELECT TO authenticated
  USING (is_admin_or_super() OR colaborador_id = auth.uid());

CREATE POLICY catalogo_orcamentos_insert ON public.catalogo_orcamentos
  FOR INSERT TO authenticated
  WITH CHECK (is_admin_or_super() OR colaborador_id = auth.uid());

CREATE POLICY catalogo_orcamentos_update ON public.catalogo_orcamentos
  FOR UPDATE TO authenticated
  USING (is_admin_or_super() OR colaborador_id = auth.uid())
  WITH CHECK (is_admin_or_super() OR colaborador_id = auth.uid());

CREATE POLICY catalogo_orcamentos_delete ON public.catalogo_orcamentos
  FOR DELETE TO authenticated
  USING (is_admin_or_super());

-- NENHUMA policy para anon — acesso público é via RPC

-- ============================================================
-- 6. catalogo_orcamento_itens — mesma lógica do pai
-- ============================================================
ALTER TABLE public.catalogo_orcamento_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS catalogo_orcamento_itens_select ON public.catalogo_orcamento_itens;
DROP POLICY IF EXISTS catalogo_orcamento_itens_insert ON public.catalogo_orcamento_itens;
DROP POLICY IF EXISTS catalogo_orcamento_itens_update ON public.catalogo_orcamento_itens;
DROP POLICY IF EXISTS catalogo_orcamento_itens_delete ON public.catalogo_orcamento_itens;

CREATE POLICY catalogo_orcamento_itens_select ON public.catalogo_orcamento_itens
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogo_orcamentos o
      WHERE o.id = catalogo_orcamento_itens.orcamento_id
        AND (is_admin_or_super() OR o.colaborador_id = auth.uid())
    )
  );

CREATE POLICY catalogo_orcamento_itens_insert ON public.catalogo_orcamento_itens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.catalogo_orcamentos o
      WHERE o.id = catalogo_orcamento_itens.orcamento_id
        AND (is_admin_or_super() OR o.colaborador_id = auth.uid())
    )
  );

CREATE POLICY catalogo_orcamento_itens_update ON public.catalogo_orcamento_itens
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogo_orcamentos o
      WHERE o.id = catalogo_orcamento_itens.orcamento_id
        AND (is_admin_or_super() OR o.colaborador_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.catalogo_orcamentos o
      WHERE o.id = catalogo_orcamento_itens.orcamento_id
        AND (is_admin_or_super() OR o.colaborador_id = auth.uid())
    )
  );

CREATE POLICY catalogo_orcamento_itens_delete ON public.catalogo_orcamento_itens
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalogo_orcamentos o
      WHERE o.id = catalogo_orcamento_itens.orcamento_id
        AND (is_admin_or_super())
    )
  );

-- NENHUMA policy para anon — acesso público é via RPC

-- ============================================================
-- 7. RPC SECURITY DEFINER para acesso público por token
--    (anon não pode acessar catalogo_orcamentos direto)
-- ============================================================

-- Buscar orçamento por token (ignora RLS, retorna só o registro)
CREATE OR REPLACE FUNCTION public.buscar_orcamento_por_token(p_token text)
RETURNS SETOF public.catalogo_orcamentos
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.catalogo_orcamentos WHERE token_acesso = p_token;
$$;

-- Buscar itens de um orçamento (para composição com buscar_orcamento_por_token)
CREATE OR REPLACE FUNCTION public.buscar_itens_orcamento(p_orcamento_id uuid)
RETURNS SETOF public.catalogo_orcamento_itens
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.catalogo_orcamento_itens WHERE orcamento_id = p_orcamento_id;
$$;

-- Atualizar status do orçamento por token
CREATE OR REPLACE FUNCTION public.atualizar_status_orcamento_por_token(
  p_token text,
  p_status text
)
RETURNS SETOF public.catalogo_orcamentos
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.catalogo_orcamentos
  SET status = p_status,
      aprovado_em = CASE WHEN p_status = 'aprovado' THEN now() ELSE aprovado_em END,
      updated_at = now()
  WHERE token_acesso = p_token
    AND status IN ('rascunho', 'enviado')
  RETURNING *;
$$;

-- Conceder execução para anon (acesso público sem login)
GRANT EXECUTE ON FUNCTION public.buscar_orcamento_por_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_itens_orcamento(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.atualizar_status_orcamento_por_token(text, text) TO anon;

-- Notificar PostgREST para recarregar schema
NOTIFY pgrst, 'reload schema';
