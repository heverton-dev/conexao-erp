import type { DiagnosticPlan } from "./tipos";

const planRegistry = new Map<string, DiagnosticPlan>();

export function registrarPlanoDiagnostico(plano: DiagnosticPlan) {
  if (planRegistry.has(plano.key)) return;
  planRegistry.set(plano.key, plano);
}

export function getPlanoDiagnostico(key: string): DiagnosticPlan | undefined {
  return planRegistry.get(key);
}

export function getAllPlanosDiagnostico(): DiagnosticPlan[] {
  return Array.from(planRegistry.values());
}
