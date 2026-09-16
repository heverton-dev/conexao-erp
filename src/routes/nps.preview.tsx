import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import NpsPreviewPage from "~/features/nps/components/dashboard/NpsPreviewPage";
import { RequirePermission } from "~/components/guards";

export const npsPreviewRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/nps/preview",
  component: () => (
    <RequirePermission modulo="nps" permissions={["nps_gerenciar_perguntas"]}>
      <NpsPreviewPage />
    </RequirePermission>
  ),
});
