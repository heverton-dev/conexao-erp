import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { PageHeader } from "~/components/ui/page-header";
import { QrCodeGenerator } from "~/features/gerador-links/components/sections/QrCodeGenerator";
import { RequirePermission } from "~/components/guards";

function QrCodePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="QR Code"
        description="Gere QR Codes para qualquer URL"
      />
      <QrCodeGenerator />
    </div>
  );
}

export const ferramentasLinksQrcodeRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/ferramentas/links/qrcode",
  component: () => (
    <RequirePermission modulo="gerador-links" permissions={["lk_gerar"]}>
      <QrCodePage />
    </RequirePermission>
  ),
});
