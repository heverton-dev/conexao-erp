import { useState, useCallback, useRef } from "react";
import { useAuth } from "~/lib/auth";
import { useEmpresaSuperAdmin } from "~/components/shared/useEmpresaSuperAdmin";
import {
  Shield,
  Bug,
  ChevronDown,
} from "lucide-react";
import {
  getPlanoDiagnostico,
  getAllPlanosDiagnostico,
  DiagnosticRunner,
  type CrudOp,
  type DiagnosticStep,
  type LogEntry,
  type DiagnosticResult,
} from "~/core/diagnostic";
import { AbaCrud } from "./AbaCrud";
import { AbaAcoes } from "./AbaAcoes";
import { AbaHistorico, saveHistory } from "./AbaHistorico";
import { AbaCorrecoes } from "./AbaCorrecoes";

type Aba = "crud" | "acoes" | "correcoes" | "historico";

export function DiagnosticPage() {
  const { profile } = useAuth();
  const { empresaId, empresas, empresaSelecionada, setEmpresaSelecionada } =
    useEmpresaSuperAdmin();

  const todosPlanos = getAllPlanosDiagnostico();
  const [moduloKey, setModuloKey] = useState<string>(
    todosPlanos[0]?.key ?? "",
  );
  const [aba, setAba] = useState<Aba>("crud");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [executando, setExecutando] = useState(false);
  const [acaoExecutando, setAcaoExecutando] = useState<string | null>(null);
  const sessionIds = useRef<Record<string, string | undefined>>({});

  const plano = getPlanoDiagnostico(moduloKey);

  if (!profile?.is_super_admin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-8">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            Acesso restrito
          </h2>
          <p className="text-muted-foreground mt-2">
            Apenas Super Administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (todosPlanos.length === 0) {
    return (
      <div className="min-h-dvh bg-background p-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-24">
          <Bug size={48} className="text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Nenhum módulo com diagnóstico
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum módulo possui plano de diagnóstico configurado ainda.
          </p>
        </div>
      </div>
    );
  }

  const usuarioId = profile.id;

  const handleResult = useCallback(
    (result: DiagnosticResult) => {
      sessionIds.current = { ...sessionIds.current, ...result.idsCriados };
      saveHistory(plano!.key, plano!.nome, result);
    },
    [plano],
  );

  const executarCrudCompleto = useCallback(() => {
    if (!plano || executando) return;
    setExecutando(true);
    setLogs([]);
    sessionIds.current = {};

    const runner = new DiagnosticRunner({ onLog: (e) => setLogs((p) => [...p, e]) });
    runner.executarCrudCompleto(plano, empresaId, usuarioId)
      .then(handleResult)
      .catch((err) => setLogs((p) => [...p, { id: crypto.randomUUID?.() ?? "", timestamp: new Date().toISOString(), level: "error", message: err.message }]))
      .finally(() => setExecutando(false));
  }, [plano, executando, empresaId, usuarioId, handleResult]);

  const executarCrudOp = useCallback(
    (op: CrudOp) => {
      if (!plano || executando) return;
      setExecutando(true);
      setLogs([]);

      const runner = new DiagnosticRunner({ onLog: (e) => setLogs((p) => [...p, e]) });
      runner.executarCrudOp(plano, op, empresaId, usuarioId, sessionIds.current)
        .then(handleResult)
        .catch((err) => setLogs((p) => [...p, { id: crypto.randomUUID?.() ?? "", timestamp: new Date().toISOString(), level: "error", message: err.message }]))
        .finally(() => setExecutando(false));
    },
    [plano, executando, empresaId, usuarioId, handleResult],
  );

  const executarAcao = useCallback(
    (acao: DiagnosticStep) => {
      if (!plano || executando) return;
      setExecutando(true);
      setAcaoExecutando(acao.key);
      setLogs([]);
      sessionIds.current = {};

      const runner = new DiagnosticRunner({ onLog: (e) => setLogs((p) => [...p, e]) });
      runner.executarAcao(plano, acao.key, empresaId, usuarioId)
        .then(handleResult)
        .catch((err) => setLogs((p) => [...p, { id: crypto.randomUUID?.() ?? "", timestamp: new Date().toISOString(), level: "error", message: err.message }]))
        .finally(() => { setExecutando(false); setAcaoExecutando(null); });
    },
    [plano, executando, empresaId, usuarioId, handleResult],
  );

  const limparLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const abas: { key: Aba; label: string; badge?: number }[] = [
    { key: "crud", label: "CRUD" },
    { key: "acoes", label: "Ações" },
    { key: "correcoes", label: "Correções", badge: logs.filter(l => l.level === "error" && l.correcoes && l.correcoes.length > 0).length },
    { key: "historico", label: "Histórico" },
  ];

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          🔬 Diagnóstico de Módulos
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Execute testes controlados e visualize o encadeamento de ações no backend
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <select
            value={moduloKey}
            onChange={(e) => { setModuloKey(e.target.value); setLogs([]); sessionIds.current = {}; }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 pr-8 text-sm text-foreground appearance-none"
          >
            {todosPlanos.map((p) => (
              <option key={p.key} value={p.key}>{p.nome}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        {empresas.length > 1 && (
          <div className="relative">
            <select
              value={empresaSelecionada}
              onChange={(e) => setEmpresaSelecionada(e.target.value)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 pr-8 text-sm text-foreground appearance-none"
            >
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-1 rounded-lg border border-border bg-card p-1">
        {abas.map((a) => (
          <button
            key={a.key}
            onClick={() => setAba(a.key)}
            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              aba === a.key
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {a.label}
            {a.badge !== undefined && a.badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[10px] font-bold text-red-400">
                {a.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {!plano ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card py-16">
            <p className="text-sm text-muted-foreground">Nenhum plano de diagnóstico para este módulo.</p>
          </div>
        ) : aba === "crud" ? (
          <AbaCrud
            plano={plano}
            logs={logs}
            executando={executando}
            onExecutarCrudCompleto={executarCrudCompleto}
            onExecutarCrudOp={executarCrudOp}
            onLimpar={limparLogs}
          />
        ) : aba === "acoes" ? (
          <AbaAcoes
            plano={plano}
            logs={logs}
            executando={executando}
            acaoExecutando={acaoExecutando}
            onExecutarAcao={executarAcao}
            onLimpar={limparLogs}
          />
        ) : aba === "correcoes" ? (
          <AbaCorrecoes logs={logs} />
        ) : (
          <AbaHistorico moduloKey={moduloKey} />
        )}
      </div>
    </div>
  );
}
