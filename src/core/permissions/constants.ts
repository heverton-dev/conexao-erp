import {
  registerPermission,
  getAllPermissionDefs,
  getMergedDefaults,
} from "~/registry";
import type { PermissionDefinition } from "~/registry";
import type { Ambiente } from "./types";

export type PermGroup = { label: string; keys: string[] };

export function registerCorePermissions(): void {
  for (const p of getAllPermissionDefs()) {
    registerPermission({
      key: p.key,
      label: p.label,
      description: p.description,
      group: p.group,
    });
  }
}

export function getAllPermissions(): PermissionDefinition[] {
  return getAllPermissionDefs();
}

export function getPermGroups(): PermGroup[] {
  const defs = getAllPermissionDefs();
  const groupMap = new Map<string, string[]>();
  for (const p of defs) {
    const existing = groupMap.get(p.group) || [];
    existing.push(p.key);
    groupMap.set(p.group, existing);
  }
  return Array.from(groupMap.entries()).map(([label, keys]) => ({
    label,
    keys,
  }));
}

export function getPermLabel(key: string): string {
  const defs = getAllPermissionDefs();
  return defs.find((d) => d.key === key)?.label || key;
}

export function getPermDesc(key: string): string {
  const defs = getAllPermissionDefs();
  return defs.find((d) => d.key === key)?.description || "";
}

export function getPermissoesPadrao(
  ambiente: Ambiente,
): Record<string, boolean> {
  const defaults = getMergedDefaults(ambiente);
  if (Object.keys(defaults).length > 0) {
    return defaults;
  }
  const defs = getAllPermissionDefs();
  const result: Record<string, boolean> = {};
  for (const d of defs) {
    result[d.key] = true;
  }
  return result;
}
