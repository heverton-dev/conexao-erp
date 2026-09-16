-- ============================================================
-- Migration: Criar tabela catalogo_protocolo_fresagem
-- Tabela que o frontend espera para ficha técnica de implantes.
-- Cada linha liga um implante (via SKU) a uma fresa (via SKU)
-- com tipo de osso e ordem de uso.
-- ============================================================

-- Criar tabela
CREATE TABLE IF NOT EXISTS public.catalogo_protocolo_fresagem (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  implante_sku text NOT NULL,
  fresa_sku text NOT NULL,
  tipo_osso text,
  ordem_uso integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_proto_fresagem_empresa ON public.catalogo_protocolo_fresagem(empresa_id);
CREATE INDEX IF NOT EXISTS idx_proto_fresagem_implante ON public.catalogo_protocolo_fresagem(implante_sku, empresa_id);

-- FK para PostgREST resource embedding:
-- catalogo_implantes embeds catalogo_protocolo_fresagem (one-to-many)
-- A FK referencia (sku, empresa_id) que é a PK composta de implantes
ALTER TABLE public.catalogo_protocolo_fresagem
  ADD CONSTRAINT fk_proto_fresagem_implante
  FOREIGN KEY (implante_sku, empresa_id)
  REFERENCES public.catalogo_implantes(sku, empresa_id)
  ON DELETE CASCADE;

-- FK para PostgREST resource embedding:
-- catalogo_protocolo_fresagem embeds catalogo_fresas (many-to-one)
ALTER TABLE public.catalogo_protocolo_fresagem
  ADD CONSTRAINT fk_proto_fresagem_fresa
  FOREIGN KEY (fresa_sku, empresa_id)
  REFERENCES public.catalogo_fresas(sku, empresa_id)
  ON DELETE CASCADE;

-- RLS: multi-tenant
ALTER TABLE public.catalogo_protocolo_fresagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proto_fresagem_select_own" ON public.catalogo_protocolo_fresagem
  FOR SELECT USING (empresa_id = public.get_current_empresa_id() OR public.is_super_admin_session());

CREATE POLICY "proto_fresagem_insert_own" ON public.catalogo_protocolo_fresagem
  FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id() OR public.is_super_admin_session());

CREATE POLICY "proto_fresagem_update_own" ON public.catalogo_protocolo_fresagem
  FOR UPDATE USING (empresa_id = public.get_current_empresa_id() OR public.is_super_admin_session());

CREATE POLICY "proto_fresagem_delete_own" ON public.catalogo_protocolo_fresagem
  FOR DELETE USING (empresa_id = public.get_current_empresa_id() OR public.is_super_admin_session());

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalogo_protocolo_fresagem TO authenticated;
GRANT SELECT ON public.catalogo_protocolo_fresagem TO anon;

-- Reload PostgREST
NOTIFY pgrst, 'reload schema';
