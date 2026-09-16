
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { ClientesAdmin } from "~/features/catalogo/components/ClientesAdmin"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"

export const catalogoAdminClientesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/clientes",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_clientes"]}>
      <EmpresaCrudGuard>
        <ClientesAdmin />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})
