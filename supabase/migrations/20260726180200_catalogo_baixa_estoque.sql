-- ============================================================
-- Migration: Função SQL de Baixa Segura de Estoque
-- Data: 2026-07-26
-- Descrição: Função atômica para decrementar estoque com lock.
--            Previne race conditions em baixas simultâneas.
-- ============================================================

BEGIN;

/**
 * Baixa estoque de um produto de forma atômica.
 * Retorna true se a baixa foi realizada com sucesso, false se estoque insuficiente.
 *
 * Uso: SELECT baixa_estoque_produto('SKU-001', 'implante', 5);
 */
CREATE OR REPLACE FUNCTION baixa_estoque_produto(
  p_sku TEXT,
  p_tipo TEXT,
  p_quantidade INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_tabela TEXT;
  v_atual INTEGER;
BEGIN
  -- Mapeia tipo para tabela
  v_tabela := CASE p_tipo
    WHEN 'implante' THEN 'catalogo_implantes'
    WHEN 'abutment' THEN 'catalogo_abutments'
    WHEN 'kit' THEN 'catalogo_kits'
    WHEN 'fresa' THEN 'catalogo_fresas'
    WHEN 'chave' THEN 'catalogo_chaves'
    WHEN 'complementar' THEN 'catalogo_complementares'
    WHEN 'opcional' THEN 'catalogo_opcionais'
    WHEN 'componente' THEN 'catalogo_componentes'
    WHEN 'parafuso' THEN 'catalogo_parafusos'
    WHEN 'cicatrizador' THEN 'catalogo_cicatrizadores'
    WHEN 'acessorio' THEN 'catalogo_acessorios'
    WHEN 'instrumental' THEN 'catalogo_instrumentais'
    WHEN 'promocional' THEN 'catalogo_promocionais'
    ELSE NULL
  END;

  IF v_tabela IS NULL THEN
    RAISE EXCEPTION 'Tipo de produto inválido: %', p_tipo;
  END IF;

  -- Lock + decremento atômico (FOR UPDATE impede race condition)
  EXECUTE format(
    'UPDATE %I SET qtd_disponivel = qtd_disponivel - %s 
     WHERE sku = %L AND qtd_disponivel >= %s
     RETURNING qtd_disponivel',
    v_tabela, p_quantidade, p_sku, p_quantidade
  ) INTO v_atual;

  RETURN v_atual IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

/**
 * Reverte (estorna) estoque de um produto.
 *
 * Uso: SELECT estorna_estoque_produto('SKU-001', 'implante', 5);
 */
CREATE OR REPLACE FUNCTION estorna_estoque_produto(
  p_sku TEXT,
  p_tipo TEXT,
  p_quantidade INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_tabela TEXT;
  v_atual INTEGER;
BEGIN
  v_tabela := CASE p_tipo
    WHEN 'implante' THEN 'catalogo_implantes'
    WHEN 'abutment' THEN 'catalogo_abutments'
    WHEN 'kit' THEN 'catalogo_kits'
    WHEN 'fresa' THEN 'catalogo_fresas'
    WHEN 'chave' THEN 'catalogo_chaves'
    WHEN 'complementar' THEN 'catalogo_complementares'
    WHEN 'opcional' THEN 'catalogo_opcionais'
    WHEN 'componente' THEN 'catalogo_componentes'
    WHEN 'parafuso' THEN 'catalogo_parafusos'
    WHEN 'cicatrizador' THEN 'catalogo_cicatrizadores'
    WHEN 'acessorio' THEN 'catalogo_acessorios'
    WHEN 'instrumental' THEN 'catalogo_instrumentais'
    WHEN 'promocional' THEN 'catalogo_promocionais'
    ELSE NULL
  END;

  IF v_tabela IS NULL THEN
    RAISE EXCEPTION 'Tipo de produto inválido: %', p_tipo;
  END IF;

  -- Incremento atômico
  EXECUTE format(
    'UPDATE %I SET qtd_disponivel = qtd_disponivel + %s 
     WHERE sku = %L
     RETURNING qtd_disponivel',
    v_tabela, p_quantidade, p_sku
  ) INTO v_atual;

  RETURN v_atual IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

COMMIT;
