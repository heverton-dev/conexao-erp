import { describe, it, expect } from "vitest";
import { crmModule } from "~/features/crm/module";

describe("CRM Registration", () => {
  it("tem key, nome, descricao, icon, routes e permissions", () => {
    expect(crmModule.key).toBe("crm");
    expect(crmModule.nome).toBe("CRM");
    expect(crmModule.descricao).toBeTruthy();
    expect(crmModule.icon).toBeTruthy();
    expect(crmModule.routes?.length).toBeGreaterThanOrEqual(12);
    expect(crmModule.permissions?.length).toBeGreaterThanOrEqual(10);
  });

  it("possui ambientes definidos (cadastro, consultor, tecnologia)", () => {
    expect(crmModule.ambientes).toContain("cadastro");
    expect(crmModule.ambientes).toContain("consultor");
    expect(crmModule.ambientes).toContain("tecnologia");
  });

  it("possui hasDesignConfig true", () => {
    expect(crmModule.hasDesignConfig).toBe(true);
  });

  it("rota inicial e /crm/dashboard", () => {
    expect(crmModule.routes).toContain("/crm/dashboard");
  });
});
