import { Play, Loader2, Zap } from "lucide-react";
import type { DiagnosticPlan, DiagnosticStep, LogEntry } from "~/core/diagnostic";
import { LogTerminal } from "./LogTerminal";

type Props = {
  plano: DiagnosticPlan;
  logs: LogEntry[];
  executando: boolean;
  acaoExecutando: string | null;
  onExecutarAcao: (acao: DiagnosticStep) => void;
  onLimpar: () => void;
};

export function AbaAcoes({ plano, logs, executando, acaoExecutando, onExecutarAcao, onLimpar }: Props) {
  if (plano.acoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
        <Zap size={40} className="text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">
          Nenhuma ação de negócio configurada para este módulo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {plano.acoes.map((acao) => (
          <div
            key={acao.key}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Zap size={18} className="text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{acao.label}</h4>
                {acao.descricao && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {acao.descricao}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onExecutarAcao(acao)}
              disabled={executando}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {executando && acaoExecutando === acao.key ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Executar
            </button>
          </div>
        ))}
      </div>

      <LogTerminal logs={logs} executando={executando} onLimpar={onLimpar} />
    </div>
  );
}
