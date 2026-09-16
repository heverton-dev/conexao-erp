export type {
  LogEntry,
  LogLevel,
  DiagnosticPlan,
  DiagnosticContext,
  DiagnosticStep,
  DiagnosticCrud,
  CrudOp,
  DiagnosticResult,
} from "./tipos";

export { CRUD_LABELS } from "./tipos";
export { DiagnosticRunner } from "./runner";
export {
  registrarPlanoDiagnostico,
  getPlanoDiagnostico,
  getAllPlanosDiagnostico,
} from "./registry";
