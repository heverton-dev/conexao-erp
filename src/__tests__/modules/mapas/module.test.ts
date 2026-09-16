import { describe, it, expect } from "vitest";
import { mapasModule } from "~/features/mapas/module";

describe("Mapas - Module Registration", () => {
  it("tem definicao basica", () => {
    expect(mapasModule.key).toBe("mapas-interativos");
    expect(mapasModule.nome).toBeTruthy();
    expect(mapasModule.descricao).toBeTruthy();
    expect(mapasModule.routes.length).toBeGreaterThan(0);
  });

  it("possui ambientes definidos", () => {
    expect(mapasModule.ambientes).toContain("cadastro");
    expect(mapasModule.ambientes).toContain("consultor");
  });

  it("possui design config habilitado", () => {
    expect(mapasModule.hasDesignConfig).toBe(true);
  });

  it("possui 7 rotas registradas", () => {
    expect(mapasModule.routes).toHaveLength(7);
  });
});
