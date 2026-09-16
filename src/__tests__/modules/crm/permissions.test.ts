import { describe, it, expect } from "vitest";
import { CRM_PERMISSIONS } from "~/features/crm/permissions";

describe("CRM - Permissions Definitions", () => {
  it("define pelo menos 10 permissoes", () => {
    expect(CRM_PERMISSIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("cada permissao tem key, label, description e group", () => {
    for (const p of CRM_PERMISSIONS) {
      expect(p.key).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.group).toBeTruthy();
    }
  });

  it("inclui permissoes esperadas (dashboard, carteira, pipeline, tarefas, cliente_detalhe)", () => {
    const keys = CRM_PERMISSIONS.map((p) => p.key);
    expect(keys).toContain("crm_dashboard");
    expect(keys).toContain("crm_carteira");
    expect(keys).toContain("crm_pipeline");
    expect(keys).toContain("crm_tarefas");
    expect(keys).toContain("crm_cliente_detalhe");
  });
});
