import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { MeusOrcamentos } from "~/features/catalogo/components/MeusOrcamentos"

export const catalogoOrcamentosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/orcamentos",
  component: () => (
    <RequirePermission
      modulo="catalogo"
      permissions={["catalogo_colab_ver_produtos", "catalogo_colab_criar_orcamento", "catalogo_colab_gerenciar_orcamentos"]}
    >
      <MeusOrcamentos />
    </RequirePermission>
  ),
})
