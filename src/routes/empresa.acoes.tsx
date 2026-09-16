import { createRoute, useNavigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { CentralAcoesTab } from "~/components/admin/CentralAcoesTab";
import {
  Webhook as WebhookIcon,
  ArrowLeft,
} from "lucide-react";
import { RequirePermission } from "~/components/guards";

export const adminEmpresaConfigAcoesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/empresa/acoes",
  component: () => (
    <RequirePermission modulo="empresas-core">
      <EmpresaAcoesPage />
    </RequirePermission>
  ),
});

function EmpresaAcoesPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 pb-28">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate({ to: "/empresa" })}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <WebhookIcon size={20} className="text-accent" />
          <h1 className="text-lg font-bold text-text-main">Central de Ações</h1>
        </div>
      </div>

      <p className="text-xs text-text-muted max-w-3xl mb-4">
        Configure automações, chamadas de API (Webhooks) e defina quais
        notificações internas devem ser disparadas para os eventos e botões
        disponíveis.
      </p>

      <CentralAcoesTab />
    </div>
  );
}
