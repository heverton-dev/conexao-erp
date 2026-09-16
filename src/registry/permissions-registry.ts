export type PermissionDefinition = {
  key: string;
  label: string;
  description: string;
  group: string;
};

const permissionsRegistry = new Map<string, PermissionDefinition>();

export function registerPermission(def: PermissionDefinition): void {
  if (permissionsRegistry.has(def.key)) return;
  permissionsRegistry.set(def.key, def);
}

export function getAllPermissionDefs(): PermissionDefinition[] {
  return Array.from(permissionsRegistry.values());
}

export function getAllPermissionKeys(): string[] {
  return Array.from(permissionsRegistry.keys());
}
