import { useState } from "react";
import { Copy, Check, Trash2, Filter, Loader2, ExternalLink, Download, BarChart3, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
import { Button } from "~/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { useLinks, useDeletarLink, useEditarLink } from "../hooks/useLinks";
import { getCliquesPorLink, getCliquesCSV } from "../services/tracking.service";
import { downloadCSV } from "../utils/csv";
import { QRCodeCanvas } from "qrcode.react";
import type { LinkSalvo, LinkClique } from "../types";
import { useEmpresaSuperAdmin } from "~/components/shared/useEmpresaSuperAdmin";
import { EmpresaSuperAdminSelector } from "~/components/shared/EmpresaSuperAdminSelector";
import { useCan } from "~/core/auth";

const TIPO_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  utm: "UTM",
  google_review: "Google Review",
  google_maps: "Google Maps",
  waze: "Waze",
  qrcode: "QR Code",
};

const TIPO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "utm", label: "UTM" },
  { value: "google_review", label: "Google Review" },
  { value: "google_maps", label: "Google Maps" },
  { value: "waze", label: "Waze" },
  { value: "qrcode", label: "QR Code" },
];

export function HistoricoList() {
  const { empresaId, empresas, empresaSelecionada, setEmpresaSelecionada, isSuperAdmin } = useEmpresaSuperAdmin();
  const podeEditar = useCan("lk_editar");
  const podeExcluir = useCan("lk_excluir");
  const { data: links, isLoading } = useLinks();
  const deletarLink = useDeletarLink();
  const editarLink = useEditarLink();
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [busca, setBusca] = useState("");
  const [itemParaDeletar, setItemParaDeletar] = useState<LinkSalvo | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [linkCliques, setLinkCliques] = useState<{ link: LinkSalvo; cliques: LinkClique[] } | null>(null);
  const [carregandoCliques, setCarregandoCliques] = useState(false);
  const [cliquesMap, setCliquesMap] = useState<Record<string, number>>({});
  const [editandoLink, setEditandoLink] = useState<LinkSalvo | null>(null);
  const [editTitulo, setEditTitulo] = useState("");

  const filtrados = (links || []).filter((link) => {
    const matchTipo = filtroTipo === "all" || link.tipo === filtroTipo;
    const matchBusca =
      !busca ||
      link.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      link.url_gerada.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  async function handleCopiar(texto: string, id: string) {
    await navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    toast.success("Copiado!");
    setTimeout(() => setCopiadoId(null), 2000);
  }

  async function handleConfirmDelete() {
    if (!itemParaDeletar) return;
    try {
      await deletarLink.mutateAsync(itemParaDeletar.id);
      toast.success("Link excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
    setItemParaDeletar(null);
  }

  async function handleVerCliques(link: LinkSalvo) {
    setCarregandoCliques(true);
    try {
      const cliques = await getCliquesPorLink(link.id);
      setLinkCliques({ link, cliques });
    } catch {
      toast.error("Erro ao carregar cliques");
    }
    setCarregandoCliques(false);
  }

  async function handleExportCliques(linkId: string, titulo: string) {
    try {
      const dados = await getCliquesCSV(linkId);
      downloadCSV(
        `cliques-${titulo.slice(0, 20)}.csv`,
        ["Data", "User-Agent", "Referrer", "IP"],
        dados.map((d) => [d.data, d.user_agent, d.ref, d.ip]),
      );
      toast.success("CSV exportado!");
    } catch {
      toast.error("Erro ao exportar");
    }
  }

  function handleStartEdit(link: LinkSalvo) {
    setEditandoLink(link);
    setEditTitulo(link.titulo);
  }

  async function handleSaveEdit() {
    if (!editandoLink || !editTitulo.trim()) return;
    try {
      await editarLink.mutateAsync({ id: editandoLink.id, titulo: editTitulo.trim() });
      toast.success("Título atualizado!");
      setEditandoLink(null);
    } catch {
      toast.error("Erro ao atualizar");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <>
        <PageHeader title="Histórico de Links" description="Links gerados e salvos anteriormente" />
        <EmptyState
          icon={<Filter className="w-8 h-8 text-text-muted" />}
          title="Nenhum link salvo"
          description="Os links que você gerar e salvar aparecerão aqui."
        />
      </>
    );
  }

  const trackingBase = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <PageHeader title="Histórico de Links" description="Links gerados e salvos anteriormente" />

      <div className="flex flex-col sm:flex-row gap-3">
        {isSuperAdmin && empresas.length > 0 && (
          <EmpresaSuperAdminSelector
            empresas={empresas}
            value={empresaSelecionada}
            onChange={setEmpresaSelecionada}
          />
        )}
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPO_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Buscar por título ou URL..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-3">
        {filtrados.map((link) => {
          const trackingUrl = `${trackingBase}/r/${link.id}`;
          return (
            <Card key={link.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold bg-accent/15 text-accent border border-accent/20">
                        {TIPO_LABEL[link.tipo] || link.tipo}
                      </span>
                      <p className="text-sm font-semibold text-text-main truncate">{link.titulo}</p>
                    </div>
                    <p className="text-xs font-mono text-accent break-all">{trackingUrl}</p>
                    <p className="text-[11px] text-text-muted/60">
                      {new Date(link.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleCopiar(trackingUrl, `track-${link.id}`)}
                      className="text-text-muted hover:text-accent transition-colors p-1"
                      title="Copiar URL de tracking"
                    >
                      {copiadoId === `track-${link.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopiar(link.url_gerada, link.id)}
                      className="text-text-muted hover:text-text-main transition-colors p-1"
                      title="Copiar URL original"
                    >
                      {copiadoId === link.id ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    </button>
                    {podeEditar && (
                      <button
                        onClick={() => handleStartEdit(link)}
                        className="text-text-muted hover:text-accent transition-colors p-1"
                        title="Editar título"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleVerCliques(link)}
                      className="text-text-muted hover:text-blue transition-colors p-1"
                      title="Ver cliques"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportCliques(link.id, link.titulo)}
                      className="text-text-muted hover:text-green transition-colors p-1"
                      title="Exportar cliques CSV"
                    >
                      <Download size={14} />
                    </button>
                    {podeExcluir && (
                      <button
                        onClick={() => setItemParaDeletar(link)}
                        className="text-text-muted hover:text-error transition-colors p-1"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtrados.length === 0 && (
        <EmptyState
          title="Nenhum resultado"
          description="Nenhum link encontrado com os filtros atuais."
        />
      )}

      <Dialog
        open={!!editandoLink}
        onOpenChange={(o) => !o && setEditandoLink(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Pencil className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>Editar link</DialogTitle>
                <DialogDescription>Altere o título do link salvo.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">Título</label>
              <Input
                value={editTitulo}
                onChange={(e) => setEditTitulo(e.target.value)}
                placeholder="Novo título do link"
              />
            </div>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setEditandoLink(null)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</button>
            <button type="button" onClick={handleSaveEdit} disabled={!editTitulo.trim() || editarLink.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemParaDeletar}
        onOpenChange={(o) => !o && setItemParaDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir link?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O link "{itemParaDeletar?.titulo}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!linkCliques}
        onOpenChange={(o) => !o && setLinkCliques(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle>Cliques: {linkCliques?.link.titulo}</DialogTitle>
                <DialogDescription>Estatísticas de cliques do link.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          {carregandoCliques ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : linkCliques && linkCliques.cliques.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">Nenhum clique registrado neste link</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  Total: <span className="font-semibold text-text-main">{linkCliques?.cliques.length}</span> cliques
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (linkCliques) handleExportCliques(linkCliques.link.id, linkCliques.link.titulo);
                  }}
                >
                  <Download className="w-4 h-4" /> CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="py-2 pr-3 text-left font-medium">Data</th>
                      <th className="py-2 pr-3 text-left font-medium">Origem</th>
                      <th className="py-2 pr-3 text-left font-medium">Dispositivo</th>
                      <th className="py-2 text-left font-medium">Navegador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkCliques?.cliques.map((c) => {
                      const ua = c.user_agent;
                      const device = ua?.includes("Mobile") ? "Mobile" : ua?.includes("Tablet") ? "Tablet" : "Desktop";
                      const isChrome = ua?.includes("Chrome");
                      const isSafari = ua?.includes("Safari") && !ua?.includes("Chrome");
                      const isFirefox = ua?.includes("Firefox");
                      const browser = isChrome ? "Chrome" : isFirefox ? "Firefox" : isSafari ? "Safari" : "—";
                      return (
                        <tr key={c.id} className="border-b border-border-subtle">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {new Date(c.clique_em).toLocaleString("pt-BR")}
                          </td>
                          <td className="py-2 pr-3 max-w-[120px] truncate">{c.ref || "direto"}</td>
                          <td className="py-2 pr-3">{device}</td>
                          <td className="py-2">{browser}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
