import { useAuth } from "~/core/auth";

export function useEmpresaTheme() {
  const { empresa } = useAuth();
  return {
    logoUrl: empresa?.logo_url ?? null,
    logoIndexUrl: empresa?.logo_index_url ?? null,
    logoAppUrl: empresa?.logo_app_url ?? empresa?.logo_url ?? null,
    faviconUrl: empresa?.favicon_url ?? null,
    theme: empresa?.theme ?? {},
    empresaNome: empresa?.nome ?? null,
  };
}
