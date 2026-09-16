import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthContext } from "~/core/auth/useAuth";
import { PermissionBadge } from "~/components/ui/permission-badge";
import type { AuthContextType } from "~/core/auth/types";

function createMockAuth(
  permissoes: Record<string, boolean> | null,
): AuthContextType {
  return {
    user: null,
    profile: null,
    permissoes,
    modulosAcesso: null,
    empresa: null,
    modulosAtivos: [],
    loading: false,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    resetPassword: async () => {},
    fetchProfile: async () => {},
    refreshPermissoes: () => {},
  } as AuthContextType;
}

function renderWithAuth(ui: React.ReactElement, auth: AuthContextType) {
  return render(<AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>);
}

describe("PermissionBadge", () => {
  it("renderiza badge quando tem permissao", () => {
    renderWithAuth(
      <PermissionBadge permissionKey="ver_relatorios" label="Ver Relatorios" />,
      createMockAuth({ ver_relatorios: true }),
    );
    expect(screen.getByText("Ver Relatorios")).toBeInTheDocument();
  });

  it("nao renderiza quando nao tem permissao", () => {
    renderWithAuth(
      <PermissionBadge permissionKey="ver_relatorios" label="Ver Relatorios" />,
      createMockAuth({}),
    );
    expect(screen.queryByText("Ver Relatorios")).not.toBeInTheDocument();
  });

  it("nao renderiza quando permissoes e null", () => {
    renderWithAuth(
      <PermissionBadge permissionKey="ver_relatorios" label="Ver Relatorios" />,
      createMockAuth(null),
    );
    expect(screen.queryByText("Ver Relatorios")).not.toBeInTheDocument();
  });

  it("nao renderiza quando permissao e false", () => {
    renderWithAuth(
      <PermissionBadge permissionKey="excluir_cadastro" label="Excluir" />,
      createMockAuth({ excluir_cadastro: false }),
    );
    expect(screen.queryByText("Excluir")).not.toBeInTheDocument();
  });
});
