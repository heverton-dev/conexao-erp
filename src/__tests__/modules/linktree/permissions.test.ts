import { describe, it, expect } from "vitest";
import { LINKTREE_PERMISSIONS } from "~/features/linktree/permissions";

describe("LinkTree - Permissions Definitions", () => {
  it("define pelo menos 13 permissoes", () => {
    expect(LINKTREE_PERMISSIONS.length).toBeGreaterThanOrEqual(13);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of LINKTREE_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes de colaborador e empresa", () => {
    const keys = LINKTREE_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("lt_ver_dashboard");
    expect(keys).toContain("lt_criar_colaborador");
    expect(keys).toContain("lt_editar_colaborador");
    expect(keys).toContain("lt_excluir_colaborador");
    expect(keys).toContain("lt_empresa_ver");
    expect(keys).toContain("lt_empresa_editar");
  });

  it("possui grupos LinkTree e LinkTree Empresa", () => {
    const grupos = [...new Set(LINKTREE_PERMISSIONS.map((p) => p.group))];
    expect(grupos).toContain("LinkTree");
    expect(grupos).toContain("LinkTree Empresa");
  });
});
