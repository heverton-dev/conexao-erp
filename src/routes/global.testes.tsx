import { createRoute } from "@tanstack/react-router";
import { authLayout } from "./_auth";
import { useAuth } from "~/lib/auth";
import { useState, useCallback, useRef } from "react";
import { RequireSuperAdmin } from "~/components/guards";
import {
  Shield,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
  Puzzle,
  Cable,
  Component,
  Accessibility,
  Network,
  Pause,
  Square,
  Terminal,
  X,
} from "lucide-react";
import {
  TEST_CATEGORIES,
  type TestCategory,
  type TestResult,
} from "~/lib/test-runner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

export const adminSuperTestesRoute = createRoute({
  getParentRoute: () => authLayout,
  path: "/global/testes",
  component: () => (
    <RequireSuperAdmin>
      <AdminSuperTestes />
    </RequireSuperAdmin>
  ),
});

type CategoryStatus = {
  status: "idle" | "running" | "paused" | "done";
  result: TestResult | null;
  rawOutput: string;
};

function AdminSuperTestes() {
  const { profile } = useAuth();

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

  return <TestRunnerPage />;
}

function TestRunnerPage() {
  const [categoryStates, setCategoryStates] = useState<
    Record<string, CategoryStatus>
  >({});
  const [expandedResults, setExpandedResults] = useState<
    Record<string, boolean>
  >({});
  const [globalRunning, setGlobalRunning] = useState(false);
  const [logsModal, setLogsModal] = useState<{
    open: boolean;
    category: TestCategory | null;
  }>({
    open: false,
    category: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(false);

  const setCatState = useCallback(
    (id: string, state: Partial<CategoryStatus>) => {
      setCategoryStates((prev) => ({
        ...prev,
        [id]: {
          status: prev[id]?.status || "idle",
          result: prev[id]?.result || null,
          rawOutput: prev[id]?.rawOutput || "",
          ...state,
        },
      }));
    },
    [],
  );

  async function runCategory(category: TestCategory, signal?: AbortSignal) {
    setCatState(category.id, { status: "running" });
    try {
      const res = await fetch("/api/testes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testFiles: category.testFiles }),
        signal: signal || AbortSignal.timeout(30000),
      });
      const raw = await res.json();
      const parsed = parseVitestOutput(raw.output);
      setCatState(category.id, {
        status: "done",
        result: parsed,
        rawOutput: raw.output,
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        setCatState(category.id, { status: "paused" });
        return;
      }
      setCatState(category.id, {
        status: "done",
        result: {
          success: false,
          numPassedTests: 0,
          numFailedTests: 0,
          numTotalTests: 0,
          testResults: [],
          output: `Erro: ${err.message}`,
        },
        rawOutput: `Erro: ${err.message}`,
      });
    }
  }

  async function runAll() {
    setGlobalRunning(true);
    pausedRef.current = false;
    const controller = new AbortController();
    abortRef.current = controller;

    for (const cat of TEST_CATEGORIES) {
      if (pausedRef.current) break;
      await runCategory(cat, controller.signal);
    }

    setGlobalRunning(false);
    abortRef.current = null;
  }

  function pauseAll() {
    pausedRef.current = true;
    abortRef.current?.abort();
    setGlobalRunning(false);
  }

  function clearResults() {
    setCategoryStates({});
    setExpandedResults({});
  }

  function openLogs(category: TestCategory) {
    setLogsModal({ open: true, category });
  }

  const currentState = logsModal.category
    ? categoryStates[logsModal.category.id]
    : null;

  return (
    <div className="min-h-dvh bg-background p-6">
      <PageHeader
        onRunAll={runAll}
        onPause={pauseAll}
        onClear={clearResults}
        globalRunning={globalRunning}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TEST_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            state={
              categoryStates[cat.id] || {
                status: "idle",
                result: null,
                rawOutput: "",
              }
            }
            onRun={() => runCategory(cat)}
            expanded={!!expandedResults[cat.id]}
            onToggleExpand={() =>
              setExpandedResults((prev) => ({
                ...prev,
                [cat.id]: !prev[cat.id],
              }))
            }
            onViewLogs={() => openLogs(cat)}
          />
        ))}
      </div>

      <LogsModal
        open={logsModal.open}
        onClose={() => setLogsModal({ open: false, category: null })}
        category={logsModal.category}
        rawOutput={currentState?.rawOutput || ""}
        result={currentState?.result || null}
      />
    </div>
  );
}

