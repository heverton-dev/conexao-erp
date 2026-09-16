import type { LucideIcon } from "lucide-react";

export type ModuleAba = {
  key: string;
  label: string;
  descricao?: string;
};

export type ModuleEvent = {
  key: string;
  label: string;
  descricao: string;
  type?: "status_change" | "button_action";
};

export type ModuleDefinition = {
  key: string;
  nome: string;
  descricao: string;
  icon: LucideIcon;
  routes: string[];
  ambientes: string[];
  abas: ModuleAba[];
  permissions: string[];
  events: ModuleEvent[];
  hasCredentialScopes?: boolean;
  hasLaboratorio?: boolean;
  hasFormulario?: boolean;
  hasCustomActions?: boolean;
  hasApiConnectors?: boolean;
  hasDesignConfig?: boolean; // módulo possui rota de design própria
  hasDiagnostico?: boolean; // módulo possui plano de diagnóstico
  designRoute?: string; // path da rota de design (ex: "/nps/design")
  setup?: () => void;
};

const glob =
  typeof window !== "undefined" ? (window as any) : (globalThis as any);
const moduleRegistry: Map<string, ModuleDefinition> =
  glob.__modules_registry || new Map<string, ModuleDefinition>();
glob.__modules_registry = moduleRegistry;

export function registerModule(mod: ModuleDefinition): void {
  if (moduleRegistry.has(mod.key)) return;
  moduleRegistry.set(mod.key, mod);
  mod.setup?.();
}

export function getModule(key: string): ModuleDefinition | undefined {
  return moduleRegistry.get(key);
}

export function getAllModules(): ModuleDefinition[] {
  return Array.from(moduleRegistry.values());
}

export function getModuleKeys(): string[] {
  return Array.from(moduleRegistry.keys());
}
