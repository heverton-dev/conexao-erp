// Fecha uma lacuna que o grafo de conhecimento (code-review-graph) sinalizou
// após o refactor do AuthProvider em hooks: nenhum teste exercitava o
// caminho feliz de `fetchProfile` (perfil encontrado) ponta a ponta —
// AuthProvider.test.tsx sempre simula banco vazio, e os testes de cada hook
// (useProfile/usePermissions/useCompany) o fazem isolados, sem confirmar que
// a integração entre eles (fetchProfile -> carregarPermissoesUsuario ->
// carregarEmpresa) continua correta.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuth } from "~/core/auth/useAuth";
import { AuthProvider } from "~/core/auth/AuthProvider";

const { mockGetUser, mockOnAuthStateChange, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock("~/core/supabase", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock("~/registry", () => ({
  getAllPermissionKeys: vi.fn(() => []),
}));

vi.mock("~/config/empresa", () => ({
  EMPRESA_ID: "empresa-teste-123",
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn() },
}));

type TableResult = { data: unknown; error?: unknown };

// Builder único que serve tanto chamadas terminadas em .single()/.maybeSingle()
// quanto chamadas usadas direto com `await` (listagens sem terminal), via `then`.
function builder({ data, error = null }: TableResult) {
  const self: Record<string, unknown> = {
    select: vi.fn(() => self),
    eq: vi.fn(() => self),
    in: vi.fn(() => self),
    order: vi.fn(() => self),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: (resolve: (v: { data: unknown; error: unknown }) => void) =>
      resolve({ data, error }),
  };
  return self;
}

function setupFromMock(overrides: Record<string, TableResult>) {
  mockFrom.mockImplementation((table: string) =>
    builder(overrides[table] ?? { data: null }),
  );
}

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="profile">{auth.profile?.nome ?? "null"}</span>
      <span data-testid="permissao">
        {String(auth.permissoes?.["pode_editar"] ?? "null")}
      </span>
      <span data-testid="empresaNome">{auth.empresa?.nome ?? "null"}</span>
      <span data-testid="moduloAtivo">
        {auth.modulosAtivos.includes("crm") ? "sim" : "nao"}
      </span>
    </div>
  );
}

describe("AuthProvider — integração fetchProfile → permissões → empresa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockImplementation(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));
  });

  it("ao encontrar o profile, carrega permissoes e empresa com os dados retornados", async () => {
    const fakeUser = { id: "user-1", email: "user@test.com" };
    mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });

    setupFromMock({
      profiles: { data: { id: "user-1", nome: "Fulano", is_super_admin: false } },
      usuario_perfis: { data: [] },
      permissoes: {
        data: { permissoes: { pode_editar: true }, modulos_acesso: null },
      },
      empresas: {
        data: { id: "empresa-teste-123", nome: "Empresa Teste", slug: "teste" },
      },
      empresas_config: { data: null },
      empresa_modulos: { data: [{ modulo_key: "crm" }] },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile").textContent).toBe("Fulano");
    });
    expect(screen.getByTestId("permissao").textContent).toBe("true");
    await waitFor(() => {
      expect(screen.getByTestId("empresaNome").textContent).toBe(
        "Empresa Teste",
      );
    });
    expect(screen.getByTestId("moduloAtivo").textContent).toBe("sim");
  });

  it("super admin recebe todas as chaves de permissao sem consultar a tabela permissoes", async () => {
    const fakeUser = { id: "sa-1", email: "sa@test.com" };
    mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });

    setupFromMock({
      profiles: {
        data: { id: "sa-1", nome: "Super Admin", is_super_admin: true },
      },
      empresas: {
        data: { id: "empresa-teste-123", nome: "Empresa Teste", slug: "teste" },
      },
      empresas_config: { data: null },
      empresa_modulos: { data: [] },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile").textContent).toBe("Super Admin");
    });
    expect(mockFrom).not.toHaveBeenCalledWith("permissoes");
  });
});
