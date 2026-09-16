import { describe, it, expect } from "vitest";
import { npsModule } from "~/features/nps/module";

describe("NPS - Module Registration", () => {
  it("tem definicao basica", () => {
    expect(npsModule.key).toBe("nps");
    expect(npsModule.nome).toBeTruthy();
    expect(npsModule.descricao).toBeTruthy();
    expect(npsModule.routes.length).toBeGreaterThan(0);
  });

  it("possui ambientes definidos", () => {
    expect(npsModule.ambientes).toContain("cadastro");
    expect(npsModule.ambientes).toContain("consultor");
    expect(npsModule.ambientes).toContain("tecnologia");
  });

  it("possui design config habilitado", () => {
    expect(npsModule.hasDesignConfig).toBe(true);
  });

  it("possui 6 rotas registradas", () => {
    expect(npsModule.routes).toHaveLength(6);
  });
});
