import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { EmpresaLinktreePage } from "~/features/linktree/components/EmpresaLinktreePage";
import { RequirePermission } from "~/components/guards";

export const empresaLinktreeDashboardRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/linktree/empresa",
  component: () => (
    <RequirePermission modulo="linktree" permissions={["lt_empresa_ver"]}>
      <EmpresaLinktreePage />
    </RequirePermission>
  ),
});
