import { describe, it, expect, vi, beforeAll } from "vitest"
import { catalogoModule } from "~/features/catalogo/module"
import { registerNavItem, getNavItems } from "~/registry/nav-items"
import { getAllPermissionDefs } from "~/registry/permissions-registry"


const MODULE_KEY = "catalogo"

describe("Catalogo - Module Registration", () => {
  it("tem key, nome, descricao, icon, routes e permissions", () => {
    expect(catalogoModule.key).toBe(MODULE_KEY)
    expect(catalogoModule.nome).toBe("Catálogo")
    expect(catalogoModule.descricao).toBeTruthy()
    expect(catalogoModule.icon).toBeTruthy()
    expect(catalogoModule.routes.length).toBeGreaterThanOrEqual(22)
    expect(catalogoModule.permissions.length).toBeGreaterThanOrEqual(13)
  })

  it("possui ambientes definidos (cadastro, tecnologia)", () => {
    expect(catalogoModule.ambientes).toContain("cadastro")
    expect(catalogoModule.ambientes).toContain("tecnologia")
  })

  it("possui 3 abas (geral, permissoes, eventos)", () => {
    expect(catalogoModule.abas).toHaveLength(3)
    const keys = catalogoModule.abas.map((a) => a.key)
    expect(keys).toContain("geral")
    expect(keys).toContain("permissoes")
    expect(keys).toContain("eventos")
  })

  it("registra rotas admin essenciais", () => {
    expect(catalogoModule.routes).toContain("/catalogo/admin/dashboard")
    expect(catalogoModule.routes).toContain("/catalogo/admin/produtos")
    expect(catalogoModule.routes).toContain("/catalogo/admin/cadastros")
    expect(catalogoModule.routes).toContain("/catalogo/admin/cupons")
    expect(catalogoModule.routes).toContain("/catalogo/admin/frete")
    expect(catalogoModule.routes).toContain("/catalogo/admin/promocionais")
    expect(catalogoModule.routes).toContain("/catalogo/admin/configuracoes")
    expect(catalogoModule.routes).toContain("/catalogo/admin/design")
    expect(catalogoModule.routes).toContain("/catalogo/admin/clientes")
    expect(catalogoModule.routes).toContain("/catalogo/admin/grupos")
    expect(catalogoModule.routes).toContain("/catalogo/admin/orcamentos")
    expect(catalogoModule.routes).toContain("/catalogo/admin/pedidos")
    expect(catalogoModule.routes).toContain("/catalogo/admin/solicitacoes")
  })

  it("registra rotas da loja publica", () => {
    expect(catalogoModule.routes).toContain("/catalogo")
    expect(catalogoModule.routes).toContain("/catalogo/carrinho")
    expect(catalogoModule.routes).toContain("/catalogo/checkout")
  })
})

describe("Catalogo - Eventos", () => {
  it("possui eventos registrados", () => {
    expect(catalogoModule.events.length).toBeGreaterThanOrEqual(20)
  })

  it("cada evento tem key, label, descricao e type", () => {
    for (const e of catalogoModule.events) {
      expect(e.key).toBeTruthy()
      expect(e.label).toBeTruthy()
      expect(e.descricao).toBeTruthy()
      expect(["status_change", "button_action"]).toContain(e.type)
    }
  })

  it("inclui eventos de produto (criado, atualizado, removido)", () => {
    const keys = catalogoModule.events.map((e) => e.key)
    expect(keys).toContain("produto.criado")
    expect(keys).toContain("produto.atualizado")
    expect(keys).toContain("produto.removido")
  })

  it("inclui eventos de orcamento (criado, enviado, aprovado, reprovado)", () => {
    const keys = catalogoModule.events.map((e) => e.key)
    expect(keys).toContain("orcamento.criado")
    expect(keys).toContain("orcamento.enviado")
    expect(keys).toContain("orcamento.aprovado")
    expect(keys).toContain("orcamento.reprovado")
  })

  it("inclui eventos de pedido (criado, pago, confirmado, enviado, entregue, cancelado)", () => {
    const keys = catalogoModule.events.map((e) => e.key)
    expect(keys).toContain("pedido.criado")
    expect(keys).toContain("pedido.pago")
    expect(keys).toContain("pedido.confirmado")
    expect(keys).toContain("pedido.enviado")
    expect(keys).toContain("pedido.entregue")
    expect(keys).toContain("pedido.cancelado")
  })

  it("inclui eventos de solicitacao de acesso", () => {
    const keys = catalogoModule.events.map((e) => e.key)
    expect(keys).toContain("solicitacao_acesso.criada")
    expect(keys).toContain("solicitacao_acesso.aprovada")
    expect(keys).toContain("solicitacao_acesso.rejeitada")
  })

  it("inclui eventos de promocional, cupom e cliente", () => {
    const keys = catalogoModule.events.map((e) => e.key)
    expect(keys).toContain("promocional.criado")
    expect(keys).toContain("cupom.utilizado")
    expect(keys).toContain("cliente.credencial_criada")
  })

  it("orcamento.pedido_criado e um button_action", () => {
    const event = catalogoModule.events.find((e) => e.key === "orcamento.pedido_criado")
    expect(event?.type).toBe("button_action")
  })

  it("cupom.utilizado e um button_action", () => {
    const event = catalogoModule.events.find((e) => e.key === "cupom.utilizado")
    expect(event?.type).toBe("button_action")
  })
})

