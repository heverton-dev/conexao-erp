import { describe, it, expect } from "vitest";
import { EMPRESA_ID } from "~/config/empresa";

/**
 * Testes de validação: Services do catálogo em modo single-tenant.
 *
 * Verifica que os services importam corretamente e que
 * a constante EMPRESA_ID está disponível.
 */

describe("EMPRESA_ID availability", () => {
  it("should be defined", () => {
    expect(EMPRESA_ID).toBeDefined();
    expect(typeof EMPRESA_ID).toBe("string");
  });
});

describe("Catalogo services imports", () => {
  it("should import implantes service", async () => {
    const mod = await import("~/features/catalogo/services/implantes.service");
    expect(mod).toBeDefined();
  });

  it("should import clientes service", async () => {
    const mod = await import("~/features/catalogo/services/clientes.service");
    expect(mod).toBeDefined();
  });

  it("should import grupos service", async () => {
    const mod = await import("~/features/catalogo/services/grupos.service");
    expect(mod).toBeDefined();
  });

  it("should import pedidos service", async () => {
    const mod = await import("~/features/catalogo/services/pedidos.service");
    expect(mod).toBeDefined();
  });

  it("should import orcamentos service", async () => {
    const mod = await import(
      "~/features/catalogo/services/orcamentos.service"
    );
    expect(mod).toBeDefined();
  });
});

describe("useCatalogoEmpresaId hook", () => {
  it("should export useCatalogoEmpresaId", async () => {
    const mod = await import("~/features/catalogo/hooks/useCatalogoEmpresa");
    expect(typeof mod.useCatalogoEmpresaId).toBe("function");
  });
});
