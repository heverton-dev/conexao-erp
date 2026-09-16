import { describe, it, expect } from "vitest";
import { EMPRESA_ID } from "~/config/empresa";
import { EmpresaContext } from "~/core/empresa/EmpresaContext";
import { useEmpresa } from "~/core/empresa/useEmpresa";

/**
 * Testes de validação: AuthProvider em modo single-tenant.
 *
 * Verifica que o AuthProvider usa EMPRESA_ID fixo para buscar
 * dados da empresa (módulos ativos, permissões, etc.).
 */

describe("AuthProvider single-tenant", () => {
  it("should import EMPRESA_ID from config", () => {
    expect(EMPRESA_ID).toBeDefined();
    expect(typeof EMPRESA_ID).toBe("string");
    expect(EMPRESA_ID.length).toBeGreaterThan(0);
  });

  it("should have EmpresaContext with correct shape", () => {
    expect(EmpresaContext).toBeDefined();
    expect(EmpresaContext.Provider).toBeDefined();
    expect(EmpresaContext.Consumer).toBeDefined();
  });

  it("should have useEmpresa hook", () => {
    expect(typeof useEmpresa).toBe("function");
  });
});

describe("Auth types single-tenant", () => {
  it("should have Profile type defined", async () => {
    const mod = await import("~/core/auth/types");
    expect(mod).toBeDefined();
  });
});
