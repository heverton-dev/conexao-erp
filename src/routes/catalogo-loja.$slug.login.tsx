import { createRoute, useParams } from "@tanstack/react-router"
import { rootRoute } from "./__root"
import { ClienteLogin } from "~/features/catalogo/components/ClienteLogin"

export const catalogoLojaLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/loja/$slug/login",
  component: LojaLoginPage,
})

function LojaLoginPage() {
  const { slug } = useParams({ from: "/loja/$slug/login" })
  return <ClienteLogin slug={slug} />
}
