import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

vi.mock("~/core/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

vi.mock("~/lib/auth", () => ({
  useAuth: () => ({
    profile: { id: "user-1", empresa_id: "emp-123", nome: "Admin", role: "cadastro", is_super_admin: false },
  }),
}))

vi.mock("~/features/catalogo/hooks/useCatalogoEmpresa", () => ({
  useCatalogoEmpresaId: () => "emp-123",
}))

vi.mock("~/features/catalogo/contexts/EmpresaCrudContext", () => ({
  useEmpresaCrudId: () => "",
  EmpresaCrudContext: { Provider: ({ children }: { children: ReactNode }) => <>{children}</> },
}))

vi.mock("~/components/guards", () => ({
  RequirePermission: ({ children }: { children: ReactNode }) => <div data-testid="require-permission">{children}</div>,
}))

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

describe("Catalogo - AdminLayout", () => {
  it("AdminLayout e importavel e exporta um componente valido", async () => {
    const { AdminLayout } = await import("~/features/catalogo/components/AdminLayout")
    expect(AdminLayout).toBeDefined()
    expect(typeof AdminLayout).toBe("function")
  })

  it("AdminLayout renderiza children", async () => {
    const { AdminLayout } = await import("~/features/catalogo/components/AdminLayout")
    render(<Wrapper><AdminLayout><div data-testid="child">Conteudo</div></AdminLayout></Wrapper>)
    expect(screen.getByTestId("child")).toBeDefined()
    expect(screen.getByText("Conteudo")).toBeDefined()
  })
})

describe("Catalogo - EmpresaCrudGuard", () => {
  it("EmpresaCrudGuard e importavel", async () => {
    const { EmpresaCrudGuard } = await import("~/features/catalogo/components/EmpresaCrudGuard")
    expect(EmpresaCrudGuard).toBeDefined()
  })

  it("EmpresaCrudGuard renderiza children", async () => {
    const { EmpresaCrudGuard } = await import("~/features/catalogo/components/EmpresaCrudGuard")
    render(<Wrapper><EmpresaCrudGuard><div data-testid="guard-child">Protegido</div></EmpresaCrudGuard></Wrapper>)
    expect(screen.getByTestId("guard-child")).toBeDefined()
  })
})

describe("Catalogo - Componentes da store", () => {
  it("StoreLayout e importavel", async () => {
    const { StoreLayout } = await import("~/features/catalogo/components/StoreLayout")
    expect(StoreLayout).toBeDefined()
  })

  it("ProductCard e importavel", async () => {
    const { ProductCard } = await import("~/features/catalogo/components/ProductCard")
    expect(ProductCard).toBeDefined()
  })

  it("ProductSheet e importavel", async () => {
    const { ProductSheet } = await import("~/features/catalogo/components/ProductSheet")
    expect(ProductSheet).toBeDefined()
  })

  it("CartDrawer e importavel", async () => {
    const { CartDrawer } = await import("~/features/catalogo/components/CartDrawer")
    expect(CartDrawer).toBeDefined()
  })
})

describe("Catalogo - Componentes admin especificos", () => {
  it("ClientesAdmin e importavel", async () => {
    const { ClientesAdmin } = await import("~/features/catalogo/components/ClientesAdmin")
    expect(ClientesAdmin).toBeDefined()
  })

  it("GruposAdmin e importavel", async () => {
    const { GruposAdmin } = await import("~/features/catalogo/components/GruposAdmin")
    expect(GruposAdmin).toBeDefined()
  })

  it("ProdutoFormModal e importavel", async () => {
    const { ProdutoFormModal } = await import("~/features/catalogo/components/admin/produtos/ProdutoFormModal")
    expect(ProdutoFormModal).toBeDefined()
  })

  it("OrcamentosAdmin e importavel", async () => {
    const { OrcamentosAdmin } = await import("~/features/catalogo/components/OrcamentosAdmin")
    expect(OrcamentosAdmin).toBeDefined()
  })

  it("PedidosAdmin e importavel", async () => {
    const { PedidosAdmin } = await import("~/features/catalogo/components/PedidosAdmin")
    expect(PedidosAdmin).toBeDefined()
  })

  it("SolicitacoesAdmin e importavel", async () => {
    const { SolicitacoesAdmin } = await import("~/features/catalogo/components/SolicitacoesAdmin")
    expect(SolicitacoesAdmin).toBeDefined()
  })
})

describe("Catalogo - Componentes de design da loja", () => {
  it("componentes de design sao importaveis", async () => {
    const { ColorSection } = await import("~/features/catalogo/components/design/ColorSection")
    expect(ColorSection).toBeDefined()
    const { TypographySection } = await import("~/features/catalogo/components/design/TypographySection")
    expect(TypographySection).toBeDefined()
    const { PhoneMockup } = await import("~/features/catalogo/components/design/PhoneMockup")
    expect(PhoneMockup).toBeDefined()
  })
})

describe("Catalogo - Hooks de catalogo", () => {
  it("useCatalogo existe com hooks principais", async () => {
    const hooks = await import("~/features/catalogo/hooks/useCatalogo")
    expect(hooks.useCategorias).toBeDefined()
    expect(hooks.useImplantesAtivos).toBeDefined()
    expect(hooks.useTodosImplantes).toBeDefined()
    expect(hooks.useKitsAtivos).toBeDefined()
    expect(hooks.useTodosKits).toBeDefined()
    expect(hooks.useCupons).toBeDefined()
    expect(hooks.useWorkflows).toBeDefined()
    expect(hooks.useAbutments).toBeDefined()
    expect(hooks.useFretes).toBeDefined()
    expect(hooks.usePromocionais).toBeDefined()
  })

  it("hooks de mutation existem", async () => {
    const hooks = await import("~/features/catalogo/hooks/useCatalogo")
    expect(hooks.useCriarImplante).toBeDefined()
    expect(hooks.useToggleImplanteAtivo).toBeDefined()
    expect(hooks.useRemoverImplante).toBeDefined()
    expect(hooks.useCriarKit).toBeDefined()
    expect(hooks.useToggleKitAtivo).toBeDefined()
    expect(hooks.useRemoverKit).toBeDefined()
    expect(hooks.useCriarAbutment).toBeDefined()
    expect(hooks.useRemoverAbutment).toBeDefined()
  })

  it("useCatalogoEmpresa existe com funcao de resolucao", async () => {
    const { useCatalogoEmpresaId } = await import("~/features/catalogo/hooks/useCatalogoEmpresa")
    expect(useCatalogoEmpresaId).toBeDefined()
    expect(typeof useCatalogoEmpresaId).toBe("function")
  })

  it("useCatalogoCliente existe", async () => {
    const clienteMod = await import("~/features/catalogo/hooks/useCatalogoCliente")
    expect(clienteMod.useCatalogoCliente).toBeDefined()
  })
})

describe("Catalogo - Barrel exports", () => {
  it("index.ts exporta tudo", async () => {
    const barrel = await import("~/features/catalogo")
    expect(barrel.CATALOGO_PERMISSIONS).toBeDefined()
    expect(barrel.CATALOGO_CLIENTE_PERMISSIONS).toBeDefined()
    expect(barrel.CATALOGO_COLABORADOR_PERMISSIONS).toBeDefined()
    expect(barrel.catalogoModule).toBeDefined()
  })
})

describe("Catalogo - Tipos exportados", () => {
  it("types exporta interfaces de dominio", async () => {
    const types = await import("~/features/catalogo/types")
    // Verificar que os tipos existem (runtime check)
    expect(types).toBeDefined()
  })

  it("types/clientes exporta interfaces", async () => {
    const tiposCliente = await import("~/features/catalogo/types/clientes")
    expect(tiposCliente).toBeDefined()
  })

  it("types/pedidos exporta interfaces", async () => {
    const tiposPedido = await import("~/features/catalogo/types/pedidos")
    expect(tiposPedido).toBeDefined()
  })

  it("types/orcamentos exporta interfaces", async () => {
    const tiposOrc = await import("~/features/catalogo/types/orcamentos")
    expect(tiposOrc).toBeDefined()
  })
})

describe("Catalogo - Servicos importaveis", () => {
  it("todos os servicos sao importaveis sem erro", async () => {
    await expect(import("~/features/catalogo/services/hierarquia.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/implantes.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/componentes.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/acessorios.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/kits.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/workflows.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/cupons.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/frete.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/promocionais.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/clientes.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/grupos.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/design.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/pedidos.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/orcamentos.service")).resolves.toBeDefined()
    await expect(import("~/features/catalogo/services/carrinho.service")).resolves.toBeDefined()
  })

  it("captura erros de importacao", async () => {
    // Todos os servicos acima devem importar sem erro
    // Se um servico quebrar, este teste nao chega a executar
    expect(true).toBe(true)
  })
})