function PageHeader({
  onRunAll,
  onPause,
  onClear,
  globalRunning,
}: {
  onRunAll: () => void;
  onPause: () => void;
  onClear: () => void;
  globalRunning: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Central de Testes
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Testes unitários e de integração do ERP Odonto
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClear}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
        >
          <RotateCcw size={16} />
          Limpar
        </button>
        {globalRunning ? (
          <button
            onClick={onPause}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-500/20"
          >
            <Pause size={16} />
            Pausar
          </button>
        ) : (
          <button
            onClick={onRunAll}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
          >
            <Play size={16} />
            Executar Todos
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  state,
  onRun,
  expanded,
  onToggleExpand,
  onViewLogs,
}: {
  category: TestCategory;
  state: CategoryStatus;
  onRun: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewLogs: () => void;
}) {
  const Icon = getIcon(category.icon);
  const result = state.result;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-accent/10 p-2">
            <Icon size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{category.label}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {category.description}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {category.testFiles.length} arquivo(s) de teste
            </p>
          </div>
        </div>
        <StatusBadge state={state.status} result={result} />
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <button
          onClick={onRun}
          disabled={state.status === "running"}
          className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === "running" ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Play size={13} />
          )}
          {state.status === "running"
            ? "Executando..."
            : state.status === "paused"
              ? "Pausado"
              : "Executar"}
        </button>

        {result && (
          <>
            <span className="ml-auto text-xs text-muted-foreground">
              <span className="font-medium text-green-600">
                {result.numPassedTests}
              </span>
              /{result.numTotalTests} passaram
            </span>
            <button
              onClick={onViewLogs}
              className="ml-1 flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              title="Ver logs"
            >
              <Terminal size={13} />
              Logs
            </button>
            <button
              onClick={onToggleExpand}
              className="ml-1 flex cursor-pointer items-center text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              Detalhes
            </button>
          </>
        )}
      </div>

      {expanded && result && (
        <div className="border-t border-border p-4">
          {result.testResults.length > 0 ? (
            <ul className="space-y-2">
              {result.testResults.map((tr) => (
                <FileResult key={tr.name} result={tr} />
              ))}
            </ul>
          ) : (
            <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {result.output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function FileResult({ result }: { result: TestResult["testResults"][0] }) {
  const fileName = result.name.split("/").pop() || result.name;
  return (
    <li className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2">
        {result.status === "passed" ? (
          <CheckCircle2 size={14} className="text-green-600" />
        ) : (
          <XCircle size={14} className="text-red-600" />
        )}
        <span className="flex-1 text-sm font-medium text-foreground">
          {fileName}
        </span>
        <span className="text-xs text-muted-foreground">
          {result.duration}ms
        </span>
      </div>
      {result.status === "failed" && (
        <div className="mt-2 space-y-1">
          {result.failureMessage?.map((msg, i) => (
            <p key={i} className="text-xs text-red-600">
              {msg}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

function StatusBadge({
  state,
  result,
}: {
  state: string;
  result: TestResult | null;
}) {
  if (state === "running") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <Loader2 size={12} className="animate-spin" />
        Rodando
      </span>
    );
  }
  if (state === "paused") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
        <Pause size={12} />
        Pausado
      </span>
    );
  }
  if (state === "done" && result) {
    if (result.success) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle2 size={12} />
          OK
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        <XCircle size={12} />
        {result.numFailedTests} falha(s)
      </span>
    );
  }
  return null;
}

function LogsModal({
  open,
  onClose,
  category,
  rawOutput,
  result,
}: {
  open: boolean;
  onClose: () => void;
  category: TestCategory | null;
  rawOutput: string;
  result: TestResult | null;
}) {
  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Logs — {category.label}</DialogTitle>
              <DialogDescription>Saída completa dos testes executados</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 space-y-4">
          {result && (
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-600" />
                <span className="text-muted-foreground">Passaram:</span>
                <span className="font-medium text-foreground">
                  {result.numPassedTests}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={14} className="text-red-600" />
                <span className="text-muted-foreground">Falharam:</span>
                <span className="font-medium text-foreground">
                  {result.numFailedTests}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium text-foreground">
                  {result.numTotalTests}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {result.success ? (
                  <CheckCircle2 size={14} className="text-green-600" />
                ) : (
                  <XCircle size={14} className="text-red-600" />
                )}
                <span className="font-medium text-foreground">
                  {result.success ? "Sucesso" : "Falhou"}
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted">
            <pre className="h-full max-h-[60vh] overflow-auto p-4 text-xs text-foreground font-mono whitespace-pre-wrap break-words">
              {rawOutput || "Nenhum log disponível. Execute os testes primeiro."}
            </pre>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-border/50 flex justify-end">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px] cursor-pointer items-center justify-center gap-2"
          >
            <X size={14} />
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getIcon(name: string) {
  const icons: Record<string, React.ComponentType<any>> = {
    Shield,
    Puzzle,
    Cable,
    Component,
    Accessibility,
    Network,
  };
  return icons[name] || Shield;
}

function parseVitestOutput(raw: string): TestResult {
  try {
    const json = JSON.parse(raw);
    return {
      success: json.numFailedTests === 0,
      numPassedTests: json.numPassedTests || 0,
      numFailedTests: json.numFailedTests || 0,
      numTotalTests: json.numTotalTests || 0,
      testResults: (json.testResults || []).map((suite: any) => ({
        name: suite.name,
        status: suite.status === "passed" ? "passed" : "failed",
        duration: suite.duration || 0,
        failureMessage:
          suite.assertionResults
            ?.filter((a: any) => a.status === "failed")
            .map((a: any) => a.failureMessages?.[0] || a.fullName || a.title)
            .filter(Boolean) || [],
      })),
      output: raw,
    };
  } catch {
    return {
      success: false,
      numPassedTests: 0,
      numFailedTests: 0,
      numTotalTests: 0,
      testResults: [],
      output: raw,
    };
  }
}
