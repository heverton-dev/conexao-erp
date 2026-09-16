import { useEffect } from "react";
import { useAuth } from "~/core/auth";
import { useEmpresaTheme } from "~/core/theme";
import { useLocation } from "@tanstack/react-router";

const GENERIC_FAVICON = "/favicon-generic.svg";

export function useFavicon() {
  const { profile, empresa } = useAuth();
  const { faviconUrl } = useEmpresaTheme();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/catalogo")) return;

    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) return;

    const isSuperAdmin = profile?.is_super_admin ?? false;
    const isAdmin = profile?.role === "admin";

    let newHref = GENERIC_FAVICON;

    if (!isSuperAdmin && isAdmin && faviconUrl) {
      newHref = faviconUrl;
    }

    if (link.href !== newHref) {
      link.href = newHref;
    }
  }, [profile?.is_super_admin, profile?.role, empresa?.id, faviconUrl]);
}
