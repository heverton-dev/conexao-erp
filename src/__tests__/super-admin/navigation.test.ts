import { describe, it, expect, beforeAll } from "vitest";
import { registerModule, registerNavItem } from "~/registry";
import { getNavItems } from "~/registry/nav-items";
import { createAllTruePermissions } from "~/__tests__/mocks/auth";

import { LayoutDashboard, Users } from "lucide-react";

describe("Super Admin - Navigation", () => {
  const allPerms = createAllTruePermissions();
  const noPerms: Record<string, boolean> = {};
  const nullPerms = null as Record<string, boolean> | null;

  beforeAll(() => {
    registerNavItem({
      id: "test-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/cadastros/dashboard",
      permissionCheck: (perms) => perms?.ver_todos_cadastros === true,
      order: 1,
      moduloKey: "cadastros",
    });
    registerNavItem({
      id: "test-solicitacoes",
      label: "Solicitações",
      icon: Users,
      to: "/cadastros/solicitacoes",
      permissionCheck: (perms) =>
        perms?.ver_todos_cadastros === true || perms?.gerar_links === true,
      order: 2,
      moduloKey: "cadastros",
    });
    registerNavItem({
      id: "test-relatorios",
      label: "Relatórios",
      icon: LayoutDashboard,
      to: "/cadastros/relatorios",
      permissionCheck: (perms) => perms?.ver_relatorios === true,
      order: 3,
      moduloKey: "cadastros",
    });
  });

  it("nav items filtered with all true perms return items", () => {
    const items = getNavItems(allPerms, "cadastros");
    expect(items.length).toBeGreaterThan(0);
  });

  it("nav items filtered with empty perms return zero", () => {
    const items = getNavItems(noPerms, "cadastros");
    expect(items).toHaveLength(0);
  });

  it("nav items filtered with null perms return zero", () => {
    const items = getNavItems(nullPerms, "cadastros");
    expect(items).toHaveLength(0);
  });

  it("cadastros module items are visible with super admin perms", () => {
    const items = getNavItems(allPerms, "cadastros");
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.permissionCheck(allPerms)).toBe(true);
    }
  });

  it("nav items are sorted by order", () => {
    const items = getNavItems(allPerms, "cadastros");
    for (let i = 1; i < items.length; i++) {
      expect(items[i].order).toBeGreaterThanOrEqual(items[i - 1].order);
    }
  });

  it("item with insufficient perms returns false from permissionCheck", () => {
    const items = getNavItems(allPerms, "cadastros");
    for (const item of items) {
      expect(item.permissionCheck(noPerms)).toBe(false);
    }
  });
});
