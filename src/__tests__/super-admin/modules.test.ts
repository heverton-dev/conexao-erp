import { describe, it, expect, beforeAll } from "vitest";
import { registerModule, getAllModules, getModule } from "~/registry/modules";
import { getAllPermissionDefs } from "~/registry/permissions-registry";

// Import module definitions to call registerModule on each
import { cadastrosModule } from "~/features/cadastros/module";
import { crmModule } from "~/features/crm/module";
import { despesasModule } from "~/features/despesas/module";
import { funisModule } from "~/features/funis/module";
import { hubModule } from "~/features/hub/module";
import { linktreeModule } from "~/features/linktree/module";
import { mapasModule } from "~/features/mapas/module";
import { npsModule } from "~/features/nps/module";
import { rotasModule } from "~/features/rotas/module";
import { empresasModule } from "~/features/empresas/module";

describe("Super Admin - Module Registry", () => {
  beforeAll(() => {
    registerModule(empresasModule);
    registerModule(cadastrosModule);
    registerModule(mapasModule);
    registerModule(npsModule);
    registerModule(funisModule);
    registerModule(linktreeModule);
    registerModule(hubModule);
    registerModule(crmModule);
    registerModule(despesasModule);
    registerModule(rotasModule);
  });

  it("getAllModules retorna pelo menos 9 módulos registrados", () => {
    const modules = getAllModules();
    expect(modules.length).toBeGreaterThanOrEqual(9);
  });

  it("cada módulo tem key, nome, descricao, icon, routes e permissions", () => {
    for (const mod of getAllModules()) {
      expect(mod.key).toBeTruthy();
      expect(mod.nome).toBeTruthy();
      expect(mod.descricao).toBeTruthy();
      expect(mod.routes).toBeInstanceOf(Array);
      expect(mod.permissions).toBeInstanceOf(Array);
    }
  });

  it("cadastros module está registrado com todas as configurações", () => {
    const mod = getModule("cadastros");
    expect(mod).toBeDefined();
    expect(mod!.permissions.length).toBeGreaterThanOrEqual(17);
    expect(mod!.ambientes).toContain("cadastro");
    expect(mod!.hasFormulario).toBe(true);
    expect(mod!.hasDesignConfig).toBe(true);
  });

  it("crm module está registrado", () => {
    const mod = getModule("crm");
    expect(mod).toBeDefined();
    expect(mod!.permissions.length).toBeGreaterThanOrEqual(10);
  });

  it("despesas module está registrado", () => {
    const mod = getModule("despesas");
    expect(mod).toBeDefined();
    expect(mod!.permissions.length).toBeGreaterThanOrEqual(8);
  });

  it("setup registra permissions no registry", () => {
    cadastrosModule.setup?.();
    const defs = getAllPermissionDefs();
    expect(defs.length).toBeGreaterThan(0);
  });
});
