import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { DiagnosticPage } from "~/components/diagnostic/DiagnosticPage";
import { RequireSuperAdmin } from "~/components/guards";

export const adminSuperDiagnosticoRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/diagnostico",
  component: () => (
    <RequireSuperAdmin>
      <DiagnosticPage />
    </RequireSuperAdmin>
  ),
});
