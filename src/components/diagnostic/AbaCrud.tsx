import { Play, Loader2, Database } from "lucide-react";
import type { DiagnosticPlan, CrudOp, LogEntry } from "~/core/diagnostic";
import { CRUD_LABELS } from "~/core/diagnostic";
import { LogTerminal } from "./LogTerminal";

const CRUD_OPS: CrudOp[] = ["create", "read", "update", "delete"];

type Props = {
  plano: DiagnosticPlan;
  logs: LogEntry[];
  executando: boolean;
  onExecutarCrudCompleto: () => void;
  onExecutarCrudOp: (op: CrudOp) => void;
  onLimpar: () => void;
};

export function AbaCrud({ plano, logs, executando, onExecutarCrudCompleto, onExecutarCrudOp, onLimpar }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-accent/10 p-2">
            <Database size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Testes CRUD</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Execute operações individuais ou o ciclo completo no módulo{' '}
              <strong>{plano.nome}</strong>. As operações compartilham o mesmo
              ID de registro dentro da sessão.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CRUD_OPS.map((op) => (
            <button
              key={op}
              onClick={() => onExecutarCrudOp(op)}
              disabled={executando}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play size={13} />
              {CRUD_LABELS[op]}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={onExecutarCrudCompleto}
              disabled={executando}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {executando ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {executando ? "Executando..." : "CRUD Completo"}
            </button>
          </div>
        </div>
      </div>

      <LogTerminal logs={logs} executando={executando} onLimpar={onLimpar} />
    </div>
  );
}
