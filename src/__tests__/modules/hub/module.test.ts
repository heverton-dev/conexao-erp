import { describe, it, expect } from "vitest";
import { hubModule } from "~/features/hub/module";

describe("Hub - Module Registration", () => {
  it("tem key, nome, descricao, icon, routes e permissions", () => {
    expect(hubModule.key).toBe("hub");
    expect(hubModule.nome).toBeTruthy();
    expect(hubModule.descricao).toBeTruthy();
    expect(hubModule.routes?.length).toBeGreaterThanOrEqual(16);
    expect(hubModule.permissions?.length).toBeGreaterThanOrEqual(27);
  });

  it("esta disponivel nos ambientes cadastro, consultor e tecnologia", () => {
    expect(hubModule.ambientes).toContain("cadastro");
    expect(hubModule.ambientes).toContain("consultor");
    expect(hubModule.ambientes).toContain("tecnologia");
  });

  it("possui hasDesignConfig ativo", () => {
    expect(hubModule.hasDesignConfig).toBe(true);
  });
});
