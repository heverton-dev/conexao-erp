export { ImportClientesTrigger } from "./components/ImportClientesTrigger";
export { ImportClientesDialog } from "./components/ImportClientesDialog";
export { useImportClientes } from "./hooks/useImportClientes";
export { parseClienteCsv, generateClienteTemplate } from "./engine/parser";
export { validateClienteRows } from "./engine/validator";
export { importarClientesEmLote } from "./engine/executor";
export type { ClienteCsvRow, ClienteValidation, ClienteImportResult, ClienteImportProgress } from "./types";
