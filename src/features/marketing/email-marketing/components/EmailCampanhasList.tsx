import { useState } from "react";
import { Mail, Plus, Search, Trash2, BarChart3, Send, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { EMPRESA_ID } from "~/config/empresa";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useCampanhas, useCriarCampanha, useExcluirCampanha } from "../hooks/useEmailMarketing";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  agendada: "Agendada",
  enviando: "Enviando",
  enviada: "Enviada",
  pausada: "Pausada",
  cancelada: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  agendada: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enviando: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  enviada: "bg-green-500/10 text-green-400 border-green-500/20",
  pausada: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  cancelada: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function EmailCampanhasList() {
  const empresaId = EMPRESA_ID;
  const { data: campanhas = [], isLoading } = useCampanhas(empresaId);
  const criarCampanha = useCriarCampanha(empresaId);
  const excluirCampanha = useExcluirCampanha(empresaId);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [paraExcluir, setParaExcluir] = useState<{ id: string; nome: string } | null>(null);

  const [novaCampanhaOpen, setNovaCampanhaOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formAssunto, setFormAssunto] = useState("");
  const [formRemetente, setFormRemetente] = useState("");

  async function handleCriarCampanha(e: React.FormEvent) {
    e.preventDefault();
    if (!empresaId || !formNome.trim() || !formAssunto.trim()) return;
    try {
      await criarCampanha.mutateAsync({
        empresa_id: empresaId,
        nome: formNome.trim(),
        assunto: formAssunto.trim(),
        remetente: formRemetente.trim() || "contato@empresa.com.br",
      });
      toast.success("Campanha criada!");
      setNovaCampanhaOpen(false);
      setFormNome("");
      setFormAssunto("");
      setFormRemetente("");
    } catch {
      toast.error("Erro ao criar campanha");
    }
  }

  const filtradas = campanhas.filter((c) => {
    const matchStatus = filtroStatus === "all" || c.status === filtroStatus;
    const matchBusca =
      !busca ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.assunto.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  async function handleExcluir() {
    if (!paraExcluir) return;
    try {
      await excluirCampanha.mutateAsync(paraExcluir.id);
      toast.success("Campanha excluída");
    } catch {
      toast.error("Erro ao excluir campanha");
    }
    setParaExcluir(null);
  }

  const stats = {
    total: campanhas.length,
    enviadas: campanhas.filter((c) => c.status === "enviada").length,
    totalEnviados: campanhas.reduce((acc, c) => acc + (c.total_enviados || 0), 0),
    totalAbertos: campanhas.reduce((acc, c) => acc + (c.total_abertos || 0), 0),
  };

  const taxaAbertura = stats.totalEnviados > 0
    ? Math.round((stats.totalAbertos / stats.totalEnviados) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="E-mail Marketing"
          description="Campanhas e disparos de e-mail"
        />
        <Button size="sm" onClick={() => setNovaCampanhaOpen(true)}>
          <Plus className="w-4 h-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", valor: stats.total, icon: Mail },
          { label: "Enviadas", valor: stats.enviadas, icon: Send },
          { label: "E-mails Enviados", valor: stats.totalEnviados.toLocaleString("pt-BR"), icon: BarChart3 },
          { label: "Taxa de Abertura", valor: `${taxaAbertura}%`, icon: BarChart3 },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className="text-accent" />
              <span className="text-xs text-text-muted">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-text-main">{s.valor}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Buscar por nome ou assunto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {campanhas.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-8 h-8 text-text-muted" />}
          title="Nenhuma campanha criada"
          description="Crie sua primeira campanha de e-mail marketing."
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((campanha) => (
            <Card key={campanha.id} className="hover:border-accent/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-text-main truncate">{campanha.nome}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[campanha.status] || "bg-surface text-text-muted border-border"}`}>
                        {STATUS_LABELS[campanha.status] || campanha.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted truncate">Assunto: {campanha.assunto}</p>
                    <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                      {campanha.total_enviados > 0 && (
                        <>
                          <span>{campanha.total_enviados.toLocaleString("pt-BR")} enviados</span>
                          <span>{campanha.total_abertos} abertos</span>
                          <span>{campanha.total_cliques} cliques</span>
                        </>
                      )}
                      {campanha.agendado_para && campanha.status === "agendada" && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(campanha.agendado_para).toLocaleString("pt-BR")}
                        </span>
                      )}
                      {campanha.enviado_em && (
                        <span>Enviado em: {new Date(campanha.enviado_em).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setParaExcluir(campanha)}
                      className="text-text-muted hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtradas.length === 0 && (
            <EmptyState title="Nenhum resultado" description="Nenhuma campanha com os filtros aplicados." />
          )}
        </div>
      )}

      <Dialog open={novaCampanhaOpen} onOpenChange={setNovaCampanhaOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Mail className="h-6 w-6" /></div>
              <div><DialogTitle>Nova Campanha</DialogTitle><DialogDescription>Crie um rascunho de campanha de e-mail marketing.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriarCampanha} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Nome da Campanha *</label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Newsletter Julho 2026"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Assunto do E-mail *</label>
              <Input
                required
                value={formAssunto}
                onChange={(e) => setFormAssunto(e.target.value)}
                placeholder="Ex: Confira as novidades do mês!"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Remetente</label>
              <Input
                type="email"
                value={formRemetente}
                onChange={(e) => setFormRemetente(e.target.value)}
                placeholder="Ex: marketing@odonto.com"
              />
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovaCampanhaOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={criarCampanha.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {criarCampanha.isPending ? "Criando..." : "Criar Campanha"}
              </button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!paraExcluir} onOpenChange={(o) => !o && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive"><Trash2 className="h-6 w-6" /></div>
              <div><AlertDialogTitle>Excluir Campanha?</AlertDialogTitle><AlertDialogDescription>A campanha "{paraExcluir?.nome}" será removida permanentemente.</AlertDialogDescription></div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="flex-1 sm:flex-none rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-destructive/20 hover:bg-destructive/90 disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
