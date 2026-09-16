import { useCatalogoCliente } from "./useCatalogoCliente"

/**
 * Hook que combina estado de visitante/cliente da loja.
 * - visitante: sem login, preços ocultos, CTA visível
 * - cliente: logado, preços visíveis, compra habilitada
 */
export function useCatalogoVisitante() {
  const { cliente, loading, isLogado } = useCatalogoCliente()

  return {
    /** Se o usuário está logado como cliente da loja */
    isLogado,
    /** Se ainda está carregando a verificação */
    loading,
    /** Dados do cliente (null se visitante) */
    cliente,
    /** Se é visitante (não logado) */
    isVisitante: !loading && !isLogado,
    /** Se pode ver preços */
    podeVerPrecos: isLogado,
    /** Se pode comprar */
    podeComprar: isLogado,
    /** Contexto para resolução de preço */
    contextoPreco: (isLogado ? "cliente" : "visitante") as "cliente" | "visitante",
  }
}
