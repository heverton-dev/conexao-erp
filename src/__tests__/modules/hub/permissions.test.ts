import { describe, it, expect } from "vitest";
import { HUB_PERMISSIONS } from "~/features/hub/permissions";

describe("Hub - Permissions Definitions", () => {
  it("define pelo menos 27 permissoes", () => {
    expect(HUB_PERMISSIONS.length).toBeGreaterThanOrEqual(27);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of HUB_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes de materiais, trilhas, ranking, usuarios e analytics", () => {
    const keys = HUB_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("hub_ver_materiais");
    expect(keys).toContain("hub_criar_material");
    expect(keys).toContain("hub_ver_trilhas");
    expect(keys).toContain("hub_ver_ranking");
    expect(keys).toContain("hub_ver_usuarios");
    expect(keys).toContain("hub_ver_analytics");
  });

  it("possui 5 grupos diferentes", () => {
    const grupos = [...new Set(HUB_PERMISSIONS.map((p) => p.group))];
    expect(grupos).toContain("Hub - Materiais");
    expect(grupos).toContain("Hub - Trilhas");
    expect(grupos).toContain("Hub - Gamificação");
    expect(grupos).toContain("Hub - Usuários");
    expect(grupos).toContain("Hub - Admin");
  });
});
