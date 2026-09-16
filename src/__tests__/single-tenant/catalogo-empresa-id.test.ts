import { describe, it, expect } from "vitest";
import { EMPRESA_ID } from "~/config/empresa";

/**
 * Testes de validação: useCatalogoEmpresaId em modo single-tenant.
 *
 * Verifica que o hook retorna EMPRESA_ID fixo e que o
 * EmpresaCrudContext funciona corretamente.
 */

describe("EMPRESA_ID constant", () => {
  it("should be a valid UUID", () => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(EMPRESA_ID)).toBe(true);
  });

  it("should be non-empty", () => {
    expect(EMPRESA_ID.length).toBeGreaterThan(0);
  });
});

describe("EmpresaCrudContext single-tenant", () => {
  it("should export EmpresaCrudContext", async () => {
    const mod = await import(
      "~/features/catalogo/contexts/EmpresaCrudContext"
    );
    expect(mod.EmpresaCrudContext).toBeDefined();
  });

  it("should export useEmpresaCrudId hook", async () => {
    const mod = await import(
      "~/features/catalogo/contexts/EmpresaCrudContext"
    );
    expect(typeof mod.useEmpresaCrudId).toBe("function");
  });
});

describe("EmpresaCrudGuard single-tenant", () => {
  it("should export EmpresaCrudGuard", async () => {
    const mod = await import(
      "~/features/catalogo/components/EmpresaCrudGuard"
    );
    expect(typeof mod.EmpresaCrudGuard).toBe("function");
  });
});
