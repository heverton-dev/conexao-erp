/**
 * EmpresaCrudGuard — Single-Tenant
 *
 * Em modo single-tenant, a empresa é sempre a mesma (EMPRESA_ID fixo).
 * Guard simplificado: não precisa buscar lista de empresas nem fornecer contexto.
 * Apenas renderiza children diretamente.
 */

interface EmpresaCrudGuardProps {
  children: React.ReactNode;
}

export function EmpresaCrudGuard({ children }: EmpresaCrudGuardProps) {
  return <>{children}</>;
}
