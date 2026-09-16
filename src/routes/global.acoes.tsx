import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { Shield, Webhook as WebhookIcon } from "lucide-react";
import { CentralAcoesTab } from "~/components/admin/CentralAcoesTab";
import { RequireSuperAdmin } from "~/components/guards";

export const adminConfigRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/acoes",
  component: () => (
    <RequireSuperAdmin>
      <AdminConfigPage />
    </RequireSuperAdmin>
  ),
});

function AdminConfigPage() {
  const { profile } = useAuth();

  if (!profile?.is_super_admin) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 pt-20">
        <Shield size={40} className="text-text-muted" />
        <p className="text-sm text-text-muted">
          Acesso restrito a Super Administradores
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="flex items-center gap-2">
        <WebhookIcon size={20} className="text-accent" />
        <h1 className="text-lg font-bold text-text-main">Central de Ações</h1>
      </div>

      <CentralAcoesTab />
    </div>
  );
}
