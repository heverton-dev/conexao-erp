import { useState, useEffect } from "react"
import { supabase } from "~/lib/supabase"
import type { CatalogoCliente } from "../types/clientes"

/**
 * Hook para autenticação do cliente logado na loja.
 * Detecta se o user logado é um catalogo_cliente ativo.
 */
export function useCatalogoCliente() {
  const [cliente, setCliente] = useState<CatalogoCliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLogado, setIsLogado] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) {
        if (!cancelled) {
          setLoading(false)
          setIsLogado(false)
        }
        return
      }

      // Verifica se é um catalogo_cliente ativo
      const { data } = await supabase
        .from("catalogo_clientes")
        .select("*, grupo:catalogo_grupos_clientes(*)")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .maybeSingle()

      if (!cancelled) {
        setCliente((data as CatalogoCliente) ?? null)
        setIsLogado(!!data)
        setLoading(false)
      }
    }

    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!cancelled) check()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { cliente, loading, isLogado }
}
