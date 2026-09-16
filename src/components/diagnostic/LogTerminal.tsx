import { useRef, useEffect, useState } from "react";
import { RotateCcw, Terminal, ChevronDown, ChevronRight } from "lucide-react";
import type { LogEntry } from "~/core/diagnostic";

const LEVEL_COLORS: Record<string, string> = {
  info: "text-blue-400",
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  sql: "text-purple-400",
  event: "text-cyan-400",
};

const LEVEL_ICONS: Record<string, string> = {
  info: "●",
  success: "✓",
  error: "✗",
  warning: "⚠",
  sql: "▶",
  event: "◆",
};

type Props = {
  logs: LogEntry[];
  executando: boolean;
  onLimpar: () => void;
};

export function LogTerminal({ logs, executando, onLimpar }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logs]);

  const toggleDetails = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Terminal size={14} />
          <span>Logs</span>
          {executando && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              Executando...
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            ({logs.length} linhas)
          </span>
        </div>
        <button
          onClick={onLimpar}
          className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw size={12} />
          Limpar
        </button>
      </div>

      <div
        ref={ref}
        className="max-h-[65vh] min-h-[300px] overflow-auto p-4 font-mono text-xs leading-relaxed"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">
            Nenhum log ainda. Execute um diagnóstico para ver os resultados.
          </p>
        ) : (
          logs.map((log) => {
            const isExpanded = expanded.has(log.id);
            return (
              <div key={log.id} className="group">
                <div className="flex gap-3 py-0.5 hover:bg-white/5">
                  <span className="w-20 shrink-0 text-gray-500">
                    {log.timestamp.slice(11, 19)}
                  </span>
                  <span className={`w-4 shrink-0 ${LEVEL_COLORS[log.level] ?? "text-gray-400"}`}>
                    {LEVEL_ICONS[log.level] ?? "·"}
                  </span>
                  <span className={`flex-1 ${LEVEL_COLORS[log.level] ?? "text-gray-300"}`}>
                    {log.message}
                    {log.duration !== undefined && (
                      <span className="ml-2 text-gray-500">
                        ({log.duration}ms)
                      </span>
                    )}
                    {log.details && (
                      <button
                        onClick={() => toggleDetails(log.id)}
                        className="ml-1.5 inline-flex cursor-pointer items-center gap-0.5 rounded px-1 py-0.5 text-[10px] text-gray-500 hover:bg-white/10 hover:text-gray-300"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        detalhes
                      </button>
                    )}
                  </span>
                </div>
                {log.details && isExpanded && (
                  <div className="ml-[104px] mb-1 mt-0.5 whitespace-pre-wrap rounded border border-gray-800 bg-white/5 p-2 text-gray-400">
                    {log.details}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
