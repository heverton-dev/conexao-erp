import { useState, useEffect } from "react";
import { Copy, Check, Trash2, Filter, Link, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
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
import { listarUtms, criarUtm, deletarUtm } from "../services/utm.service";
import type { Utm } from "../../types";
import { EMPRESA_ID } from "~/config/empresa";
const UTM_SOURCES = [
  { value: "all", label: "Todos" },
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "E-mail" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "direct", label: "Direct" },
  { value: "organic", label: "Orgânico" },
];

export function UtmHistory() {
  const { profile } = useAuth();
  const [utms, setUtms] = useState<Utm[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroSource, setFiltroSource] = useState("all");
  const [busca, setBusca] = useState("");
  const [itemParaDeletar, setItemParaDeletar] = useState<Utm | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const [novaUtmOpen, setNovaUtmOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formSource, setFormSource] = useState("google");
  const [formMedium, setFormMedium] = useState("cpc");
  const [formCampaign, setFormCampaign] = useState("");
  const [formTerm, setFormTerm] = useState("");
  const [formContent, setFormContent] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!EMPRESA_ID) {
        setCarregando(false);
        return;
    }
    listarUtms(EMPRESA_ID)
      .then(setUtms)
      .catch(() => toast.error("Erro ao carregar UTMs"))
      .finally(() => setCarregando(false));
  }, [EMPRESA_ID]);

  async function handleCriarUtm(e: React.FormEvent) {
    e.preventDefault();
    if (!EMPRESA_ID || !formNome.trim() || !formUrl.trim() || !formCampaign.trim()) return;
    setSalvando(true);
    try {
      const data = await criarUtm({
        empresa_id: EMPRESA_ID,
        nome: formNome.trim(),
        url_destino: formUrl.trim(),
        utm_source: formSource,
        utm_medium: formMedium,
        utm_campaign: formCampaign.trim(),
        utm_term: formTerm.trim() || null,
        utm_content: formContent.trim() || null,
      });
      setUtms((prev) => [data, ...prev]);
      toast.success("UTM criada com sucesso!");
      setNovaUtmOpen(false);
      setFormNome("");
      setFormUrl("");
      setFormSource("google");
      setFormMedium("cpc");
      setFormCampaign("");
      setFormTerm("");
      setFormContent("");
    } catch {
      toast.error("Erro ao criar UTM");
    } finally {
      setSalvando(false);
    }
  }

  const filtradas = utms.filter((utm) => {
    const matchSource =
      filtroSource === "all" || utm.utm_source === filtroSource;
    const matchBusca =
      !busca ||
      utm.nome.toLowerCase().includes(busca.toLowerCase()) ||
      utm.url_destino.toLowerCase().includes(busca.toLowerCase());
    return matchSource && matchBusca;
  });

  async function handleCopiar(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiadoId(id);
      toast.success("URL copiada!");
      setTimeout(() => setCopiadoId(null), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  }

  async function handleConfirmDelete() {
    if (!itemParaDeletar) return;
    try {
      await deletarUtm(itemParaDeletar.id);
      setUtms((prev) => prev.filter((u) => u.id !== itemParaDeletar.id));
      toast.success("UTM excluída");
    } catch {
      toast.error("Erro ao excluir UTM");
    }
    setItemParaDeletar(null);
  }

  if (carregando) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Histórico de UTMs"
          description="URLs com parâmetros UTM geradas anteriormente"
        />
        <Button size="sm" onClick={() => setNovaUtmOpen(true)}>
          <Plus className="w-4 h-4" />
          Nova UTM
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          <Select
            value={filtroSource}
            onValueChange={setFiltroSource}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UTM_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Buscar por nome ou URL..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {utms.length === 0 ? (
        <EmptyState
          icon={<Link className="w-8 h-8 text-text-muted" />}
          title="Nenhuma UTM salva"
          description="As UTMs que você gerar e salvar aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {filtradas.map((utm) => (
            <Card key={utm.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-text-main truncate">
                      {utm.nome}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {utm.url_destino}
                    </p>
                    <div className="flex items-center gap-3 text-xs mt-1">
                      <span className="inline-flex items-center gap-1 bg-surface border border-border rounded-md px-2 py-0.5">
                        source: {utm.utm_source}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-surface border border-border rounded-md px-2 py-0.5">
                        medium: {utm.utm_medium}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-surface border border-border rounded-md px-2 py-0.5">
                        campaign: {utm.utm_campaign}
                      </span>
                      <span className="text-text-muted">
                        {new Date(utm.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-text-muted truncate mt-1">
                      {utm.url_destino}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleCopiar(utm.url_destino, utm.id)}
                    >
                      {copiadoId === utm.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <button
                      onClick={() => setItemParaDeletar(utm)}
                      className="text-text-muted hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtradas.length === 0 && utms.length > 0 && (
        <EmptyState
          title="Nenhum resultado"
          description="Nenhuma UTM encontrada com os filtros atuais."
        />
      )}

      <Dialog open={novaUtmOpen} onOpenChange={setNovaUtmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Link className="h-6 w-6" /></div>
              <div><DialogTitle>Nova UTM</DialogTitle><DialogDescription>Crie uma URL com parâmetros UTM para rastreamento.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriarUtm} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Nome *</label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Campanha Instagram Julho"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">URL de Destino *</label>
              <Input
                required
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://exemplo.com/pagina"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Source *</label>
                <Select value={formSource} onValueChange={setFormSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="organic">Orgânico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Medium</label>
                <Select value={formMedium} onValueChange={setFormMedium}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpc">CPC</SelectItem>
                    <SelectItem value="cpm">CPM</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="organic">Orgânico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Campanha *</label>
              <Input
                required
                value={formCampaign}
                onChange={(e) => setFormCampaign(e.target.value)}
                placeholder="Ex: promocao_outono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Termo (opcional)</label>
                <Input
                  value={formTerm}
                  onChange={(e) => setFormTerm(e.target.value)}
                  placeholder="Palavra-chave"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Conteúdo (opcional)</label>
                <Input
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="headline-a"
                />
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovaUtmOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {salvando ? "Criando..." : "Criar UTM"}
              </button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!itemParaDeletar}
        onOpenChange={(o: boolean) => !o && setItemParaDeletar(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir UTM?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A UTM "{itemParaDeletar?.nome}"
              será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
