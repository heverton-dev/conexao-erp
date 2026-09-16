import { useState, useEffect } from "react";
import { Globe, Plus, Search, Trash2, Eye, FileText } from "lucide-react";
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
import { dispararEventoModulo } from "~/core/services/webhooks";
import * as lpService from "../services/landing-pages.service";
import type { LandingPage } from "../types";

const MODULO_KEY = "mktg-landing-pages";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  publicada: "Publicada",
  arquivada: "Arquivada",
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  publicada: "bg-green-500/10 text-green-400 border-green-500/20",
  arquivada: "bg-surface text-text-muted border-border",
};

export function LandingPagesList() {
  const empresaId = EMPRESA_ID;
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [paraExcluir, setParaExcluir] = useState<LandingPage | null>(null);

  const [novaPgOpen, setNovaPgOpen] = useState(false);
  const [formTitulo, setFormTitulo] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTemplate, setFormTemplate] = useState("padrao");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    lpService.listarLandingPages(empresaId)
      .then(setPages)
      .catch(() => toast.error("Erro ao carregar landing pages"))
      .finally(() => setCarregando(false));
  }, [empresaId]);

  async function handleCriarLP(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitulo.trim() || !formSlug.trim()) return;
    setSalvando(true);
    try {
      const data = await lpService.criarLandingPage(
        empresaId,
        formTitulo.trim(),
        formTemplate
      );
      if (data) {
        setPages((prev) => [data, ...prev]);
        toast.success("Landing page criada!");
        dispararEventoModulo(MODULO_KEY, "pagina.criada", { lp_id: data.id, titulo: formTitulo, slug: formSlug }).catch(() => {});
      }
      setNovaPgOpen(false);
      setFormTitulo("");
      setFormSlug("");
      setFormTemplate("padrao");
    } catch {
      toast.error("Erro ao criar landing page");
    } finally {
      setSalvando(false);
    }
  }

  const filtradas = pages.filter((p) => {
    const matchStatus = filtroStatus === "all" || p.status === filtroStatus;
    const matchBusca =
      !busca ||
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      p.slug.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  async function handleExcluir() {
    if (!paraExcluir) return;
    await lpService.deletarLandingPage(paraExcluir.id);
    setPages((prev) => prev.filter((p) => p.id !== paraExcluir.id));
    toast.success("Landing page excluída");
    setParaExcluir(null);
  }

  if (carregando) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Landing Pages"
          description="Criação e gerenciamento de landing pages"
        />
        <Button size="sm" onClick={() => setNovaPgOpen(true)}>
          <Plus className="w-4 h-4" />
          Nova Landing Page
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Buscar por título ou slug..."
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

      {pages.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-text-muted" />}
          title="Nenhuma landing page criada"
          description="Crie sua primeira landing page para capturar leads."
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((page) => (
            <Card key={page.id} className="hover:border-accent/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-text-main truncate">{page.titulo}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[page.status] || "bg-surface text-text-muted border-border"}`}>
                        {STATUS_LABELS[page.status] || page.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Globe size={10} />
                        /{page.slug}
                      </span>
                      {page.template && <span>Template: {page.template}</span>}
                      <span>v{page.versao_atual}</span>
                      {page.publicado_em && (
                        <span>Publicado em: {new Date(page.publicado_em).toLocaleDateString("pt-BR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="xs" title="Visualizar">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <button
                      onClick={() => setParaExcluir(page)}
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
            <EmptyState title="Nenhum resultado" description="Nenhuma landing page com os filtros aplicados." />
          )}
        </div>
      )}

      <Dialog open={novaPgOpen} onOpenChange={setNovaPgOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Globe className="h-6 w-6" /></div>
              <div><DialogTitle>Nova Landing Page</DialogTitle><DialogDescription>Crie uma nova página de captura para campanhas.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriarLP} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Título da Página *</label>
              <Input
                required
                value={formTitulo}
                onChange={(e) => {
                  setFormTitulo(e.target.value);
                  setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"));
                }}
                placeholder="Ex: Black Friday 2026"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Caminho da URL (Slug) *</label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-text-muted font-mono select-none">/</span>
                <Input
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="black-friday-2026"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Template Visual</label>
              <Select value={formTemplate} onValueChange={setFormTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padrao">Layout Padrão (Captura)</SelectItem>
                  <SelectItem value="contato">Fale Conosco</SelectItem>
                  <SelectItem value="evento">Inscrição de Webinar/Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovaPgOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {salvando ? "Criando..." : "Criar Landing Page"}
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
              <div><AlertDialogTitle>Excluir Landing Page?</AlertDialogTitle><AlertDialogDescription>A landing page "{paraExcluir?.titulo}" será removida permanentemente.</AlertDialogDescription></div>
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
