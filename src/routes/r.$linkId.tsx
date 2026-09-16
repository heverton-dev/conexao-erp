import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { useEffect, useState } from "react";
import { registrarClique } from "~/features/gerador-links/services/tracking.service";
import { Loader2 } from "lucide-react";

function RedirectPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const linkId = window.location.pathname.replace("/r/", "");
    if (!linkId || linkId === "") {
      setStatus("error");
      return;
    }

    registrarClique(linkId)
      .then((data) => {
        const url = data?.[0]?.redirect_url;
        if (url) {
          window.location.href = url;
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  if (status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-text-main">
        <p className="text-lg font-semibold">Link não encontrado</p>
        <p className="text-sm text-text-muted">
          O link que você acessou é inválido ou foi removido.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-text-main">
      <Loader2 size={32} className="animate-spin text-accent" />
      <p className="text-sm text-text-muted">Redirecionando...</p>
    </div>
  );
}

export const linkRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/r/$linkId",
  component: RedirectPage,
});
