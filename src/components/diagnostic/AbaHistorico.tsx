import { useState, useCallback } from "react";
import { History, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { DiagnosticResult } from "~/core/diagnostic";

const HISTORY_KEY = "diagnostic_history";

type HistoryItem = {
  id: string;
  moduloKey: string;
  moduloNome: string;
  timestamp: string;
  result: DiagnosticResult;
};

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(
  moduloKey: string,
  moduloNome: string,
  result: DiagnosticResult,
) {
  const history = loadHistory();
  history.unshift({
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    moduloKey,
    moduloNome,
    timestamp: new Date().toISOString(),
    result,
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

type Props = {
  moduloKey: string;
};

export function AbaHistorico({ moduloKey }: Props) {
  const [refresh, setRefresh] = useState(0);
  const history = loadHistory().filter((h) => h.moduloKey === moduloKey);

  const handleClear = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setRefresh((p) => p + 1);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {history.length} execuções anteriores
        </p>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
          >
            Limpar histórico
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
          <History size={40} className="text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum histórico de execuções.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    item.result.success
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                  }`}
                >
                  {item.result.success ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.result.success ? "Sucesso" : "Falha"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.result.passedSteps} OK, {item.result.failedSteps}{" "}
                    falha(s) — {item.result.totalDuration}ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                {new Date(item.timestamp).toLocaleString("pt-BR")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
