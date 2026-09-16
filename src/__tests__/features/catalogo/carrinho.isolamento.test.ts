import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock EMPRESA_ID para testes
vi.mock("~/config/empresa", () => ({
  EMPRESA_ID: "empresa-teste",
  EMPRESA_SLUG: "empresa-teste",
}))

async function loadCarrinho() {
  vi.resetModules()
  return await import("~/features/catalogo/services/carrinho.service")
}

function item(sku: string, preco = 100) {
  return { sku, nome: `Prod ${sku}`, tipo: "implante" as const, cor: "#ffffff", preco }
}

const key = (userId: string | null) =>
  `conexao_cart_v1_empresa-teste_${userId ?? "anon"}`

describe("carrinho single-tenant: isolamento por usuário", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("não escreve mais na chave fixa antiga (conexao_cart_v1)", async () => {
    const m = await loadCarrinho()
    m.setCarrinhoScope("user1")
    m.addToCart(item("SKU1"))
    expect(localStorage.getItem("conexao_cart_v1")).toBeNull()
  })

  it("usuários diferentes têm carrinhos distintos", async () => {
    const m = await loadCarrinho()

    m.setCarrinhoScope("user1")
    m.addToCart(item("SKU1"))
    expect(JSON.parse(localStorage.getItem(key("user1"))!)[0].sku).toBe("SKU1")

    m.setCarrinhoScope("user2")
    m.addToCart(item("SKU2"))

    expect(JSON.parse(localStorage.getItem(key("user1"))!)[0].sku).toBe("SKU1")
    expect(JSON.parse(localStorage.getItem(key("user2"))!)[0].sku).toBe("SKU2")

    // volta para user1: item dele continua isolado
    m.setCarrinhoScope("user1")
    expect(JSON.parse(localStorage.getItem(key("user1"))!)[0].sku).toBe("SKU1")
  })

  it("add/remove/quantidade afetam apenas o escopo atual", async () => {
    const m = await loadCarrinho()

    m.setCarrinhoScope("user1")
    m.addToCart(item("SKU1", 100))
    m.addToCart(item("SKU1", 100)) // soma -> quantidade 2
    m.setQuantidade("SKU1", 5)
    let itens = JSON.parse(localStorage.getItem(key("user1"))!)
    expect(itens[0].quantidade).toBe(5)

    const { qtd, total } = m.cartTotais(itens)
    expect(qtd).toBe(5)
    expect(total).toBe(500)

    m.removeFromCart("SKU1")
    expect(localStorage.getItem(key("user1"))).toBe("[]")
  })

  it("escopo com usuário não logado (anon) não vaza para usuário logado", async () => {
    const m = await loadCarrinho()

    m.setCarrinhoScope(null)
    m.addToCart(item("SKU_GUEST"))

    m.setCarrinhoScope("user1")
    expect(localStorage.getItem(key("user1"))).toBeNull()

    m.setCarrinhoScope(null)
    expect(JSON.parse(localStorage.getItem(key(null))!)[0].sku).toBe("SKU_GUEST")
  })
})
