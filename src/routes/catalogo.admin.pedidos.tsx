
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { PedidosAdmin } from "~/features/catalogo/components/PedidosAdmin"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"

export const catalogoAdminPedidosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/pedidos",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_pedidos"]}>
      <EmpresaCrudGuard>
        <PedidosAdmin />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})
