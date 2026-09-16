import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { GoogleReviewGenerator } from "~/features/gerador-links/components/sections/GoogleReviewGenerator";
import { RequirePermission } from "~/components/guards";

function GoogleReviewPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Google Review"
        description="Gere link direto para avaliação no Google com Place ID"
      />
      <GoogleReviewGenerator />
    </div>
  );
}

export const ferramentasLinksGoogleReviewRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/google-review",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerar"]}>
      <GoogleReviewPage />
    </RequirePermission>
  ),
});
