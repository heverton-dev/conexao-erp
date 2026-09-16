import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const MetaPostsList = lazy(() =>
  import("~/features/marketing/meta-bm/components/MetaPostsList").then((m) => ({
    default: m.MetaPostsList,
  })),
);

export const marketingMetaBmPostsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/meta-bm/posts",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_meta_ver_campanhas"]}>
      <Suspense fallback={null}>
        <MetaPostsList />
      </Suspense>
    </RequirePermission>
  ),
});
