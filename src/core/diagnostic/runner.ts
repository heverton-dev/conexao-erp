import type {
  DiagnosticPlan, DiagnosticContext, DiagnosticResult, LogEntry, CrudOp, LogLevel,
} from "./tipos";
import { CRUD_NAMES } from "./tipos";
import { ativarTracer, desativarTracer } from "./tracer";
import { gerarCorrecoes } from "./correcoes";
import { traduzirErro } from "./correcoes";

function gerarId() { return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2); }
function now() { return new Date().toISOString(); }

function makeEntry(level: LogEntry["level"], message: string, duration?: number, details?: string): LogEntry {
  return { id: gerarId(), timestamp: now(), level, message, duration, details };
}

type RunnerOptions = { onLog: (entry: LogEntry) => void };

export class DiagnosticRunner {
  private opts: RunnerOptions;
  private logs: LogEntry[] = [];

  constructor(opts: RunnerOptions) { this.opts = opts; }

  private log(level: LogEntry["level"], message: string, duration?: number, details?: string) {
    const e = makeEntry(level, message, duration, details);
    this.logs.push(e); this.opts.onLog(e);
  }

  getLogs() { return [...this.logs]; }

  private logErrorComCorrecoes(message: string, errorMsg?: string, duration?: number) {
    const correcoes = errorMsg ? gerarCorrecoes(errorMsg) : undefined;
    const msgTraduzida = traduzirErro(message);
    const detailsTraduzido = errorMsg ? traduzirErro(errorMsg) : undefined;
    const e: LogEntry = { id: gerarId(), timestamp: now(), level: "error", message: msgTraduzida, duration, details: detailsTraduzido, correcoes };
    this.logs.push(e); this.opts.onLog(e);
  }

  private criarCtx(plano: DiagnosticPlan, empresaId: string, usuarioId: string, idsIniciais?: Record<string, string | undefined>) {
    const ids: Record<string, string | undefined> = { ...idsIniciais };
    const self = this;
    const ctx: DiagnosticContext = {
      salvarId: (k, v) => { ids[k] = v; },
      recuperarId: (k) => ids[k],
      empresaId, usuarioId,
      dadosTeste: plano.dadosTeste,
      log: (level, message, details) => { self.log(level, message, undefined, details); },
    };
    return { ctx, ids };
  }

  async executarCrudCompleto(plano: DiagnosticPlan, empresaId: string, usuarioId: string): Promise<DiagnosticResult> {
    return this._executar(plano, empresaId, usuarioId, undefined, async (ctx) => {
      for (const op of ["create", "read", "update", "delete"] as CrudOp[]) {
        const fn = plano.crud[op];
        if (!fn) continue;
        const label = CRUD_NAMES[op];
        this.log("info", `▶ ${label}`);
        const s = performance.now();
        try { await fn(ctx); this.log("success", `✓ ${label}`, Math.round(performance.now() - s)); }
        catch (err: any) { this.logErrorComCorrecoes(`✗ ${label}: ${err?.message ?? "erro"}`, err?.message, Math.round(performance.now() - s)); }
      }
    });
  }

  async executarCrudOp(plano: DiagnosticPlan, op: CrudOp, empresaId: string, usuarioId: string, idsIniciais?: Record<string, string | undefined>): Promise<DiagnosticResult> {
    return this._executar(plano, empresaId, usuarioId, idsIniciais, async (ctx) => {
      const fn = plano.crud[op];
      if (!fn) throw new Error(`CRUD '${op}' não definido`);
      const label = CRUD_NAMES[op];
      this.log("info", `▶ ${label}`);
      const s = performance.now();
      try { await fn(ctx); this.log("success", `✓ ${label}`, Math.round(performance.now() - s)); }
      catch (err: any) { this.logErrorComCorrecoes(`✗ ${label}: ${err?.message ?? "erro"}`, err?.message, Math.round(performance.now() - s)); }
    });
  }

  async executarAcao(plano: DiagnosticPlan, acaoKey: string, empresaId: string, usuarioId: string): Promise<DiagnosticResult> {
    const acao = plano.acoes.find((a) => a.key === acaoKey);
    if (!acao) throw new Error(`Ação '${acaoKey}' não encontrada`);
    return this._executar(plano, empresaId, usuarioId, undefined, async (ctx) => {
      this.log("info", `▶ Ação: ${acao.label}`);
      const s = performance.now();
      try {
        await acao.steps(ctx);
        this.log("success", `✓ ${acao.label}`, Math.round(performance.now() - s));
        if (acao.cleanup) {
          this.log("info", `  🧹 Limpando...`);
          await acao.cleanup(ctx).catch((e: any) => this.log("warning", `  ⚠ Cleanup: ${e?.message ?? "erro"}`));
        }
      } catch (err: any) {
        this.logErrorComCorrecoes(`✗ ${acao.label}: ${err?.message ?? "erro"}`, err?.message, Math.round(performance.now() - s));
        if (acao.cleanup) await acao.cleanup(ctx).catch(() => {});
      }
    });
  }

  private async _executar(
    plano: DiagnosticPlan, empresaId: string, usuarioId: string,
    idsIniciais: Record<string, string | undefined> | undefined,
    fn: (ctx: DiagnosticContext) => Promise<void>,
  ): Promise<DiagnosticResult> {
    const startTotal = performance.now();
    const { ctx, ids } = this.criarCtx(plano, empresaId, usuarioId, idsIniciais);

    ativarTracer((e) => { this.logs.push(e); this.opts.onLog(e); });

    try { await fn(ctx); }
    catch (err: any) { this.logErrorComCorrecoes(`✗ ERRO: ${err?.message ?? "desconhecido"}`, err?.message); }
    finally { desativarTracer(); }

    const totalDuration = Math.round(performance.now() - startTotal);
    const passed = this.logs.filter((l) => l.level === "success").length;
    const failed = this.logs.filter((l) => l.level === "error").length;
    this.log("info", `⚡ ${totalDuration}ms | ${passed} OK, ${failed} falha(s)`);

    return { success: failed === 0, logs: this.getLogs(), totalDuration, passedSteps: passed, failedSteps: failed, idsCriados: ids };
  }
}
