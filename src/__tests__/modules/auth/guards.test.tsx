import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("~/lib/auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "~/lib/auth";
import type { AuthContextType } from "~/lib/auth";
import { RequirePermission } from "~/components/guards/RequirePermission";
import { RequireSuperAdmin } from "~/components/guards/RequireSuperAdmin";

const mockUseAuth = vi.mocked(useAuth);

// Default auth state — non-admin, loading=false, all empty
const defaultAuthState = {
  user: { id: "user-1" } as unknown as AuthContextType["user"],
  profile: {
    id: "user-1",
    email: "test@test.com",
    nome: "Test User",
    role: "cadastro" as const,
    ambiente: "cadastro",
    is_super_admin: false,
    ativo: true,
  },
  permissoes: null,
  modulosAcesso: null,
  empresa: null,
  modulosAtivos: [],
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
};

function makeAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return { ...defaultAuthState, ...overrides } as ReturnType<typeof useAuth>;
}

// ─── RequirePermission ────────────────────────────────────────────────

describe("RequirePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("super admin bypass", () => {
    it("shows children when user is super admin", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          profile: {
            id: "sa-1",
            email: "admin@test.com",
            nome: "Super Admin",
            role: "admin",
            ambiente: "admin",
            is_super_admin: true,
            ativo: true,
          },
          permissoes: null,
        }),
      );

      render(
        <RequirePermission permissions={["nonexistent_key"]}>
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Content");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("permission key checks", () => {
    it("shows children when permission key matches", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          permissoes: { ver_todos_cadastros: true },
        }),
      );

      render(
        <RequirePermission permissions={["ver_todos_cadastros"]}>
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Content");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("redirects when permission key is missing", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          permissoes: { ver_todos_cadastros: false },
        }),
      );

      render(
        <RequirePermission permissions={["ver_todos_cadastros"]}>
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/cadastros/dashboard",
      });
    });

    it("requireAll=true requires all keys to be present", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          permissoes: {
            ver_todos_cadastros: true,
            aprovar_cadastro: false,
          },
        }),
      );

      render(
        <RequirePermission
          permissions={["ver_todos_cadastros", "aprovar_cadastro"]}
          requireAll={true}
        >
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/cadastros/dashboard",
      });
    });

    it("requireAll=true shows children when all keys match", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          permissoes: {
            ver_todos_cadastros: true,
            aprovar_cadastro: true,
          },
        }),
      );

      render(
        <RequirePermission
          permissions={["ver_todos_cadastros", "aprovar_cadastro"]}
          requireAll={true}
        >
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Content");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("requireAll=false (default) requires any key", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          permissoes: {
            ver_todos_cadastros: false,
            aprovar_cadastro: true,
          },
        }),
      );

      render(
        <RequirePermission
          permissions={["ver_todos_cadastros", "aprovar_cadastro"]}
        >
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Content");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows loading spinner when loading=true", () => {
      mockUseAuth.mockReturnValue(makeAuth({ loading: true }));

      const { container } = render(
        <RequirePermission permissions={["test_key"]}>
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).not.toBeNull();
    });
  });

  describe("modulo access", () => {
    it("shows children when modulo access is granted", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          modulosAcesso: {
            cadastros: {
              acessar: true,
              paginas: ["listar", "editar"],
              acoes: [],
            },
          },
        }),
      );

      render(
        <RequirePermission modulo="cadastros">
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Content");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("redirects when modulo access is denied", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          modulosAcesso: {
            cadastros: {
              acessar: false,
              paginas: [],
              acoes: [],
            },
          },
        }),
      );

      render(
        <RequirePermission modulo="cadastros">
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/cadastros/dashboard",
      });
    });

    it("redirects when modulo is not in modulosAcesso", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          modulosAcesso: {
            financeiro: {
              acessar: true,
              paginas: [],
              acoes: [],
            },
          },
        }),
      );

      render(
        <RequirePermission modulo="cadastros">
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/cadastros/dashboard",
      });
    });

    it("redirects when paginas are required but none match", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          modulosAcesso: {
            cadastros: {
              acessar: true,
              paginas: ["listar", "editar"],
              acoes: [],
            },
          },
        }),
      );

      render(
        <RequirePermission modulo="cadastros" paginas={["detalhes", "aprovar"]}>
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/cadastros/dashboard",
      });
    });

    it("shows children when paginas match (some overlap)", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          modulosAcesso: {
            cadastros: {
              acessar: true,
              paginas: ["listar", "editar", "detalhes"],
              acoes: [],
            },
          },
        }),
      );

      render(
        <RequirePermission modulo="cadastros" paginas={["detalhes", "aprovar"]}>
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.getByTestId("child")).toHaveTextContent("Content");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("custom redirectTo", () => {
    it("uses custom redirectTo when permission is missing", () => {
      mockUseAuth.mockReturnValue(
        makeAuth({
          permissoes: { ver_todos_cadastros: false },
        }),
      );

      render(
        <RequirePermission
          permissions={["ver_todos_cadastros"]}
          redirectTo="/custom/unauthorized"
        >
          <div data-testid="child">Content</div>
        </RequirePermission>,
      );

      expect(screen.queryByTestId("child")).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/custom/unauthorized",
      });
    });
  });
});

// ─── RequireSuperAdmin ────────────────────────────────────────────────

describe("RequireSuperAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows children when is_super_admin=true", () => {
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: {
          id: "sa-1",
          email: "admin@test.com",
          nome: "Super Admin",
          role: "admin",
          ambiente: "admin",
          is_super_admin: true,
          ativo: true,
        },
      }),
    );

    render(
      <RequireSuperAdmin>
        <div data-testid="child">Super Content</div>
      </RequireSuperAdmin>,
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Super Content");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("redirects when is_super_admin=false", () => {
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: {
          id: "user-1",
          email: "test@test.com",
          nome: "Regular User",
          role: "admin" as const,
          ambiente: "cadastro",
          is_super_admin: false,
          ativo: true,
        },
      }),
    );

    render(
      <RequireSuperAdmin>
        <div data-testid="child">Super Content</div>
      </RequireSuperAdmin>,
    );

    expect(screen.queryByTestId("child")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/cadastros/dashboard",
    });
  });

  it("redirects when profile is null", () => {
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: null,
      }),
    );

    render(
      <RequireSuperAdmin>
        <div data-testid="child">Super Content</div>
      </RequireSuperAdmin>,
    );

    expect(screen.queryByTestId("child")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/cadastros/dashboard",
    });
  });

  it("shows loading spinner when loading=true", () => {
    mockUseAuth.mockReturnValue(makeAuth({ loading: true }));

    const { container } = render(
      <RequireSuperAdmin>
        <div data-testid="child">Super Content</div>
      </RequireSuperAdmin>,
    );

    expect(screen.queryByTestId("child")).toBeNull();
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  it("uses custom redirectTo when not super admin", () => {
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile: {
          id: "user-1",
          email: "test@test.com",
          nome: "Regular User",
          role: "admin" as const,
          ambiente: "cadastro",
          is_super_admin: false,
          ativo: true,
        },
      }),
    );

    render(
      <RequireSuperAdmin redirectTo="/admin-only">
        <div data-testid="child">Super Content</div>
      </RequireSuperAdmin>,
    );

    expect(screen.queryByTestId("child")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/admin-only" });
  });
});
