
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { OrcamentosAdmin } from "~/features/catalogo/components/OrcamentosAdmin"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"

export const catalogoAdminOrcamentosRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/orcamentos",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_orcamentos"]}>
      <EmpresaCrudGuard>
        <OrcamentosAdmin />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})
