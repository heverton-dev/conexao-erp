import { describe, it, expect } from "vitest";
import { FUNIS_PERMISSIONS } from "~/features/funis/permissions";

describe("Funis - Permissions Definitions", () => {
  it("define pelo menos 8 permissoes", () => {
    expect(FUNIS_PERMISSIONS.length).toBeGreaterThanOrEqual(8);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of FUNIS_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes esperadas (ver_dashboard, criar_funil, editar_funil, excluir_funil)", () => {
    const keys = FUNIS_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("funis_ver_dashboard");
    expect(keys).toContain("funis_criar_funil");
    expect(keys).toContain("funis_editar_funil");
    expect(keys).toContain("funis_excluir_funil");
  });
});
