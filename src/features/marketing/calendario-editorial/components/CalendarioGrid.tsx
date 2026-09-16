import { useState, useEffect, useMemo } from "react";
import { useAuth } from "~/lib/auth";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { Badge } from "~/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  listarEventos,
  criarEvento,
  atualizarEvento,
  deletarEvento,
} from "../services/calendario.service";
import type {
  CalendarioEvento,
  CalendarioEventoTipo,
  CalendarioEventoStatus,
} from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "react-hot-toast";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CORES_TIPO: Record<string, string> = {
  post_blog: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  email: "bg-green-500/20 text-green-400 border-green-500/30",
  landing_page: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  post_rede: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  criativo: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const LABELS_TIPO: Record<string, string> = {
  post_blog: "Post Blog",
  email: "E-mail",
  landing_page: "Landing Page",
  post_rede: "Post Rede Social",
  criativo: "Criativo",
};

export function CalendarioGrid() {
  const { user, empresa } = useAuth();
  const empresaId = empresa?.id;

  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesRef, setMesRef] = useState(new Date().getMonth());
  const [anoRef, setAnoRef] = useState(new Date().getFullYear());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formTipo, setFormTipo] = useState<CalendarioEventoTipo>("post_blog");
  const [formStatus, setFormStatus] =
    useState<CalendarioEventoStatus>("agendado");
  const [itemParaDeletar, setItemParaDeletar] = useState<CalendarioEvento | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingEvento, setEditingEvento] = useState<CalendarioEvento | null>(null);

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    carregarEventos();
  }, [empresaId, mesRef, anoRef]);

  async function carregarEventos() {
    setLoading(true);
    try {
      const dataInicio = new Date(anoRef, mesRef, 1).toISOString();
      const dataFim = new Date(anoRef, mesRef + 1, 0, 23, 59, 59).toISOString();
      const data = await listarEventos(empresaId!, dataInicio, dataFim);
      setEventos(data);
    } catch {
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }

  const diasDoMes = useMemo(() => {
    const primeiroDia = new Date(anoRef, mesRef, 1).getDay();
    const totalDias = new Date(anoRef, mesRef + 1, 0).getDate();
    return { primeiroDia, totalDias };
  }, [mesRef, anoRef]);

  const eventosPorDia = useMemo(() => {
    const map = new Map<number, CalendarioEvento[]>();
    for (const e of eventos) {
      const dia = new Date(e.data).getDate();
      if (!map.has(dia)) map.set(dia, []);
      map.get(dia)!.push(e);
    }
    return map;
  }, [eventos]);

  function navegar(delta: number) {
    let novoMes = mesRef + delta;
    let novoAno = anoRef;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno--;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno++;
    }
    setMesRef(novoMes);
    setAnoRef(novoAno);
  }

  function abrirDialog(dia: number) {
    setDiaSelecionado(dia);
    setEditingEvento(null);
    setFormTitulo("");
    setFormDescricao("");
    setFormTipo("post_blog");
    setFormStatus("agendado");
    setDialogOpen(true);
  }

  function abrirEditar(ev: CalendarioEvento) {
    const d = new Date(ev.data);
    setDiaSelecionado(d.getDate());
    setEditingEvento(ev);
    setFormTitulo(ev.titulo);
    setFormDescricao(ev.descricao ?? "");
    setFormTipo(ev.tipo);
    setFormStatus(ev.status);
    setDialogOpen(true);
  }

  async function handleCriar() {
    if (!formTitulo.trim() || !empresaId || diaSelecionado === null) return;
    setSaving(true);
    try {
      const dataInicio = new Date(
        anoRef,
        mesRef,
        diaSelecionado,
        12,
        0,
        0,
      ).toISOString();
      await criarEvento({
        empresa_id: empresaId,
        titulo: formTitulo.trim(),
        descricao: formDescricao.trim() || null,
        tipo: formTipo,
        data: dataInicio,
        status: formStatus,
        hora: null,
        plataforma: null,
        responsavel: null,
      });
      toast.success("Evento criado com sucesso");
      setDialogOpen(false);
      carregarEventos();
    } catch {
      toast.error("Erro ao criar evento");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditar() {
    if (!editingEvento || !formTitulo.trim()) return;
    setSaving(true);
    try {
      await atualizarEvento(editingEvento.id, {
        titulo: formTitulo.trim(),
        descricao: formDescricao.trim() || null,
        tipo: formTipo,
        status: formStatus,
      });
      toast.success("Evento atualizado");
      setDialogOpen(false);
      setEditingEvento(null);
      carregarEventos();
    } catch {
      toast.error("Erro ao atualizar evento");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!itemParaDeletar) return;
    try {
      await deletarEvento(itemParaDeletar.id);
      toast.success("Evento excluído");
      setItemParaDeletar(null);
      carregarEventos();
    } catch {
      toast.error("Erro ao excluir evento");
    }
  }

  function eventoDiaSelecionado(): CalendarioEvento[] {
    if (diaSelecionado === null) return [];
    return eventosPorDia.get(diaSelecionado) ?? [];
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Calendário Editorial" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!empresaId) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Calendário Editorial" />
        <EmptyState
          title="Empresa não encontrada"
          description="Selecione uma empresa para continuar."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Calendário Editorial"
        description="Planeje e acompanhe a produção de conteúdo de marketing"
      />

      <div className="rounded-2xl bg-surface border border-border/60 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navegar(-1)}>
              <ChevronLeft size={18} />
            </Button>
            <h2 className="text-lg font-bold text-text-main min-w-[180px] text-center">
              {MESES[mesRef]} {anoRef}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => navegar(1)}>
              <ChevronRight size={18} />
            </Button>
          </div>
          <Button size="sm" onClick={() => abrirDialog(new Date().getDate())}>
            <Plus size={14} />
            Novo Evento
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {DIAS_SEMANA.map((d) => (
            <div
              key={d}
              className="p-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border/30"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: diasDoMes.primeiroDia }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[100px] border-b border-r border-border/20 bg-surface-hover/30"
            />
          ))}
          {Array.from({ length: diasDoMes.totalDias }).map((_, i) => {
            const dia = i + 1;
            const eventosDia = eventosPorDia.get(dia) ?? [];
            const hoje = new Date();
            const isHoje =
              dia === hoje.getDate() &&
              mesRef === hoje.getMonth() &&
              anoRef === hoje.getFullYear();

            return (
              <div
                key={dia}
                onClick={() => abrirDialog(dia)}
                className={`min-h-[100px] p-1.5 border-b border-r border-border/20 cursor-pointer transition-colors hover:bg-surface-hover/50 ${isHoje ? "ring-1 ring-accent/40 ring-inset" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isHoje ? "bg-accent text-white" : "text-text-main"}`}
                  >
                    {dia}
                  </span>
                  {eventosDia.length > 0 && (
                    <span className="text-xs text-text-muted">
                      {eventosDia.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {eventosDia.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[10px] px-1.5 py-0.5 rounded border truncate leading-tight ${CORES_TIPO[ev.tipo]}`}
                      title={ev.titulo}
                    >
                      {ev.titulo}
                    </div>
                  ))}
                  {eventosDia.length > 3 && (
                    <p className="text-[10px] text-text-muted pl-1">
                      +{eventosDia.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Calendar className="h-6 w-6" /></div>
              <div><DialogTitle>{editingEvento ? "Editar Evento" : "Novo Evento"}</DialogTitle><DialogDescription>{diaSelecionado !== null && `${MESES[mesRef]}, ${diaSelecionado} de ${anoRef}`}</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">

          {eventoDiaSelecionado().length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold text-text-muted uppercase">
                Eventos deste dia
              </p>
              {eventoDiaSelecionado().map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-hover/50 border border-border/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${CORES_TIPO[ev.tipo].split(" ")[0]}`}
                      />
                      <p className="text-sm font-medium text-text-main truncate">
                        {ev.titulo}
                      </p>
                    </div>
                    <p className="text-xs text-text-muted ml-4">
                      {LABELS_TIPO[ev.tipo]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => abrirEditar(ev)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost-destructive"
                      size="xs"
                      onClick={() => setItemParaDeletar(ev)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Título
              </label>
              <Input
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
                placeholder="Título do evento"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Descrição
              </label>
              <Input
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                placeholder="Descrição opcional"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Tipo
                </label>
                <Select
                  value={formTipo}
                  onValueChange={(v) => setFormTipo(v as CalendarioEventoTipo)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LABELS_TIPO).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Status
                </label>
                <Select
                  value={formStatus}
                  onValueChange={(v) =>
                    setFormStatus(v as CalendarioEventoStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
              Cancelar
            </button>
            <button
              type="button"
              onClick={editingEvento ? handleEditar : handleCriar}
              disabled={saving || !formTitulo.trim()}
              className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]"
            >
              <Calendar size={14} />
              {editingEvento ? "Salvar Alterações" : "Criar Evento"}
            </button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemParaDeletar} onOpenChange={(o) => !o && setItemParaDeletar(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>
              O evento "{itemParaDeletar?.titulo}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
