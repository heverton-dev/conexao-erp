import { useState } from "react";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { Badge } from "~/components/ui/badge";
import { auditarUrl } from "../services/auditoria.service";
import type { SeoAuditoriaResultado, SeoIssue } from "../types";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Globe,
} from "lucide-react";
import { toast } from "react-hot-toast";

const severityConfig = {
  erro: {
    icon: XCircle,
    color: "text-error",
    bg: "bg-error/10",
    border: "border-error/20",
    label: "Erro",
  },
  aviso: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "Aviso",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Info",
  },
};

function calcularScore(issues: SeoIssue[]): number {
  const pesos: Record<string, number> = { error: -15, warning: -5, info: 0 };
  let score = 100;
  for (const issue of issues) {
    score += pesos[issue.tipo] ?? 0;
  }
  return Math.max(0, Math.min(100, score));
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}

export function SeoAuditoria() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<SeoAuditoriaResultado | null>(
    null,
  );
  const [auditou, setAuditou] = useState(false);

  async function handleAuditar() {
    if (!url.trim()) {
      toast.error("Informe uma URL para auditar");
      return;
    }
    let urlNormalizada = url.trim();
    if (!/^https?:\/\//i.test(urlNormalizada)) {
      urlNormalizada = `https://${urlNormalizada}`;
    }
    setLoading(true);
    setAuditou(true);
    try {
      const result = await auditarUrl(urlNormalizada);
      setResultado(result);
    } catch {
      toast.error("Erro ao executar auditoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Auditoria SEO"
        description="Analise páginas e receba sugestões de otimização para mecanismos de busca"
      />

      <div className="flex items-end gap-3 mb-8">
        <div className="flex-1 max-w-xl">
          <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
            URL da página
          </label>
          <Input
            placeholder="https://exemplo.com/pagina"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuditar()}
            disabled={loading}
          />
        </div>
        <Button onClick={handleAuditar} loading={loading} className="h-11">
          <Search size={16} />
          Auditar
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      )}

      {!loading && !auditou && (
        <EmptyState
          icon={<Search className="w-10 h-10 text-text-muted/30" />}
          title="Nenhuma auditoria realizada"
          description="Insira uma URL acima e clique em Auditar para analisar a página."
        />
      )}

      {!loading && auditou && !resultado && (
        <EmptyState
          icon={<XCircle className="w-10 h-10 text-error" />}
          title="Erro ao auditar"
          description="Não foi possível completar a auditoria. Verifique a URL e tente novamente."
        />
      )}

      {!loading && resultado && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface border border-border/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-text-main">
                  Score Geral
                </h2>
                <p className="text-sm text-text-muted mt-0.5 truncate max-w-md">
                  {resultado.url}
                </p>
              </div>
              <div
                className={`text-5xl font-black ${getScoreColor(calcularScore(resultado.issues))}`}
              >
                {calcularScore(resultado.issues)}
              </div>
            </div>
            <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${calcularScore(resultado.issues) >= 80 ? "bg-success" : calcularScore(resultado.issues) >= 50 ? "bg-warning" : "bg-error"}`}
                style={{ width: `${calcularScore(resultado.issues)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-error">
                  {resultado.issues.filter((i) => i.tipo === "erro").length}
                </p>
                <p className="text-xs text-text-muted">Erros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {resultado.issues.filter((i) => i.tipo === "aviso").length}
                </p>
                <p className="text-xs text-text-muted">Avisos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {resultado.issues.filter((i) => i.tipo === "info").length}
                </p>
                <p className="text-xs text-text-muted">Info</p>
              </div>
            </div>
          </div>

          {resultado.titulo && (
            <div className="rounded-2xl bg-surface border border-border/60 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text-main">
                Dados da Página
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-text-muted">Title:</span>
                  <span className="text-text-main ml-2">
                    {resultado.titulo}
                  </span>
                </div>
                {resultado.meta_description && (
                  <div>
                    <span className="text-text-muted">Meta Description:</span>
                    <span className="text-text-main ml-2">
                      {resultado.meta_description}
                    </span>
                  </div>
                )}
                {resultado.h1 && (
                  <div>
                    <span className="text-text-muted">H1:</span>
                    <span className="text-text-main ml-2">{resultado.h1}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-main">
              Issues Encontradas ({resultado.issues.length})
            </h3>
            {resultado.issues.map((issue, i) => {
              const config = severityConfig[issue.tipo];
              const Icon = config.icon;
              return (
                <div
                  key={i}
                  className={`rounded-2xl ${config.bg} border ${config.border} p-5 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      size={20}
                      className={`${config.color} mt-0.5 shrink-0`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            issue.tipo === "erro"
                              ? "destructive"
                              : issue.tipo === "aviso"
                                ? "warning"
                                : "default"
                          }
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-text-main">
                        {issue.mensagem}
                      </p>
                      {issue.tag && (
                        <p className="text-xs text-text-muted mt-1 font-mono">
                          Elemento: {issue.tag}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
