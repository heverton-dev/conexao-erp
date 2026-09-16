import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("~/core/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user" } }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}))

function mockQueryBuilder(overrides: Record<string, unknown> = {}) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn((resolve: (v: unknown) => void) => resolve({ data: [], error: null })),
    ...overrides,
  }
}

// Sistema é single-tenant desde 2026-07-21 (empresa_id removido de quase
// todas as tabelas). Estes testes garantem que os services do catalogo
// nao voltem a exigir/filtrar/injetar empresa_id (regressao arquitetural).
describe("Catalogo - Single-tenant (sem empresa_id)", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("Hierarquia services nao filtram por empresa_id", () => {
    async function testSemEmpresaFilter(
      serviceFn: () => Promise<unknown>,
      fromTable: string,
    ) {
      const { supabase } = await import("~/core/supabase")
      const mockEq = vi.fn().mockReturnThis()
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder({ eq: mockEq }) as unknown as ReturnType<typeof supabase.from>)
      await serviceFn()
      expect(supabase.from).toHaveBeenCalledWith(fromTable)
      expect(mockEq).not.toHaveBeenCalledWith("empresa_id", expect.anything())
    }

    it("listarCategorias nao filtra por empresa_id", async () => {
      const { listarCategorias } = await import("~/features/catalogo/services/hierarquia.service")
      await testSemEmpresaFilter(() => listarCategorias(), "catalogo_categorias")
    })

    it("listarConexoes nao filtra por empresa_id", async () => {
      const { listarConexoes } = await import("~/features/catalogo/services/hierarquia.service")
      await testSemEmpresaFilter(() => listarConexoes(), "catalogo_ips_conexoes")
    })

    it("listarFamilias nao filtra por empresa_id", async () => {
      const { listarFamilias } = await import("~/features/catalogo/services/hierarquia.service")
      await testSemEmpresaFilter(() => listarFamilias(), "catalogo_ips_familias")
    })

    it("listarLinhas nao filtra por empresa_id", async () => {
      const { listarLinhas } = await import("~/features/catalogo/services/hierarquia.service")
      await testSemEmpresaFilter(() => listarLinhas(), "catalogo_ips_linhas")
    })
  })

  describe("Listagens gerais nao recebem empresaId como parametro", () => {
    it("listarTodosImplantes nao exige empresaId", async () => {
      const { listarTodosImplantes } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder() as unknown as ReturnType<typeof supabase.from>)
      await expect(listarTodosImplantes()).resolves.toEqual([])
    })

    it("listarTodosKits nao exige empresaId", async () => {
      const { listarTodosKits } = await import("~/features/catalogo/services/kits.service")
      const { supabase } = await import("~/core/supabase")
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder() as unknown as ReturnType<typeof supabase.from>)
      await expect(listarTodosKits()).resolves.toEqual([])
    })
  })

  describe("CRUD operations nao injetam empresa_id", () => {
    it("criarImplante insere sem empresa_id", async () => {
      const { criarImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const mockInsert = vi.fn().mockReturnThis()
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder({
        insert: mockInsert,
        single: vi.fn().mockResolvedValue({ data: { sku: "IMP-001" }, error: null }),
      }) as unknown as ReturnType<typeof supabase.from>)
      await criarImplante({ sku: "IMP-001", nome: "Implante Teste", linha_id: "lin-1", diametro_mm: 4, comprimento_mm: 10 })
      expect(mockInsert).not.toHaveBeenCalledWith(expect.objectContaining({ empresa_id: expect.anything() }))
    })

    it("criarCategoria insere sem empresa_id", async () => {
      const { criarCategoria } = await import("~/features/catalogo/services/hierarquia.service")
      const { supabase } = await import("~/core/supabase")
      const mockInsert = vi.fn().mockReturnThis()
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder({
        insert: mockInsert,
        single: vi.fn().mockResolvedValue({ data: { id: "cat-1" }, error: null }),
      }) as unknown as ReturnType<typeof supabase.from>)
      await criarCategoria({ nome: "Categ B" })
      expect(mockInsert).not.toHaveBeenCalledWith(expect.objectContaining({ empresa_id: expect.anything() }))
    })

    it("atualizarImplante usa apenas sku no update (sem empresa_id)", async () => {
      const { atualizarImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const calls: { col: string; val: unknown }[] = []
      const mockEq = vi.fn((col: string, val: unknown) => {
        calls.push({ col, val })
        return builder
      })
      const builder = mockQueryBuilder({
        eq: mockEq,
        single: vi.fn().mockResolvedValue({ data: { sku: "IMP-001" }, error: null }),
      })
      vi.mocked(supabase.from).mockReturnValue(builder as unknown as ReturnType<typeof supabase.from>)
      await atualizarImplante("IMP-001", { diametro_mm: 5 })
      const empresaCalls = calls.filter((c) => c.col === "empresa_id")
      const skuCalls = calls.filter((c) => c.col === "sku")
      expect(empresaCalls).toHaveLength(0)
      expect(skuCalls.length).toBeGreaterThanOrEqual(1)
      expect(skuCalls[0].val).toBe("IMP-001")
    })

    it("removerImplante usa apenas sku no delete (sem empresa_id)", async () => {
      const { removerImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const calls: { col: string; val: unknown }[] = []
      const mockEq = vi.fn((col: string, val: unknown) => {
        calls.push({ col, val })
        return builder
      })
      const builder = mockQueryBuilder({ eq: mockEq })
      vi.mocked(supabase.from).mockReturnValue(builder as unknown as ReturnType<typeof supabase.from>)
      await removerImplante("IMP-002")
      const empresaCalls = calls.filter((c) => c.col === "empresa_id")
      const skuCalls = calls.filter((c) => c.col === "sku")
      expect(empresaCalls).toHaveLength(0)
      expect(skuCalls).toHaveLength(1)
      expect(skuCalls[0].val).toBe("IMP-002")
    })
  })

  describe("Tipos do catalogo nao possuem campo empresa_id", () => {
    it("CatalogoCategoria nao tem empresa_id", async () => {
      const { listarCategorias } = await import("~/features/catalogo/services/hierarquia.service")
      const { supabase } = await import("~/core/supabase")
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder({
        then: vi.fn((resolve: (v: unknown) => void) => resolve({ data: [{ id: "1", nome: "Categ A" }], error: null })),
      }) as unknown as ReturnType<typeof supabase.from>)
      const result = await listarCategorias()
      expect(result[0]).not.toHaveProperty("empresa_id")
    })

    it("CatalogoKit nao tem empresa_id", async () => {
      const { listarTodosKits } = await import("~/features/catalogo/services/kits.service")
      const { supabase } = await import("~/core/supabase")
      vi.mocked(supabase.from).mockReturnValue(mockQueryBuilder({
        then: vi.fn((resolve: (v: unknown) => void) => resolve({ data: [{ sku: "KIT-A", nome: "Kit A" }], error: null })),
      }) as unknown as ReturnType<typeof supabase.from>)
      const result = await listarTodosKits()
      expect(result[0]).not.toHaveProperty("empresa_id")
    })
  })

  describe("useCatalogoEmpresaId resolve valor fixo (single-tenant)", () => {
    it("useCatalogoEmpresaId e importavel e retorna string fixa", async () => {
      const mod = await import("~/features/catalogo/hooks/useCatalogoEmpresa")
      expect(mod.useCatalogoEmpresaId).toBeDefined()
      expect(typeof mod.useCatalogoEmpresaId).toBe("function")
      expect(mod.useCatalogoEmpresaId()).toBe("default")
    })
  })

  describe("EmpresaCrudContext existe", () => {
    it("EmpresaCrudContext e EmpresaCrudGuard sao exportados", async () => {
      const contextMod = await import("~/features/catalogo/contexts/EmpresaCrudContext")
      expect(contextMod.EmpresaCrudContext).toBeDefined()
      expect(contextMod.useEmpresaCrudId).toBeDefined()

      const guardMod = await import("~/features/catalogo/components/EmpresaCrudGuard")
      expect(guardMod.EmpresaCrudGuard).toBeDefined()
    })
  })
})
