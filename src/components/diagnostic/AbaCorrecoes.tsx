import { AlertTriangle, CheckCircle2, Wrench, FileWarning, ListOrdered, ExternalLink } from "lucide-react";
import type { LogEntry } from "~/core/diagnostic";

type Props = { logs: LogEntry[] };

const TIPO_ICON: Record<string, typeof AlertTriangle> = {
  erro: AlertTriangle, aviso: FileWarning, config: Wrench,
};
const TIPO_COLOR_BG: Record<string, string> = {
  erro: "bg-red-500/5", aviso: "bg-yellow-500/5", config: "bg-blue-500/5",
};
const TIPO_COLOR_BORDER: Record<string, string> = {
  erro: "border-red-500/30", aviso: "border-yellow-500/30", config: "border-blue-500/30",
};
const TIPO_BADGE: Record<string, string> = {
  erro: "bg-red-500/20 text-red-400", aviso: "bg-yellow-500/20 text-yellow-400",
  config: "bg-blue-500/20 text-blue-400",
};
const TIPO_HEADER_BG: Record<string, string> = {
  erro: "bg-red-500/10", aviso: "bg-yellow-500/10", config: "bg-blue-500/10",
};
const TIPO_DOT: Record<string, string> = {
  erro: "bg-red-500", aviso: "bg-yellow-500", config: "bg-blue-500",
};

export function AbaCorrecoes({ logs }: Props) {
  const errorsComCorrecoes = logs.filter(l => l.level === "error" && l.correcoes && l.correcoes.length > 0);
  const errorsSemCorrecoes = logs.filter(l => l.level === "error" && (!l.correcoes || l.correcoes.length === 0));

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
        <CheckCircle2 size={40} className="text-green-500/60" />
        <p className="mt-3 text-sm text-muted-foreground">Nenhum log ainda. Execute um diagnóstico primeiro.</p>
      </div>
    );
  }

  if (errorsComCorrecoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
        <CheckCircle2 size={40} className="text-green-500/60" />
        <p className="mt-3 text-sm font-medium text-foreground">Nenhum erro com correção</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {errorsSemCorrecoes.length > 0
            ? `${errorsSemCorrecoes.length} erro(s) sem correção automatizada`
            : "Todos os testes passaram ou nenhum erro foi detectado."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wrench size={14} />
        <span>{errorsComCorrecoes.length} erro(s) com correções sugeridas</span>
      </div>

      {errorsComCorrecoes.map((log) => (
        <div key={log.id} className={`rounded-xl border ${TIPO_COLOR_BORDER["erro"]} bg-card overflow-hidden`}>
          {/* Header: log message */}
          <div className={`flex items-start gap-3 px-4 py-3 ${TIPO_HEADER_BG["erro"]}`}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400 leading-snug">{log.message}</p>
              {log.duration !== undefined && (
                <p className="mt-0.5 text-xs text-muted-foreground">Duração: {log.duration}ms</p>
              )}
            </div>
          </div>

          {/* Correction cards */}
          <div className="divide-y divide-border/50">
            {log.correcoes!.map((corr, i) => (
              <div key={i} className={`${TIPO_COLOR_BG[corr.tipo] ?? ""}`}>
                {/* Badge + título */}
                <div className="flex items-start gap-3 px-4 pt-4 pb-2">
                  <div className="mt-1 shrink-0">
                    {(() => { const Icon = TIPO_ICON[corr.tipo] ?? AlertTriangle; return <Icon size={16} className="text-muted-foreground" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${TIPO_BADGE[corr.tipo] ?? ""}`}>
                        {corr.tipo}
                      </span>
                      {corr.tabela && (
                        <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                          {corr.tabela}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground leading-snug">{corr.titulo}</h4>
                  </div>
                </div>

                {/* Descrição + Causa */}
                <div className="space-y-2 px-4 pb-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">O que aconteceu</p>
                    <p className="text-sm text-foreground/90">{corr.descricao}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Por que aconteceu</p>
                    <p className="text-sm text-foreground/80">{corr.causa}</p>
                  </div>
                </div>

                {/* Passo a passo */}
                {corr.passos.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ListOrdered size={13} className="text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Como corrigir
                      </p>
                    </div>
                    <ol className="space-y-1.5">
                      {corr.passos.map((passo, pi) => (
                        <li key={pi} className="flex gap-2 text-sm">
                          <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${TIPO_DOT[corr.tipo] ?? "bg-muted-foreground"}`}>
                            <span className="text-[10px] font-bold text-white">{pi + 1}</span>
                          </span>
                          <span className="text-foreground/80 leading-snug">{passo}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Onde */}
                {corr.onde && (
                  <div className="flex items-start gap-2 border-t border-border/40 px-4 py-2.5">
                    <ExternalLink size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground leading-snug">
                      <span className="font-medium">Onde executar:</span> {corr.onde}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {errorsSemCorrecoes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileWarning size={14} />
            <span>{errorsSemCorrecoes.length} erro(s) sem correção automatizada</span>
          </div>
          <div className="mt-2 space-y-1">
            {errorsSemCorrecoes.map((log) => (
              <p key={log.id} className="text-xs text-muted-foreground font-mono">
                {log.timestamp.slice(11, 19)} — {log.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
