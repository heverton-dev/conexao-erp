import { lazy, Suspense } from "react";
import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { RequirePermission } from "~/components/guards";

const PixelsList = lazy(() =>
  import("~/features/marketing/pixels/components/PixelsList").then((m) => ({
    default: m.PixelsList,
  })),
);

export const marketingPixelsRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/marketing/pixels",
  component: () => (
    <RequirePermission modulo="marketing" permissions={["mktg_pixel_ver"]}>
      <Suspense fallback={null}>
        <PixelsList />
      </Suspense>
    </RequirePermission>
  ),
});
