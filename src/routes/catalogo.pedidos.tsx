import { RequirePermission } from "~/components/guards"
import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { MeusPedidos } from "~/features/catalogo/components/MeusPedidos"

export const catalogoPedidosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/pedidos",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_colab_ver_pedidos"]}>
      <MeusPedidos />
    </RequirePermission>
  ),
})
