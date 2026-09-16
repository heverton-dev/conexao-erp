/**
 * EmpresaCrudContext — Single-Tenant
 *
 * Em modo single-tenant, a empresa é sempre a mesma.
 * Este hook retorna uma constante diretamente.
 */

/**
 * Retorna o ID da empresa atual (fixo em single-tenant).
 * Mantido para compatibilidade com componentes existentes.
 */
export function useEmpresaCrudId(): string {
  return "default"
}

/**
 * Contexto compatível — Provider é no-op em single-tenant.
 * Mantido para não quebrar imports existentes.
 */
export const EmpresaCrudContext = {
  Provider: ({ children }: { children: React.ReactNode }) => children,
  Consumer: ({ children }: { children: (value: string) => React.ReactNode }) =>
    children("default"),
};
