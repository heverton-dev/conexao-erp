import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { EmptyState } from "~/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { RequirePermission } from "~/components/guards";

function EmailAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Analytics E-mail" description="Metricas das campanhas de e-mail" />
      <EmptyState icon={<BarChart3 className="w-8 h-8 text-text-muted" />} title="Analytics" description="Visualize as metricas das suas campanhas de e-mail." />
    </div>
  );
}

export const marketingEmailAnalyticsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/email/analytics",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_email_ver"]}>
      <EmailAnalytics />
    </RequirePermission>
  ),
});
