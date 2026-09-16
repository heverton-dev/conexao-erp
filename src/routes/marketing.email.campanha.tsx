import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { EmptyState } from "~/components/ui/empty-state";
import { Mail } from "lucide-react";
import { RequirePermission } from "~/components/guards";

function CampanhaEditor() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Editor de Campanha" description="Crie e edite campanhas de e-mail" />
      <EmptyState icon={<Mail className="w-8 h-8 text-text-muted" />} title="Editor" description="Configure sua campanha de e-mail." />
    </div>
  );
}

export const marketingEmailCampanhaRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/email/campanha",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_email_ver"]}>
      <CampanhaEditor />
    </RequirePermission>
  ),
});
