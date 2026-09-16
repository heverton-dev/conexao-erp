import { describe, it, expect } from "vitest";
import { rotasModule } from "~/features/rotas/module";

describe("Rotas - Module Registration", () => {
  it("tem definicao basica", () => {
    expect(rotasModule.key).toBe("rotas");
    expect(rotasModule.nome).toBeTruthy();
    expect(rotasModule.descricao).toBeTruthy();
    expect(rotasModule.routes.length).toBeGreaterThan(0);
  });

  it("possui ambientes definidos", () => {
    expect(rotasModule.ambientes).toContain("cadastro");
    expect(rotasModule.ambientes).toContain("consultor");
    expect(rotasModule.ambientes).toContain("tecnologia");
  });

  it("possui design config habilitado", () => {
    expect(rotasModule.hasDesignConfig).toBe(true);
  });

  it("possui 3 rotas registradas", () => {
    expect(rotasModule.routes).toHaveLength(3);
  });
});
