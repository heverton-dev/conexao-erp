import { createRoute, Navigate } from "@tanstack/react-router";
import { authLayout } from "./_auth";

export const funisRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/funis",
  component: () => <Navigate to="/funis/dashboard" />,
});
