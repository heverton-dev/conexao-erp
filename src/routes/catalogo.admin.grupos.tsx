
import { RequirePermission } from "~/components/guards";import { createRoute } from "@tanstack/react-router"
import { authLayout } from "./_auth"
import { GruposAdmin } from "~/features/catalogo/components/GruposAdmin"
import { EmpresaCrudGuard } from "~/features/catalogo/components/EmpresaCrudGuard"

export const catalogoAdminGruposRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/catalogo/admin/grupos",
  component: () => (
    <RequirePermission modulo="catalogo" permissions={["catalogo_gerenciar_grupos"]}>
      <EmpresaCrudGuard>
        <GruposAdmin />
      </EmpresaCrudGuard>
    </RequirePermission>
  ),
})
