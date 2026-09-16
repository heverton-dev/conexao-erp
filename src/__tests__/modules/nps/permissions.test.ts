import { describe, it, expect } from "vitest";
import { NPS_PERMISSIONS } from "~/features/nps/permissions";

describe("NPS - Permissions Definitions", () => {
  it("define pelo menos 7 permissoes", () => {
    expect(NPS_PERMISSIONS.length).toBeGreaterThanOrEqual(7);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of NPS_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes esperadas", () => {
    const keys = NPS_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("nps_ver_dashboard");
    expect(keys).toContain("nps_gerenciar_perguntas");
    expect(keys).toContain("nps_excluir_respostas");
    expect(keys).toContain("nps_exportar_dados");
  });
});
