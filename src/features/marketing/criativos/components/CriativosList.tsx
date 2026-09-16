import { useState } from "react";
import { Palette, Plus, Search, Trash2, Image, Video, FileImage } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import { useCriativos, useCriarCriativo, useExcluirCriativo } from "../hooks/useCriativos";

const TIPO_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  imagem: Image,
  video: Video,
  banner: FileImage,
};

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-green-500/10 text-green-400 border-green-500/20",
  rascunho: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  arquivado: "bg-surface text-text-muted border-border",
};

export function CriativosList() {
  const empresaId = EMPRESA_ID;
  const { data: criativos = [], isLoading } = useCriativos(empresaId);
  const criarCriativo = useCriarCriativo(empresaId);
  const excluirCriativo = useExcluirCriativo(empresaId);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [paraExcluir, setParaExcluir] = useState<{ id: string; nome: string } | null>(null);

  const [novoCriativoOpen, setNovoCriativoOpen] = useState(false);
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formTipo, setFormTipo] = useState("imagem");

  const filtrados = criativos.filter((c) => {
    const matchTipo = filtroTipo === "all" || c.tipo === filtroTipo;
    const matchBusca =
      !busca || c.nome.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!empresaId || !formNome.trim()) return;
    try {
      await criarCriativo.mutateAsync({
        empresa_id: empresaId,
        nome: formNome.trim(),
        tipo: formTipo,
        descricao: formDescricao.trim() || null,
      });
      toast.success("Criativo criado!");
      setNovoCriativoOpen(false);
      setFormNome("");
      setFormDescricao("");
      setFormTipo("imagem");
    } catch {
      toast.error("Erro ao criar criativo");
    }
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    try {
      await excluirCriativo.mutateAsync(paraExcluir.id);
      toast.success("Criativo excluído");
    } catch {
      toast.error("Erro ao excluir criativo");
    }
    setParaExcluir(null);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Criativos"
          description="Gerencie imagens, vídeos e banners para suas campanhas"
        />
        <Button size="sm" onClick={() => setNovoCriativoOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Criativo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="imagem">Imagem</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {criativos.length === 0 ? (
        <EmptyState
          icon={<Palette className="w-8 h-8 text-text-muted" />}
          title="Nenhum criativo cadastrado"
          description="Adicione imagens, vídeos e banners para suas campanhas de marketing."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtrados.map((criativo) => {
            const TipoIcon = TIPO_ICONS[criativo.tipo] || FileImage;
            return (
              <Card key={criativo.id} className="hover:border-accent/30 transition-colors overflow-hidden">
                {criativo.preview_url ? (
                  <div className="h-32 bg-surface overflow-hidden">
                    <img
                      src={criativo.preview_url}
                      alt={criativo.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-surface flex items-center justify-center">
                    <TipoIcon size={32} className="text-text-muted/30" />
                  </div>
                )}
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-text-main truncate">{criativo.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted capitalize">{criativo.tipo}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[criativo.status] || "bg-surface text-text-muted border-border"}`}>
                          {criativo.status}
                        </span>
                      </div>
                      {criativo.tags && criativo.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {criativo.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-surface border border-border rounded px-1.5 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setParaExcluir(criativo)}
                      className="text-text-muted hover:text-error transition-colors p-1 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filtrados.length === 0 && criativos.length > 0 && (
        <EmptyState title="Nenhum resultado" description="Nenhum criativo com os filtros aplicados." />
      )}

      <Dialog open={novoCriativoOpen} onOpenChange={setNovoCriativoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent"><Palette className="h-6 w-6" /></div>
              <div><DialogTitle>Novo Criativo</DialogTitle><DialogDescription>Adicione um novo criativo de marketing.</DialogDescription></div>
            </div>
          </DialogHeader>
          <div className="px-6 py-6 flex-1 space-y-4">
          <form onSubmit={handleCriar} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Nome *</label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Banner Black Friday"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Descrição</label>
              <Textarea
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                placeholder="Descrição opcional do criativo"
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-medium">Tipo</label>
              <Select value={formTipo} onValueChange={setFormTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imagem">Imagem</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="carrossel">Carrossel</SelectItem>
                  <SelectItem value="texto">Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setNovoCriativoOpen(false)} className="flex-1 sm:flex-none rounded-xl border border-border px-6 py-2.5 text-sm text-text-muted font-semibold hover:text-text-main hover:bg-surface-hover transition-all duration-200 min-h-[44px]">
                Cancelar
              </button>
              <button type="submit" disabled={criarCriativo.isPending} className="flex-1 sm:flex-none rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/20 hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 min-h-[44px]">
                {criarCriativo.isPending ? "Criando..." : "Criar"}
              </button>
            </DialogFooter>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!paraExcluir} onOpenChange={(o) => !o && setParaExcluir(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Criativo?</AlertDialogTitle>
            <AlertDialogDescription>
              O criativo "{paraExcluir?.nome}" será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
