import { useState, useCallback } from "react"
import type { CatalogoOrcamentoItemInput } from "../types/orcamentos"

interface OrcamentoState {
  cliente_id: string | null
  cliente_nome: string | null
  cliente_email: string | null
  cliente_telefone: string | null
  itens: CatalogoOrcamentoItemInput[]
  observacoes: string
  validade_dias: number
}

const INITIAL_STATE: OrcamentoState = {
  cliente_id: null,
  cliente_nome: null,
  cliente_email: null,
  cliente_telefone: null,
  itens: [],
  observacoes: "",
  validade_dias: 7,
}

/**
 * Hook para gerenciar estado do orçamento em construção (colaborador).
 */
export function useOrcamento() {
  const [state, setState] = useState<OrcamentoState>(INITIAL_STATE)

  const setCliente = useCallback(
    (cliente: { id: string; nome: string; email: string; telefone?: string } | null) => {
      setState((s) => ({
        ...s,
        cliente_id: cliente?.id ?? null,
        cliente_nome: cliente?.nome ?? null,
        cliente_email: cliente?.email ?? null,
        cliente_telefone: cliente?.telefone ?? null,
      }))
    },
    [],
  )

  const adicionarItem = useCallback((item: CatalogoOrcamentoItemInput) => {
    setState((s) => {
      const existing = s.itens.find((i) => i.produto_sku === item.produto_sku)
      if (existing) {
        return {
          ...s,
          itens: s.itens.map((i) =>
            i.produto_sku === item.produto_sku
              ? { ...i, quantidade: i.quantidade + item.quantidade }
              : i,
          ),
        }
      }
      return { ...s, itens: [...s.itens, item] }
    })
  }, [])

  const removerItem = useCallback((sku: string) => {
    setState((s) => ({
      ...s,
      itens: s.itens.filter((i) => i.produto_sku !== sku),
    }))
  }, [])

  const atualizarQuantidade = useCallback((sku: string, quantidade: number) => {
    if (quantidade <= 0) {
      setState((s) => ({ ...s, itens: s.itens.filter((i) => i.produto_sku !== sku) }))
      return
    }
    setState((s) => ({
      ...s,
      itens: s.itens.map((i) => (i.produto_sku === sku ? { ...i, quantidade } : i)),
    }))
  }, [])

  const setObservacoes = useCallback((obs: string) => {
    setState((s) => ({ ...s, observacoes: obs }))
  }, [])

  const setValidadeDias = useCallback((dias: number) => {
    setState((s) => ({ ...s, validade_dias: dias }))
  }, [])

  const limpar = useCallback(() => setState(INITIAL_STATE), [])

  const subtotal = state.itens.reduce(
    (acc, item) => acc + item.preco_unitario * item.quantidade,
    0,
  )

  return {
    ...state,
    setCliente,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    setObservacoes,
    setValidadeDias,
    limpar,
    subtotal,
    isEmpty: state.itens.length === 0,
  }
}
