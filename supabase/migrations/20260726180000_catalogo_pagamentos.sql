-- ============================================================
-- Migration: Tabela de Pagamentos do Catálogo
-- Data: 2026-07-26
-- Descrição: Cria tabela para registro de pagamentos dos pedidos.
--            Suporta métodos manuais e futuras integrações (Stripe, Mercado Pago).
-- ============================================================

BEGIN;

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS catalogo_pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES catalogo_pedidos(id) ON DELETE CASCADE,
  metodo TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'stripe' | 'mercadopago'
  valor DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'aprovado' | 'rejeitado' | 'estornado'
  stripe_payment_intent_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_catalogo_pagamentos_pedido ON catalogo_pagamentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_catalogo_pagamentos_status ON catalogo_pagamentos(status);

-- RLS (aberta — single-tenant)
ALTER TABLE catalogo_pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_pagamentos_select" ON catalogo_pagamentos FOR SELECT USING (true);
CREATE POLICY "catalogo_pagamentos_insert" ON catalogo_pagamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "catalogo_pagamentos_update" ON catalogo_pagamentos FOR UPDATE USING (true);
CREATE POLICY "catalogo_pagamentos_delete" ON catalogo_pagamentos FOR DELETE USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_catalogo_pagamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catalogo_pagamentos_updated_at ON catalogo_pagamentos;
CREATE TRIGGER catalogo_pagamentos_updated_at
  BEFORE UPDATE ON catalogo_pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_catalogo_pagamentos_updated_at();

COMMIT;
