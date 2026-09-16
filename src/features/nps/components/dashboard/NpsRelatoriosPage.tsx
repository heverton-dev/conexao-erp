import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  RefreshCw,
  FileText,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  X,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { toast } from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import type { NpsRelatorioEnvio } from "../../types";
import { listarRelatorios } from "../../services";

export function NpsRelatoriosPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [relatorios, setRelatorios] = useState<NpsRelatorioEnvio[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<NpsRelatorioEnvio | null>(null);

  useEffect(() => {
    fetchRelatorios();
  }, [dateFrom, dateTo]);

  if (profile && !profile.is_super_admin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2">
          Você não tem permissão para visualizar relatórios de envio.
        </p>
      </div>
    );
  }

  const fetchRelatorios = async () => {
    setLoading(true);
    try {
      const data = await listarRelatorios(dateFrom, dateTo);
      setRelatorios(data);
    } catch {
      toast.error("Erro ao carregar");
    }
    setLoading(false);
  };

  const formatDate = (d: string) =>
    new Date((d || "").slice(0, 10) + "T00:00:00").toLocaleDateString("pt-BR");
  const formatDateTime = (d: string) => new Date(d).toLocaleString("pt-BR");

  const totals = relatorios.reduce(
    (acc, r) => ({
      processado: acc.processado + r.total_processado,
      sucesso: acc.sucesso + r.enviados_sucesso,
      semWhats: acc.semWhats + r.sem_whatsapp,
      menor30: acc.menor30 + r.nps_menor_30,
    }),
    { processado: 0, sucesso: 0, semWhats: 0, menor30: 0 },
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent shrink-0">
            <FileText className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Relatórios de Envios NPS
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Histórico de envios e status de processamento
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRelatorios}
          disabled={loading}
          className="gap-1.5 text-text-muted hover:text-text-main hover:bg-accent/10 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 transition-colors ${loading ? "animate-spin" : ""}`}
          />{" "}
          Atualizar
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 bg-surface p-4 rounded-xl border border-border">
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data Inicial
          </Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full sm:w-[140px] h-10 bg-bg border border-border text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Data Final
          </Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full sm:w-[140px] h-10 bg-bg border border-border text-text-main text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="secondary"
            size="sm"
            className="h-10 rounded-xl"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent border border-accent/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40">
          <div className="flex items-center gap-2 text-accent text-xs uppercase font-medium tracking-wider mb-2">
            <FileText className="w-4 h-4" /> Processados
          </div>
          <div className="text-3xl font-bold text-text-main">
            {totals.processado}
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/40">
          <div className="flex items-center gap-2 text-green-500 text-xs uppercase font-medium tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" /> Enviados
          </div>
          <div className="text-3xl font-bold text-text-main">
            {totals.sucesso}
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent border border-yellow-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/40">
          <div className="flex items-center gap-2 text-yellow-500 text-xs uppercase font-medium tracking-wider mb-2">
            <XCircle className="w-4 h-4" /> Sem WhatsApp
          </div>
          <div className="text-3xl font-bold text-text-main">
            {totals.semWhats}
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border border-red-500/20 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/40">
          <div className="flex items-center gap-2 text-red-500 text-xs uppercase font-medium tracking-wider mb-2">
            <AlertCircle className="w-4 h-4" /> NPS &lt; 30
          </div>
          <div className="text-3xl font-bold text-text-main">
            {totals.menor30}
          </div>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="pt-0 px-0">
          <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 overflow-x-auto overflow-y-auto bg-background/50 h-full w-full custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider">
                  <th className="text-left py-4 px-6 font-semibold">
                    Data Envio
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    Processados
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    Enviados
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    Sem WhatsApp
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    NPS &lt; 30
                  </th>
                  <th className="text-left py-4 px-6 font-semibold">
                    Registrado em
                  </th>
                  <th className="text-center py-4 px-4 font-semibold w-20">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8">
                      <div className="space-y-3 px-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-14 rounded-xl" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : relatorios.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={<FileText className="w-10 h-10 text-text-muted/30" />}
                        title="Nenhum relatório encontrado"
                        description="Tente ajustar os filtros de data para encontrar mais resultados."
                      />
                    </td>
                  </tr>
                ) : (
                  relatorios.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/40 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-text-main">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-accent/10 rounded-lg">
                            <Send className="w-3.5 h-3.5 text-accent" />
                          </div>
                          {formatDate(r.data_envio)}
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 font-medium text-text-main">
                        {r.total_processado}
                      </td>
                      <td className="text-center py-4 px-4 text-green-500 font-medium">
                        {r.enviados_sucesso}
                      </td>
                      <td className="text-center py-4 px-4 text-yellow-500">
                        {r.sem_whatsapp}
                      </td>
                      <td className="text-center py-4 px-4 text-red-500">
                        {r.nps_menor_30}
                      </td>
                      <td className="py-4 px-6 text-text-muted text-xs">
                        {formatDateTime(r.created_at)}
                      </td>
                      <td className="text-center py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent transition-colors"
                          onClick={() => setSelected(r)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>
                  Relatório de {selected && formatDate(selected.data_envio)}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
            <div className="flex-1 overflow-auto rounded-md border border-border bg-white">
            {selected?.html_relatorio ? (
              <iframe
                title="Relatório HTML"
                srcDoc={selected.html_relatorio}
                className="w-full h-[70vh] border-0"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Sem conteúdo HTML disponível.
              </div>
            )}
          </div>
          {selected?.clientes_detalhes && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Ver detalhes textuais
              </summary>
              <pre className="mt-2 p-3 bg-secondary/50 rounded max-h-48 overflow-auto whitespace-pre-wrap">
                {selected.clientes_detalhes}
              </pre>
            </details>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
