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

vi.mock("~/core/services/webhooks", () => ({
  dispararEventoModulo: vi.fn().mockResolvedValue(undefined),
}))

function mockSingleResolve(data: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
    then: vi.fn((resolve: (v: unknown) => void) => resolve({ data: [], error: null })),
  }
}

describe("Catalogo - Eventos da Central de Acoes", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("Implantes", () => {
    it("criarImplante dispara 'produto.criado'", async () => {
      const { criarImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "IMP-001", linha_id: "lin-1", diametro_mm: 4, comprimento_mm: 10 }) as unknown as ReturnType<typeof supabase.from>)
      await criarImplante({ sku: "IMP-001", nome: "Implante Teste", linha_id: "lin-1", diametro_mm: 4, comprimento_mm: 10 })
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.criado",
        { sku: "IMP-001", tipo: "implante" },
      )
    })

    it("atualizarImplante dispara 'produto.atualizado'", async () => {
      const { atualizarImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "IMP-001" }) as unknown as ReturnType<typeof supabase.from>)
      await atualizarImplante("IMP-001", { diametro_mm: 5 })
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.atualizado",
        { sku: "IMP-001", tipo: "implante" },
      )
    })

    it("removerImplante dispara 'produto.removido'", async () => {
      const { removerImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as unknown as ReturnType<typeof supabase.from>)
      await removerImplante("IMP-001")
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.removido",
        { sku: "IMP-001", tipo: "implante" },
      )
    })
  })

  describe("Abutments (Componentes)", () => {
    it("criarAbutment dispara 'produto.criado'", async () => {
      const { criarAbutment } = await import("~/features/catalogo/services/componentes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "ABT-001" }) as unknown as ReturnType<typeof supabase.from>)
      await criarAbutment({ sku: "ABT-001", nome: "Abutment Teste", tipo_abutment_id: "ta-1" })
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.criado",
        { sku: "ABT-001", tipo: "abutment" },
      )
    })

    it("atualizarAbutment dispara 'produto.atualizado'", async () => {
      const { atualizarAbutment } = await import("~/features/catalogo/services/componentes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "ABT-001" }) as unknown as ReturnType<typeof supabase.from>)
      await atualizarAbutment("ABT-001", { altura_corpo_mm: 5 })
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.atualizado",
        { sku: "ABT-001", tipo: "abutment" },
      )
    })

    it("removerAbutment dispara 'produto.removido'", async () => {
      const { removerAbutment } = await import("~/features/catalogo/services/componentes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as unknown as ReturnType<typeof supabase.from>)
      await removerAbutment("ABT-001")
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.removido",
        { sku: "ABT-001", tipo: "abutment" },
      )
    })
  })

  describe("Kits", () => {
    it("criarKit dispara 'produto.criado'", async () => {
      const { criarKit } = await import("~/features/catalogo/services/kits.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "KIT-001" }) as unknown as ReturnType<typeof supabase.from>)
      await criarKit({ sku: "KIT-001", nome: "Kit Teste" })
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.criado",
        { sku: "KIT-001", tipo: "kit" },
      )
    })

    it("atualizarKit dispara 'produto.atualizado'", async () => {
      const { atualizarKit } = await import("~/features/catalogo/services/kits.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "KIT-001" }) as unknown as ReturnType<typeof supabase.from>)
      await atualizarKit("KIT-001", { nome: "Atualizado" })
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.atualizado",
        { sku: "KIT-001", tipo: "kit" },
      )
    })

    it("removerKit dispara 'produto.removido'", async () => {
      const { removerKit } = await import("~/features/catalogo/services/kits.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as unknown as ReturnType<typeof supabase.from>)
      await removerKit("KIT-001")
      expect(dispararEventoModulo).toHaveBeenCalledWith(
        "catalogo", "produto.removido",
        { sku: "KIT-001", tipo: "kit" },
      )
    })
  })

  describe("Payload dos eventos inclui sku e tipo do produto", () => {
    it("payload do evento produto.criado contem sku e tipo", async () => {
      const { criarImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue(mockSingleResolve({ sku: "IMP-001" }) as unknown as ReturnType<typeof supabase.from>)
      await criarImplante({ sku: "IMP-001", nome: "Implante Teste", linha_id: "lin-1", diametro_mm: 4, comprimento_mm: 10 })
      const payload = vi.mocked(dispararEventoModulo).mock.calls[0][2]
      expect(payload).toEqual({ sku: "IMP-001", tipo: "implante" })
    })

    it("payload do evento produto.removido contem sku e tipo", async () => {
      const { removerImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(supabase.from).mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as unknown as ReturnType<typeof supabase.from>)
      await removerImplante("IMP-001")
      const payload = vi.mocked(dispararEventoModulo).mock.calls[0][2]
      expect(payload).toEqual({ sku: "IMP-001", tipo: "implante" })
    })
  })

  describe("Eventos sao fire-and-forget (.catch(() => {}))", () => {
    it("erro no disparo do evento nao propaga para o chamador", async () => {
      const { removerImplante } = await import("~/features/catalogo/services/implantes.service")
      const { supabase } = await import("~/core/supabase")
      const { dispararEventoModulo } = await import("~/core/services/webhooks")
      vi.mocked(dispararEventoModulo).mockRejectedValue(new Error("Webhook error"))
      vi.mocked(supabase.from).mockReturnValue({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() } as unknown as ReturnType<typeof supabase.from>)
      await expect(removerImplante("IMP-001")).resolves.not.toThrow()
    })
  })
})
