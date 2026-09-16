import { createRoute, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { OrcamentoPublico } from "~/features/catalogo/components/OrcamentoPublico"

export const catalogoLojaOrcamentoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loja/$slug/orcamento/$token",
  component: LojaOrcamentoPage,
})

function LojaOrcamentoPage() {
  const { token } = useParams({ from: "/loja/$slug/orcamento/$token" })
  return <OrcamentoPublico token={token} />
}
