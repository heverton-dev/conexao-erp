import { useState, useEffect } from "react";
import { Crosshair, Plus, Trash2, Copy, Check, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "~/lib/auth";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/ui/empty-state";
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { dispararEventoModulo } from "~/core/services/webhooks";
import * as pixelsService from "../services/pixels.service";
import type { MarketingPixel } from "../types";
import { EMPRESA_ID } from "~/config/empresa";
const MODULO_KEY = "mktg-pixels";

const TIPO_INFO: Record<string, { label: string; color: string; bg: string }> = {
  meta: { label: "Meta Pixel", color: "text-blue-400", bg: "bg-blue-500/10" },
  google_analytics: { label: "Google Analytics", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  gtm: { label: "Google Tag Manager", color: "text-green-400", bg: "bg-green-500/10" },
  tiktok: { label: "TikTok Pixel", color: "text-pink-400", bg: "bg-pink-500/10" },
  linkedin: { label: "LinkedIn Insight", color: "text-blue-300", bg: "bg-blue-300/10" },
  outros: { label: "Outros", color: "text-text-muted", bg: "bg-surface" },
};

export function PixelsList() {
  const { profile } = useAuth();
  const [pixels, setPixels] = useState<MarketingPixel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paraExcluir, setParaExcluir] = useState<MarketingPixel | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const [novoPixelOpen, setNovoPixelOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formPixelId, setFormPixelId] = useState("");
  const [formTipo, setFormTipo] = useState("meta");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!EMPRESA_ID) {
      setCarregando(false);
      return;
    }
    pixelsService.listarPixels(EMPRESA_ID)
      .then(setPixels)
      .catch(() => toast.error("Erro ao carregar pixels"))
      .finally(() => setCarregando(false));
  }, [EMPRESA_ID]);

  async function handleCriarPixel(e: React.FormEvent) {
    e.preventDefault();
    if (!EMPRESA_ID || !formNome.trim() || !formPixelId.trim()) return;
    setSalvando(true);
    try {
      const data = await pixelsService.criarPixel({
        empresa_id: EMPRESA_ID,
        nome: formNome.trim(),
        pixel_id: formPixelId.trim(),
        tipo: formTipo as MarketingPixel["tipo"],
        ativo: true,
      });
      if (data) {
        setPixels((prev) => [data, ...prev]);
        toast.success("Pixel adicionado com sucesso!");
        dispararEventoModulo(MODULO_KEY, "evento.registrado", { pixel_id: data.id, nome: formNome, tipo: formTipo, empresa_id: EMPRESA_ID }).catch(() => {});
      }
      setNovoPixelOpen(false);
      setFormNome("");
      setFormPixelId("");
      setFormTipo("meta");
    } catch {
      toast.error("Erro ao adicionar pixel");
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggle(pixel: MarketingPixel) {
    const novoAtivo = !pixel.ativo;
    await pixelsService.atualizarPixel(pixel.id, { ativo: novoAtivo });
    setPixels((prev) =>
      prev.map((p) => (p.id === pixel.id ? { ...p, ativo: novoAtivo } : p))
    );
    toast.success(novoAtivo ? "Pixel ativado" : "Pixel desativado");
    dispararEventoModulo(MODULO_KEY, "evento.registrado", { pixel_id: pixel.id, nome: pixel.nome, ativo: novoAtivo, empresa_id: pixel.empresa_id }).catch(() => {});
  }

  async function handleCopiar(id: string) {
    await navigator.clipboard.writeText(id);
    setCopiado(id);
    toast.success("ID copiado!");
    setTimeout(() => setCopiado(null), 2000);
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    await pixelsService.deletarPixel(paraExcluir.id);
    setPixels((prev) => prev.filter((p) => p.id !== paraExcluir.id));
    toast.success("Pixel excluído");
    setParaExcluir(null);
  }

  if (carregando) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Pixels de Rastreamento"
          description="Configure pixels para rastrear conversões e audiências"
        />
        <Button size="sm" onClick={() => setNovoPixelOpen(true)}>
          <Plus className="w-4 h-4" />
          Adicionar Pixel
        </Button>
      </div>

      {pixels.length === 0 ? (
        <EmptyState
          icon={<Crosshair className="w-8 h-8 text-text-muted" />}
          title="Nenhum pixel configurado"
          description="Adicione pixels do Meta, Google Analytics, TikTok e outros para rastrear conversões."
        />
      ) : (
        <div className="space-y-3">
          {pixels.map((pixel) => {
            const info = TIPO_INFO[pixel.tipo] || TIPO_INFO.outros;
            return (
              <Card key={pixel.id} className={`transition-colors ${pixel.ativo ? "hover:border-accent/30" : "opacity-60"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg ${info.bg} flex items-center justify-center shrink-0`}>
                        <Crosshair size={18} className={info.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-text-main">{pixel.nome}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${info.bg} ${info.color}`}>
                            {info.label}
                          </span>
                          {!pixel.ativo && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-muted border border-border">
                              Inativo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-text-muted font-mono truncate">ID: {pixel.pixel_id}</p>
                          <button
                            onClick={() => handleCopiar(pixel.pixel_id)}
                            className="text-text-muted hover:text-accent transition-colors"
                          >
                            {copiado === pixel.pixel_id ? (
                              <Check size={11} className="text-green-500" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggle(pixel)}
                        className={`transition-colors ${pixel.ativo ? "text-accent" : "text-text-muted"}`}
                        title={pixel.ativo ? "Desativar" : "Ativar"}
                      >
                        {pixel.ativo ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button
                        onClick={() => setParaExcluir(pixel)}
                        className="text-text-muted hover:text-error transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={novoPixelOpen} onOpenChange={setNovoPixelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Crosshair className="h-6 w-6" /></div>
              <div><DialogTitle>Novo Pixel</DialogTitle><DialogDescription>Adicione um novo pixel de rastreamento para sua empresa.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriarPixel} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Nome do Pixel *</label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Pixel Facebook Oficial"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">Plataforma</label>
                <Select value={formTipo} onValueChange={setFormTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta">Meta Pixel</SelectItem>
                    <SelectItem value="google_analytics">Google Analytics</SelectItem>
                    <SelectItem value="gtm">Google Tag Manager</SelectItem>
                    <SelectItem value="tiktok">TikTok Pixel</SelectItem>
                    <SelectItem value="linkedin">LinkedIn Insight</SelectItem>
                    <SelectItem value="outros">Outros / Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-muted font-medium">ID do Pixel *</label>
                <Input
                  required
                  value={formPixelId}
                  onChange={(e) => setFormPixelId(e.target.value)}
                  placeholder="ID numérico ou tag"
                />
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovoPixelOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {salvando ? "Adicionando..." : "Adicionar Pixel"}
              </button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!paraExcluir} onOpenChange={(o: boolean) => !o && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive"><Trash2 className="h-6 w-6" /></div>
              <div><AlertDialogTitle>Excluir Pixel?</AlertDialogTitle><AlertDialogDescription>O pixel "{paraExcluir?.nome}" será removido permanentemente.</AlertDialogDescription></div>
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
