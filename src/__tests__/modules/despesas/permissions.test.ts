import { describe, it, expect } from "vitest";
import { DESPESAS_PERMISSIONS } from "~/features/despesas/permissions";

describe("Despesas - Permissions Definitions", () => {
  it("define pelo menos 8 permissoes", () => {
    expect(DESPESAS_PERMISSIONS.length).toBeGreaterThanOrEqual(8);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of DESPESAS_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes esperadas (lancar, aprovar, configurar)", () => {
    const keys = DESPESAS_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("despesas_lancar");
    expect(keys).toContain("despesas_aprovar");
    expect(keys).toContain("despesas_configurar");
  });
});