describe("Catalogo - Nav Items", () => {
  const catalogoTruePerms: Record<string, boolean> = {
    catalogo_ver_catalogo: true,
    catalogo_gerenciar_produtos: true,
    catalogo_gerenciar_cadastros: true,
    catalogo_gerenciar_cupons: true,
    catalogo_gerenciar_frete: true,
    catalogo_gerenciar_promocionais: true,
    catalogo_dashboard: true,
    catalogo_gerenciar_design: true,
    catalogo_gerenciar_clientes: true,
    catalogo_gerenciar_grupos: true,
    catalogo_gerenciar_orcamentos: true,
    catalogo_gerenciar_pedidos: true,
    catalogo_gerenciar_solicitacoes: true,
  }
  const allPerms = catalogoTruePerms
  const noPerms: Record<string, boolean> = {}

  beforeAll(() => {
    catalogoModule.setup?.()
  })

  it("setup registra permissions no registry", () => {
    const defs = getAllPermissionDefs()
    const catalogoPerms = defs.filter((d) => d.key.startsWith("catalogo_"))
    expect(catalogoPerms.length).toBeGreaterThanOrEqual(13)
  })

  it("nav items retornam itens com todas permissoes true", () => {
    const items = getNavItems(allPerms as any, MODULE_KEY)
    expect(items.length).toBeGreaterThanOrEqual(14)
  })

  it("nav items retornam 0 com permissoes vazias", () => {
    const items = getNavItems(noPerms, MODULE_KEY)
    expect(items).toHaveLength(0)
  })

  it("nav items retornam 0 com permissoes null", () => {
    const items = getNavItems(null as any, MODULE_KEY)
    expect(items).toHaveLength(0)
  })

  it("cada nav item tem permissionCheck funcional", () => {
    const items = getNavItems(allPerms as any, MODULE_KEY)
    for (const item of items) {
      expect(item.permissionCheck(allPerms as any)).toBe(true)
      expect(item.permissionCheck(noPerms)).toBe(false)
    }
  })

  it("nav items estao ordenados por order", () => {
    const items = getNavItems(allPerms as any, MODULE_KEY)
    for (let i = 1; i < items.length; i++) {
      expect(items[i].order).toBeGreaterThanOrEqual(items[i - 1].order)
    }
  })

  it("inclui todos os nav items esperados", () => {
    const items = getNavItems(allPerms as any, MODULE_KEY)
    const ids = items.map((i) => i.id)
    expect(ids).toContain("catalogo-preview")
    expect(ids).toContain("catalogo-admin-dashboard")
    expect(ids).toContain("catalogo-admin-produtos")
    expect(ids).toContain("catalogo-admin-cadastros")
    expect(ids).toContain("catalogo-admin-cupons")
    expect(ids).toContain("catalogo-admin-frete")
    expect(ids).toContain("catalogo-admin-promocionais")
    expect(ids).toContain("catalogo-admin-clientes")
    expect(ids).toContain("catalogo-admin-grupos")
    expect(ids).toContain("catalogo-admin-orcamentos")
    expect(ids).toContain("catalogo-admin-pedidos")
    expect(ids).toContain("catalogo-admin-solicitacoes")
  })

  it("preview tem noChildMatch true", () => {
    const items = getNavItems(allPerms as any, MODULE_KEY)
    const preview = items.find((i) => i.id === "catalogo-preview")
    expect(preview?.noChildMatch).toBe(true)
  })
})

describe("Catalogo - hasDesignConfig", () => {
  it("hasDesignConfig esta como true (design config implementado)", () => {
    expect(catalogoModule.hasDesignConfig).toBe(true)
  })
})
