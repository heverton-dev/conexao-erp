import { describe, it, expect } from "vitest";
import { MAPAS_PERMISSIONS } from "~/features/mapas/permissions";

describe("Mapas - Permissions Definitions", () => {
  it("define pelo menos 5 permissoes", () => {
    expect(MAPAS_PERMISSIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of MAPAS_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes esperadas", () => {
    const keys = MAPAS_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("mapas_ver_mapa_publico");
    expect(keys).toContain("mapas_gerir_distribuidores");
    expect(keys).toContain("mapas_gerir_consultores");
    expect(keys).toContain("mapas_ver_insights");
    expect(keys).toContain("mapas_gerir_webhooks");
  });
});
