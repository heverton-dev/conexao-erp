type PermissionDefaults = Record<string, Record<string, boolean>>;

const defaultsRegistry = new Map<string, PermissionDefaults>();

export function registerPermissionDefaults(
  moduleKey: string,
  defaults: PermissionDefaults,
): void {
  defaultsRegistry.set(moduleKey, defaults);
}

export function getMergedDefaults(ambiente: string): Record<string, boolean> {
  const merged: Record<string, boolean> = {};
  for (const [, moduleDefaults] of defaultsRegistry) {
    if (moduleDefaults[ambiente]) {
      Object.assign(merged, moduleDefaults[ambiente]);
    }
  }
  return merged;
}
