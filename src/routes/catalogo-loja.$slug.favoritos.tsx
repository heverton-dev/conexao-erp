import { createRoute, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { useCatalogoCliente } from "~/features/catalogo/hooks/useCatalogoCliente"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { listarFavoritos, removerFavorito } from "~/features/catalogo/services/favoritos.service"
import type { CatalogoFavorito } from "~/features/catalogo/types/pedidos"
import { Button } from "~/components/ui/button"
import { useTranslation } from "react-i18next"

export const catalogoLojaFavoritosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loja/$slug/favoritos",
  component: LojaFavoritosPage,
})

function LojaFavoritosPage() {
  const { slug } = useParams({ from: "/loja/$slug/favoritos" })
  const empresaId = useCatalogoEmpresaId()
  const { cliente, isLogado, loading: authLoading } = useCatalogoCliente()
  const [favoritos, setFavoritos] = useState<CatalogoFavorito[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  async function load() {
    if (!isLogado || !cliente) return
    try {
      setFavoritos(await listarFavoritos(cliente.id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [isLogado, cliente, empresaId])

  async function handleRemove(sku: string) {
    if (!cliente) return
    await removerFavorito(cliente.id, sku)
    setFavoritos((f) => f.filter((fav) => fav.produto_sku !== sku))
  }

  if (authLoading || loading) {
    return (
      <StoreLayout>
        <div className="p-8 text-center text-[var(--color-text-muted)]">{t("common.loading")}</div>
      </StoreLayout>
    )
  }

  if (!isLogado) {
    return (
      <StoreLayout>
        <div className="p-8 text-center">
          <p className="text-[var(--color-text-muted)]">{t("catalogo.favorites.loginRequired")}</p>
          <a href={`/loja/${slug}/login`} className="text-[var(--color-accent)] hover:underline mt-2 inline-block">
            {t("catalogo.login.submit")}
          </a>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout>
      <div className="p-4 lg:p-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">{t("catalogo.favorites.title")}</h1>

        {favoritos.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)]">{t("catalogo.favorites.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoritos.map((f) => (
              <div
                key={f.id}
                className="bg-[var(--color-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{f.produto_tipo}</p>
                  <p className="text-[var(--color-text-muted)] text-sm font-mono">{f.produto_sku}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(f.produto_sku)}
                  className="text-red-400 hover:text-red-300"
                >
                  {t("catalogo.favorites.remove")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  )
}
