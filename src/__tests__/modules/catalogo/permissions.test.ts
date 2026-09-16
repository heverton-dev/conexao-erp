import { describe, it, expect } from "vitest"
import {
  CATALOGO_PERMISSIONS,
  CATALOGO_CLIENTE_PERMISSIONS,
  CATALOGO_COLABORADOR_PERMISSIONS,
} from "~/features/catalogo/permissions"

describe("Catalogo - Permissoes ERP (admin/colaborador)", () => {
  it("define 13 permissoes do grupo ERP", () => {
    expect(CATALOGO_PERMISSIONS.length).toBe(13)
  })

  it("cada permissao tem key, label, description e group = 'Catalogo'", () => {
    for (const p of CATALOGO_PERMISSIONS) {
      expect(p.key).toBeTruthy()
      expect(p.label).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(p.group).toBe("Catálogo")
    }
  })

  it("inclui permissoes esperadas", () => {
    const keys = CATALOGO_PERMISSIONS.map((p) => p.key)
    expect(keys).toContain("catalogo_ver_catalogo")
    expect(keys).toContain("catalogo_gerenciar_produtos")
    expect(keys).toContain("catalogo_gerenciar_cadastros")
    expect(keys).toContain("catalogo_gerenciar_cupons")
    expect(keys).toContain("catalogo_gerenciar_frete")
    expect(keys).toContain("catalogo_gerenciar_promocionais")
    expect(keys).toContain("catalogo_dashboard")
    expect(keys).toContain("catalogo_gerenciar_clientes")
    expect(keys).toContain("catalogo_gerenciar_grupos")
    expect(keys).toContain("catalogo_gerenciar_orcamentos")
    expect(keys).toContain("catalogo_gerenciar_pedidos")
    expect(keys).toContain("catalogo_gerenciar_solicitacoes")
  })

  it("inclui permissao de design", () => {
    const keys = CATALOGO_PERMISSIONS.map((p) => p.key)
    expect(keys).toContain("catalogo_gerenciar_design")
  })

  it("todas as keys comecam com 'catalogo_'", () => {
    for (const p of CATALOGO_PERMISSIONS) {
      expect(p.key.startsWith("catalogo_")).toBe(true)
    }
  })
})

describe("Catalogo - Permissoes de Cliente (loja)", () => {
  it("define 6 permissoes de cliente", () => {
    expect(CATALOGO_CLIENTE_PERMISSIONS.length).toBe(6)
  })

  it("cada permissao tem key, label e group", () => {
    for (const p of CATALOGO_CLIENTE_PERMISSIONS) {
      expect(p.key).toBeTruthy()
      expect(p.label).toBeTruthy()
      expect(p.group).toBe("Catálogo Cliente")
    }
  })

  it("inclui permissoes esperadas", () => {
    const keys = CATALOGO_CLIENTE_PERMISSIONS.map((p) => p.key)
    expect(keys).toContain("catalogo_cliente_ver_produtos")
    expect(keys).toContain("catalogo_cliente_ver_precos")
    expect(keys).toContain("catalogo_cliente_comprar")
    expect(keys).toContain("catalogo_cliente_ver_pedidos")
    expect(keys).toContain("catalogo_cliente_ver_favoritos")
    expect(keys).toContain("catalogo_cliente_rastrear")
  })

  it("todas as keys comecam com 'catalogo_cliente_'", () => {
    for (const p of CATALOGO_CLIENTE_PERMISSIONS) {
      expect(p.key.startsWith("catalogo_cliente_")).toBe(true)
    }
  })
})

describe("Catalogo - Permissoes de Colaborador", () => {
  it("define 7 permissoes de colaborador", () => {
    expect(CATALOGO_COLABORADOR_PERMISSIONS.length).toBe(7)
  })

  it("cada permissao tem key, label e group", () => {
    for (const p of CATALOGO_COLABORADOR_PERMISSIONS) {
      expect(p.key).toBeTruthy()
      expect(p.label).toBeTruthy()
      expect(p.group).toBe("Catálogo Colaborador")
    }
  })

  it("inclui permissoes esperadas", () => {
    const keys = CATALOGO_COLABORADOR_PERMISSIONS.map((p) => p.key)
    expect(keys).toContain("catalogo_colab_ver_produtos")
    expect(keys).toContain("catalogo_colab_ver_precos")
    expect(keys).toContain("catalogo_colab_criar_orcamento")
    expect(keys).toContain("catalogo_colab_gerenciar_orcamentos")
    expect(keys).toContain("catalogo_colab_compartilhar")
    expect(keys).toContain("catalogo_colab_converter_pedido")
    expect(keys).toContain("catalogo_colab_ver_pedidos")
  })

  it("todas as keys comecam com 'catalogo_colab_'", () => {
    for (const p of CATALOGO_COLABORADOR_PERMISSIONS) {
      expect(p.key.startsWith("catalogo_colab_")).toBe(true)
    }
  })
})

describe("Catalogo - Total de permissoes", () => {
  it("totaliza 26 permissoes (13 ERP + 6 cliente + 7 colaborador)", () => {
    const total =
      CATALOGO_PERMISSIONS.length +
      CATALOGO_CLIENTE_PERMISSIONS.length +
      CATALOGO_COLABORADOR_PERMISSIONS.length
    expect(total).toBe(26)
  })

  it("nenhuma key se repete entre os grupos", () => {
    const erpKeys = CATALOGO_PERMISSIONS.map((p) => p.key)
    const clienteKeys = CATALOGO_CLIENTE_PERMISSIONS.map((p) => p.key)
    const colabKeys = CATALOGO_COLABORADOR_PERMISSIONS.map((p) => p.key)
    const all = [...erpKeys, ...clienteKeys, ...colabKeys]
    const unique = new Set(all)
    expect(unique.size).toBe(all.length)
  })
})
