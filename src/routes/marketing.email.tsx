import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const EmailCampanhasList = lazy(() =>
  import("~/features/marketing/email-marketing/components/EmailCampanhasList").then((m) => ({
    default: m.EmailCampanhasList,
  })),
);

export const marketingEmailRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/email",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_email_ver"]}>
      <Suspense fallback={null}>
        <EmailCampanhasList />
      </Suspense>
    </RequirePermission>
  ),
});
