import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { registerSW } from "~/pwa/registerSW";
import { DesignSystemProvider } from "~/design-system";
import { usePageTitle } from "~/hooks/usePageTitle";
import { useFavicon } from "~/hooks/useFavicon";
import { AgenteWidget } from "~/features/agentes/components/AgenteWidget";

registerSW();

export const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  usePageTitle();
  useFavicon();

  return (
    <DesignSystemProvider>
        <Outlet />
        <AgenteWidget />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text-main)",
            border: "1px solid var(--color-border-subtle)",
          },
        }}
      />
    </DesignSystemProvider>
  );
}
