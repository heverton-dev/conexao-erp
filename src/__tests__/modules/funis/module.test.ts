import { describe, it, expect } from "vitest";
import { funisModule } from "~/features/funis/module";

describe("Funis Registration", () => {
  it("tem key, nome, descricao, icon, routes e permissions", () => {
    expect(funisModule.key).toBe("funis");
    expect(funisModule.nome).toBe("Funis");
    expect(funisModule.descricao).toBeTruthy();
    expect(funisModule.icon).toBeTruthy();
    expect(funisModule.routes?.length).toBeGreaterThanOrEqual(4);
    expect(funisModule.permissions?.length).toBeGreaterThanOrEqual(8);
  });

  it("possui ambientes definidos (cadastro, consultor, tecnologia)", () => {
    expect(funisModule.ambientes).toContain("cadastro");
    expect(funisModule.ambientes).toContain("consultor");
    expect(funisModule.ambientes).toContain("tecnologia");
  });

  it("possui hasDesignConfig true", () => {
    expect(funisModule.hasDesignConfig).toBe(true);
  });

  it("rota inicial e /funis/dashboard", () => {
    expect(funisModule.routes).toContain("/funis/dashboard");
  });
});
