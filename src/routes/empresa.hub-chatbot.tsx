import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
const AdminChatbotPage = lazy(() =>
  import("~/features/hub/pages/admin/AdminChatbotPage").then((m) => ({ default: m.AdminChatbotPage })),
);
import { RequirePermission } from "~/components/guards";

export const empresaHubChatbotRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/hub/chatbot",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <Suspense fallback={null}>
        <AdminChatbotPage />
      </Suspense>
    </RequirePermission>
  ),
});
