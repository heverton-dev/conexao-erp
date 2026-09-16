import { createRoute, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { StoreLayout } from "~/features/catalogo/components/StoreLayout"
import { BannerSolicitarAcesso } from "~/features/catalogo/components/BannerSolicitarAcesso"
import { useCatalogoVisitante } from "~/features/catalogo/hooks/useCatalogoVisitante"
import { useCatalogoEmpresaId } from "~/features/catalogo/hooks/useCatalogoEmpresa"
import { useTranslation } from "react-i18next"

export const catalogoLojaIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loja/$slug",
  component: LojaIndexPage,
})

function LojaIndexPage() {
  const { slug } = useParams({ from: "/loja/$slug" })
  const empresaId = useCatalogoEmpresaId()
  const { isVisitante } = useCatalogoVisitante()
  const { t } = useTranslation()

  return (
    <StoreLayout>
      <div className="space-y-6 p-4 lg:p-8">
        {isVisitante && (
          <BannerSolicitarAcesso
            empresaId={empresaId}
            tipo="formulario"
          />
        )}

        <div>
          <h2 className="text-xl font-bold text-white mb-4">{t("catalogo.store.products")}</h2>
          <p className="text-[var(--color-text-muted)] text-sm">
            {isVisitante
              ? t("catalogo.store.loginToSee")
              : t("catalogo.store.browseAdd")}
          </p>
        </div>
      </div>
    </StoreLayout>
  )
}
