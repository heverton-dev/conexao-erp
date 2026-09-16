import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { PublicEmpresaLinktree } from "~/features/linktree/components/PublicEmpresaLinktree";

export const empresaLinktreePublicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/e/$slug",
  component: PublicEmpresaLinktree,
});
