import { describe, it, expect } from "vitest";
import { linktreeModule } from "~/features/linktree/module";

describe("LinkTree - Module Registration", () => {
  it("tem key, nome, descricao, icon, routes e permissions", () => {
    expect(linktreeModule.key).toBe("linktree");
    expect(linktreeModule.nome).toBeTruthy();
    expect(linktreeModule.descricao).toBeTruthy();
    expect(linktreeModule.routes?.length).toBeGreaterThanOrEqual(3);
    expect(linktreeModule.permissions?.length).toBeGreaterThanOrEqual(13);
  });

  it("esta disponivel nos ambientes cadastro, consultor e tecnologia", () => {
    expect(linktreeModule.ambientes).toContain("cadastro");
    expect(linktreeModule.ambientes).toContain("consultor");
    expect(linktreeModule.ambientes).toContain("tecnologia");
  });

  it("possui hasDesignConfig ativo", () => {
    expect(linktreeModule.hasDesignConfig).toBe(true);
  });
});
