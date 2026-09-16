import { createContext } from "react";
import type { DesignTokens, PresetKey } from "../tokens/types";
import { darkGoldPreset } from "../tokens/presets/dark-gold";

export interface DesignSystemContextValue {
  tokens: DesignTokens;
  presetKey: PresetKey;
  isLoading: boolean;
}

export const DesignSystemContext = createContext<DesignSystemContextValue>({
  tokens: darkGoldPreset,
  presetKey: "dark-gold",
  isLoading: false,
});

export interface ModuleDesignContextValue {
  moduloKey: string;
  tokens: DesignTokens;
}

export const ModuleDesignContext = createContext<ModuleDesignContextValue>({
  moduloKey: "",
  tokens: darkGoldPreset,
});
