import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { PublicLinkTreePage } from "~/features/linktree/components/PublicLinkTreePage";

export const linktreePublicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/linktree/$id",
  component: PublicLinkTreePage,
});
