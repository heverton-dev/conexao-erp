export { AuthProvider, useAuth, useCan, useCanAny, useCanAll } from "~/core/auth";
export type { Profile, AuthContextType } from "~/core/auth";

export type AppRole = "dev" | "diretor_comercial" | "gestor" | "consultor";

export const ROLE_LABEL: Record<AppRole, string> = {
  dev: "Desenvolvedor",
  diretor_comercial: "Diretor Comercial",
  gestor: "Gestor",
  consultor: "Consultor",
};
