import { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { Mail, Phone, TrendingUp, Tag, ArrowLeft, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { EMPRESA_ID } from "~/config/empresa";
import { useLead, useAtualizarLead } from "../hooks/useLeads";
import type { MktgLead } from "../types";

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

export function LeadDetail() {
  const { id } = useParams({ from: "/auth/marketing/leads/$id" });
  const navigate = useNavigate();
  const empresaId = EMPRESA_ID;
  const { data: lead, isLoading } = useLead(id, empresaId);
  const atualizarLead = useAtualizarLead(empresaId);

  const [editarOpen, setEditarOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formOrigem, setFormOrigem] = useState("");
  const [formStatus, setFormStatus] = useState("novo");
  const [formScore, setFormScore] = useState(10);

  useEffect(() => {
    if (lead) {
      setFormNome(lead.nome);
      setFormEmail(lead.email || "");
      setFormTelefone(lead.telefone || "");
      setFormOrigem(lead.origem || "");
      setFormStatus(lead.status);
      setFormScore(lead.score);
    }
  }, [lead]);

  async function handleEditarLead(e: React.FormEvent) {
    e.preventDefault();
    if (!formNome.trim()) return;
    try {
      await atualizarLead.mutateAsync({
        id,
        updates: {
          nome: formNome.trim(),
          email: formEmail.trim(),
          telefone: formTelefone.trim() || null,
          origem: formOrigem.trim() || null,
          status: formStatus as MktgLead["status"],
          score: formScore,
        },
      });
      toast.success("Lead atualizado!");
      setEditarOpen(false);
    } catch {
      toast.error("Erro ao atualizar lead");
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <EmptyState title="Lead não encontrado" description="O lead solicitado não existe ou foi removido." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="xs" onClick={() => navigate({ to: "/marketing/leads" })}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title={lead.nome}
        description={`Lead cadastrado em ${new Date(lead.created_at).toLocaleDateString("pt-BR")}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs text-text-muted mb-1">Status</p>
              <span className={`text-sm px-2 py-1 rounded-full border ${STATUS_COLORS[lead.status] || "bg-surface text-text-muted border-border"}`}>
                {STATUS_LABELS[lead.status] || lead.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Score</p>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                <span className="text-xl font-bold text-text-main">{lead.score}</span>
              </div>
            </div>
            {lead.origem && (
              <div>
                <p className="text-xs text-text-muted mb-1">Origem</p>
                <p className="text-sm text-text-main">{lead.origem}</p>
              </div>
            )}
            {lead.fonte && (
              <div>
                <p className="text-xs text-text-muted mb-1">Fonte</p>
                <p className="text-sm text-text-main">{lead.fonte}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-main">Informações de Contato</h3>
              <Button variant="ghost" size="xs" onClick={() => setEditarOpen(true)}>
                <Edit className="w-3.5 h-3.5" />
                Editar
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lead.email && (
                <div>
                  <p className="text-xs text-text-muted mb-1">E-mail</p>
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                    <Mail size={14} />
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.telefone && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Telefone</p>
                  <a href={`tel:${lead.telefone}`} className="flex items-center gap-2 text-sm text-accent hover:underline">
                    <Phone size={14} />
                    {lead.telefone}
                  </a>
                </div>
              )}
            </div>
            {lead.tags && lead.tags.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                  <Tag size={10} />
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-surface border border-border rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editarOpen} onOpenChange={setEditarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Edit className="h-6 w-6" /></div>
              <div><DialogTitle>Editar Lead</DialogTitle><DialogDescription>Edite as informações básicas do lead.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleEditarLead} className="space-y-4">
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
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <label className="text-xs text-text-muted font-medium">Origem</label>
                <Input
                  value={formOrigem}
                  onChange={(e) => setFormOrigem(e.target.value)}
                  placeholder="Origem"
                />
              </div>
              <div className="space-y-1 col-span-1">
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
              <div className="space-y-1 col-span-1">
                <label className="text-xs text-text-muted font-medium">Score</label>
                <Input
                  type="number"
                  value={formScore}
                  onChange={(e) => setFormScore(Number(e.target.value))}
                  placeholder="Score"
                />
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setEditarOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={atualizarLead.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {atualizarLead.isPending ? "Salvando..." : "Salvar"}
              </button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
