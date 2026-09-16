import { describe, it, expect } from "vitest";
import { ROTAS_PERMISSIONS } from "~/features/rotas/permissions";

describe("Rotas - Permissions Definitions", () => {
  it("define pelo menos 6 permissoes", () => {
    expect(ROTAS_PERMISSIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of ROTAS_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes esperadas", () => {
    const keys = ROTAS_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("rotas_planejar");
    expect(keys).toContain("rotas_executar");
    expect(keys).toContain("rotas_configurar");
    expect(keys).toContain("rotas_upload_base");
    expect(keys).toContain("rotas_ver_relatorios");
    expect(keys).toContain("rotas_form_config");
  });
});
