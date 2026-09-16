import { useState } from "react";
import { Users, Plus, Search, Trash2, Eye, TrendingUp, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { useNavigate } from "@tanstack/react-router";
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
import { useLeads, useCriarLead, useExcluirLead } from "../hooks/useLeads";
import { EMPRESA_ID } from "~/config/empresa";

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  contato: "Em Contato",
  qualificado: "Qualificado",
  proposta: "Proposta",
  convertido: "Convertido",
  perdido: "Perdido",
};

const STATUS_COLORS: Record<string, string> = {
  novo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contato: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  qualificado: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  proposta: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  convertido: "bg-green-500/10 text-green-400 border-green-500/20",
  perdido: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function LeadsList() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const empresaId = EMPRESA_ID ?? "";
  const { data: leads = [], isLoading } = useLeads(empresaId);
  const criarLead = useCriarLead(empresaId);
  const excluirLead = useExcluirLead(empresaId);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [paraExcluir, setParaExcluir] = useState<{ id: string; nome: string } | null>(null);

  const [novoLeadOpen, setNovoLeadOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formOrigem, setFormOrigem] = useState("");
  const [formStatus, setFormStatus] = useState("novo");

  async function handleCriarLead(e: React.FormEvent) {
    e.preventDefault();
    if (!empresaId || !formNome.trim()) return;
    try {
      await criarLead.mutateAsync({
        empresa_id: empresaId,
        nome: formNome.trim(),
        email: formEmail.trim() || null,
        telefone: formTelefone.trim() || null,
        origem: formOrigem.trim() || null,
        status: formStatus,
      });
      toast.success("Lead criado com sucesso!");
      setNovoLeadOpen(false);
      setFormNome("");
      setFormEmail("");
      setFormTelefone("");
      setFormOrigem("");
      setFormStatus("novo");
    } catch {
      toast.error("Erro ao criar lead");
    }
  }

  const filtrados = leads.filter((l) => {
    const matchStatus = filtroStatus === "all" || l.status === filtroStatus;
    const matchBusca =
      !busca ||
      l.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  async function handleExcluir() {
    if (!paraExcluir) return;
    try {
      await excluirLead.mutateAsync(paraExcluir.id);
      toast.success("Lead excluído");
    } catch {
      toast.error("Erro ao excluir lead");
    }
    setParaExcluir(null);
  }

  const stats = {
    total: leads.length,
    novos: leads.filter((l) => l.status === "novo").length,
    qualificados: leads.filter((l) => l.status === "qualificado").length,
    convertidos: leads.filter((l) => l.status === "convertido").length,
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Leads"
          description="Gestão e qualificação de leads de marketing"
        />
        <Button size="sm" onClick={() => setNovoLeadOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", valor: stats.total, icon: Users, color: "text-accent" },
          { label: "Novos", valor: stats.novos, icon: Plus, color: "text-blue-400" },
          { label: "Qualificados", valor: stats.qualificados, icon: TrendingUp, color: "text-purple-400" },
          { label: "Convertidos", valor: stats.convertidos, icon: TrendingUp, color: "text-green-400" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} />
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
            placeholder="Buscar por nome ou e-mail..."
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

      {leads.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-text-muted" />}
          title="Nenhum lead cadastrado"
          description="Os leads capturados via formulários e landing pages aparecerão aqui."
        />
      ) : (
        <div className="space-y-2">
          {filtrados.map((lead) => (
            <Card key={lead.id} className="hover:border-accent/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-text-main truncate">{lead.nome}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] || "bg-surface text-text-muted border-border"}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                      {lead.score > 0 && (
                        <span className="text-xs text-text-muted">Score: {lead.score}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={10} />
                          {lead.email}
                        </span>
                      )}
                      {lead.telefone && (
                        <span className="flex items-center gap-1">
                          <Phone size={10} />
                          {lead.telefone}
                        </span>
                      )}
                      {lead.origem && <span>Origem: {lead.origem}</span>}
                      <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="xs"
                      title="Ver detalhe"
                      onClick={() => navigate({ to: "/marketing/leads/$id", params: { id: lead.id } })}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <button
                      onClick={() => setParaExcluir(lead)}
                      className="text-text-muted hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtrados.length === 0 && (
            <EmptyState title="Nenhum resultado" description="Nenhum lead com os filtros aplicados." />
          )}
        </div>
      )}

      <Dialog open={novoLeadOpen} onOpenChange={setNovoLeadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Users className="h-6 w-6" /></div>
              <div><DialogTitle>Novo Lead</DialogTitle><DialogDescription>Cadastre as informações básicas do novo lead.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriarLead} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Nome *</label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Nome completo do lead"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">E-mail</label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="exemplo@empresa.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Telefone</label>
              <Input
                value={formTelefone}
                onChange={(e) => setFormTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Origem</label>
                <Input
                  value={formOrigem}
                  onChange={(e) => setFormOrigem(e.target.value)}
                  placeholder="Ex: Instagram, Indicação"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Status</label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovoLeadOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={criarLead.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {criarLead.isPending ? "Salvando..." : "Salvar"}
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
              <div><AlertDialogTitle>Excluir Lead?</AlertDialogTitle><AlertDialogDescription>O lead "{paraExcluir?.nome}" será removido permanentemente.</AlertDialogDescription></div>
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
