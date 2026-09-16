import type { DesignTokens, PresetKey } from "./types";
import { darkGoldPreset } from "./presets/dark-gold";
import { darkBluePreset } from "./presets/dark-blue";
import { lightCleanPreset } from "./presets/light-clean";
import { darkEmeraldPreset } from "./presets/dark-emerald";

export const PRESETS: Record<PresetKey, DesignTokens> = {
  "dark-gold": darkGoldPreset,
  "dark-blue": darkBluePreset,
  "light-clean": lightCleanPreset,
  "dark-emerald": darkEmeraldPreset,
};

export const DEFAULT_PRESET: PresetKey = "dark-gold";

/**
 * Deep merge — segundo objeto sobrescreve o primeiro apenas nos campos definidos
 */
function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base } as Record<string, unknown>;

  for (const key of Object.keys(override) as Array<keyof T>) {
    const val = override[key];
    if (val !== undefined && val !== null) {
      if (
        typeof val === "object" &&
        !Array.isArray(val) &&
        typeof base[key] === "object"
      ) {
        result[key as string] = deepMerge(
          base[key] as object,
          val as Partial<object>,
        );
      } else {
        result[key as string] = val;
      }
    }
  }

  return result as T;
}

export interface ResolveOptions {
  presetKey?: PresetKey | null;
  globalOverride?: Partial<DesignTokens> | null;
  empresaOverride?: Partial<DesignTokens> | null;
  moduloOverride?: Partial<DesignTokens> | null;
}

/**
 * Resolve tokens com precedência:
 * preset base → global override → empresa override → módulo override
 */
export function resolveTokens(opts: ResolveOptions = {}): DesignTokens {
  const { presetKey, globalOverride, empresaOverride, moduloOverride } = opts;

  let tokens = PRESETS[presetKey ?? DEFAULT_PRESET] ?? darkGoldPreset;

  if (globalOverride && Object.keys(globalOverride).length > 0) {
    tokens = deepMerge(tokens, globalOverride);
  }
  if (empresaOverride && Object.keys(empresaOverride).length > 0) {
    tokens = deepMerge(tokens, empresaOverride);
  }
  if (moduloOverride && Object.keys(moduloOverride).length > 0) {
    tokens = deepMerge(tokens, moduloOverride);
  }

  return tokens;
}
