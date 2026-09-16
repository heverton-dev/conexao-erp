import { type LucideIcon } from "lucide-react";

export type NavItemRegistration = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  permissionCheck: (perms: Record<string, boolean> | null) => boolean;
  order: number;
  moduloKey?: string;
  matchPaths?: string[];
  noChildMatch?: boolean;
  external?: boolean;
};

const glob =
  typeof window !== "undefined" ? (window as any) : (globalThis as any);
const items: Map<string, NavItemRegistration> =
  glob.__nav_items_registry || new Map<string, NavItemRegistration>();
glob.__nav_items_registry = items;

export function registerNavItem(item: NavItemRegistration): void {
  if (items.has(item.id)) {
    console.warn(`NavItem "${item.id}" j? registrado — ignorando duplicata`);
    return;
  }
  items.set(item.id, item);
}

export function getNavItems(
  perms: Record<string, boolean> | null,
  moduloKey?: string,
): NavItemRegistration[] {
  return Array.from(items.values())
    .filter((item) => {
      if (moduloKey === undefined) {
        return item.moduloKey === undefined;
      }
      return item.moduloKey === undefined || item.moduloKey === moduloKey;
    })
    .filter((item) => item.permissionCheck(perms))
    .sort((a, b) => a.order - b.order);
}

export function getNavItemsByModule(moduloKey: string): NavItemRegistration[] {
  return Array.from(items.values())
    .filter((item) => item.moduloKey === moduloKey)
    .sort((a, b) => a.order - b.order);
}
